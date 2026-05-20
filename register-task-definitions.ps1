# =============================================================================
#  Cloud Health — Register ECS Task Definitions
# =============================================================================
#  Ce script :
#    1. Récupère ton AWS Account ID automatiquement
#    2. Demande (ou prend en paramètre) les endpoints des 3 bases
#    3. Crée le rôle ecsTaskExecutionRole s'il n'existe pas
#    4. Substitue les placeholders dans les JSON (ACCOUNT_ID, endpoints)
#    5. Enregistre les 4 task definitions sur ECS via CLI
#
#  Usage :
#    .\register-task-definitions.ps1
#       (mode interactif, te demande les endpoints un par un)
#
#    .\register-task-definitions.ps1 `
#       -RdsMysqlEndpoint     "cloudhealth-db-patients.xxxx.eu-west-3.rds.amazonaws.com" `
#       -RdsPostgresEndpoint  "cloudhealth-db-rendezvous.xxxx.eu-west-3.rds.amazonaws.com" `
#       -DocDbEndpoint        "cloudhealth-docdb-cluster.cluster-xxxx.eu-west-3.docdb.amazonaws.com"
# =============================================================================

[CmdletBinding()]
param(
    [string]$Region = "eu-west-3",
    [string]$RdsMysqlEndpoint,
    [string]$RdsPostgresEndpoint,
    [string]$DocDbEndpoint,
    [string]$AppSecret = "",
    [string]$TaskDefDir = "./aws/task-definitions"
)

$ErrorActionPreference = "Stop"

function Write-Step    { param($Msg) Write-Host "`n==> $Msg" -ForegroundColor Cyan }
function Write-Success { param($Msg) Write-Host "    [OK] $Msg" -ForegroundColor Green }
function Write-Info    { param($Msg) Write-Host "    [INFO] $Msg" -ForegroundColor Gray }
function Write-Err     { param($Msg) Write-Host "    [ERROR] $Msg" -ForegroundColor Red }

# =============================================================================
#  Étape 1 : Récupération automatique de l'Account ID
# =============================================================================

Write-Step "Récupération de l'Account ID via AWS CLI"

$callerIdentity = aws sts get-caller-identity --output json 2>&1 | ConvertFrom-Json
if (-not $callerIdentity.Account) {
    Write-Err "Impossible de récupérer l'identité AWS. Vérifie 'aws configure'."
    exit 1
}
$AccountId = $callerIdentity.Account
Write-Success "Account ID : $AccountId"
Write-Success "Region     : $Region"

# =============================================================================
#  Étape 2 : Saisie interactive des endpoints si non fournis
# =============================================================================

if (-not $RdsMysqlEndpoint) {
    Write-Host ""
    $RdsMysqlEndpoint = Read-Host "Endpoint RDS MySQL (cloudhealth-db-patients.*)"
}
if (-not $RdsPostgresEndpoint) {
    $RdsPostgresEndpoint = Read-Host "Endpoint RDS PostgreSQL (cloudhealth-db-rendezvous.*)"
}
if (-not $DocDbEndpoint) {
    $DocDbEndpoint = Read-Host "Endpoint DocumentDB cluster (cloudhealth-docdb-cluster.cluster-*)"
}

# Validation basique
if ($RdsMysqlEndpoint    -notmatch '\.rds\.amazonaws\.com$')   { Write-Err "Endpoint MySQL invalide";    exit 1 }
if ($RdsPostgresEndpoint -notmatch '\.rds\.amazonaws\.com$')   { Write-Err "Endpoint Postgres invalide"; exit 1 }
if ($DocDbEndpoint       -notmatch '\.docdb\.amazonaws\.com$') { Write-Err "Endpoint DocDB invalide";    exit 1 }

# Génère un APP_SECRET aléatoire si non fourni
if (-not $AppSecret) {
    $AppSecret = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
    Write-Info "APP_SECRET généré : $AppSecret"
}

Write-Success "Endpoint MySQL    : $RdsMysqlEndpoint"
Write-Success "Endpoint Postgres : $RdsPostgresEndpoint"
Write-Success "Endpoint DocDB    : $DocDbEndpoint"

# =============================================================================
#  Étape 3 : Création du rôle IAM ecsTaskExecutionRole si absent
# =============================================================================

Write-Step "Vérification du rôle IAM ecsTaskExecutionRole"

$roleExists = aws iam get-role --role-name ecsTaskExecutionRole --output json 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Info "Le rôle n'existe pas, création en cours..."

    $trustPolicy = @"
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": { "Service": "ecs-tasks.amazonaws.com" },
      "Action": "sts:AssumeRole"
    }
  ]
}
"@
    $trustPolicy | Out-File -Encoding ASCII -FilePath "trust-policy.json"

    aws iam create-role `
        --role-name ecsTaskExecutionRole `
        --assume-role-policy-document file://trust-policy.json `
        --output json | Out-Null

    aws iam attach-role-policy `
        --role-name ecsTaskExecutionRole `
        --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy

    Remove-Item trust-policy.json -Force
    Write-Success "Rôle ecsTaskExecutionRole créé et policy attachée"

    Write-Info "Attente de la propagation du rôle (10s)..."
    Start-Sleep -Seconds 10
} else {
    Write-Success "Rôle ecsTaskExecutionRole existe déjà"
}

# =============================================================================
#  Étape 4 : Substitution des placeholders et enregistrement des task definitions
# =============================================================================

Write-Step "Substitution des placeholders et enregistrement des Task Definitions"

# Crée un dossier temporaire pour les JSON résolus
$TmpDir = Join-Path $env:TEMP "cloudhealth-taskdefs-$(Get-Random)"
New-Item -ItemType Directory -Path $TmpDir -Force | Out-Null

$TaskFiles = @(
    "kafka-task.json",
    "ms-patients-task.json",
    "ms-rendezvous-task.json",
    "ms-dossiers-task.json"
)

$RegisteredArns = @()

foreach ($file in $TaskFiles) {
    $sourcePath = Join-Path $TaskDefDir $file
    $tmpPath    = Join-Path $TmpDir $file

    if (-not (Test-Path $sourcePath)) {
        Write-Err "Fichier introuvable : $sourcePath"
        exit 1
    }

    # Lecture + substitution des placeholders
    $content = Get-Content $sourcePath -Raw

    $content = $content -replace '<ACCOUNT_ID>',             $AccountId
    $content = $content -replace '<RDS_MYSQL_ENDPOINT>',     $RdsMysqlEndpoint
    $content = $content -replace '<RDS_POSTGRES_ENDPOINT>',  $RdsPostgresEndpoint
    $content = $content -replace '<DOCDB_CLUSTER_ENDPOINT>', $DocDbEndpoint

    # Substitution du APP_SECRET pour ms-patients
    if ($file -eq "ms-patients-task.json") {
        $content = $content -replace 'CHANGE_ME_32_CHARS_RANDOM_STRING_FOR_SYMFONY_SECRET', $AppSecret
    }

    Set-Content -Path $tmpPath -Value $content -Encoding UTF8

    Write-Step "Enregistrement de $file"
    $result = aws ecs register-task-definition `
        --cli-input-json file://$tmpPath `
        --region $Region `
        --output json 2>&1 | ConvertFrom-Json

    if ($LASTEXITCODE -ne 0 -or -not $result.taskDefinition) {
        Write-Err "Échec enregistrement de $file"
        Write-Err "Sortie : $result"
        exit 1
    }

    $arn = $result.taskDefinition.taskDefinitionArn
    $RegisteredArns += $arn
    Write-Success "Enregistré : $arn"
}

# Nettoyage du dossier temporaire
Remove-Item $TmpDir -Recurse -Force

# =============================================================================
#  Étape 5 : Récapitulatif
# =============================================================================

Write-Host "`n=============================================" -ForegroundColor Green
Write-Host "  TASK DEFINITIONS ENREGISTRÉES " -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""
foreach ($arn in $RegisteredArns) {
    Write-Host "  $arn"
}

Write-Host ""
Write-Host "Console ECS : https://$Region.console.aws.amazon.com/ecs/v2/task-definitions?region=$Region" -ForegroundColor Yellow
Write-Host ""
Write-Host "Prochaine étape : Création des 4 services ECS dans le cluster cloudhealth-cluster" -ForegroundColor Magenta
Write-Host "  1. cloudhealth-kafka-service        (avec Service Discovery: kafka.cloud-health.local)"
Write-Host "  2. cloudhealth-ms-patients-service  (derrière tg-ms-patients)"
Write-Host "  3. cloudhealth-ms-rendezvous-service (derrière tg-ms-rendezvous)"
Write-Host "  4. cloudhealth-ms-dossiers-service  (derrière tg-ms-dossiers)"
Write-Host ""
