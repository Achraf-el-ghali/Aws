# =============================================================================
#  Cloud Health — ECR Build & Push Automation Script
# =============================================================================
#  Ce script :
#    1. Vérifie que AWS CLI et Docker sont installés et configurés
#    2. Crée les repositories ECR s'ils n'existent pas
#    3. Authentifie Docker auprès d'ECR
#    4. Build chaque image avec --platform linux/amd64 (compatibilité Fargate)
#    5. Tag et push sur ECR
#
#  Pré-requis :
#    - AWS CLI v2 installé (aws configure exécuté avec les Access Keys IAM)
#    - Docker Desktop installé et démarré
#    - Exécuter à la racine du projet : c:\Users\HP ULTRA\Desktop\Aws2
#
#  Usage :
#    .\deploy-ecr.ps1
#    .\deploy-ecr.ps1 -Region eu-west-3 -Tag v1.0.0
#    .\deploy-ecr.ps1 -SkipBuild   # Push uniquement (si déjà buildé)
# =============================================================================

[CmdletBinding()]
param(
    [string]$Region = "eu-west-3",
    [string]$Tag = "latest",
    [switch]$SkipBuild,
    [switch]$SkipKafka
)

$ErrorActionPreference = "Stop"

# ----- Couleurs et helpers -----
function Write-Step    { param($Msg) Write-Host "`n==> $Msg" -ForegroundColor Cyan }
function Write-Success { param($Msg) Write-Host "    [OK] $Msg" -ForegroundColor Green }
function Write-Info    { param($Msg) Write-Host "    [INFO] $Msg" -ForegroundColor Gray }
function Write-Warn    { param($Msg) Write-Host "    [WARN] $Msg" -ForegroundColor Yellow }
function Write-Err     { param($Msg) Write-Host "    [ERROR] $Msg" -ForegroundColor Red }

# Configuration des microservices à déployer
$Services = @(
    @{
        Name       = "cloudhealth-ms-patients"
        Context    = "./ms-patients"
        Dockerfile = "./ms-patients/Dockerfile"
    },
    @{
        Name       = "cloudhealth-ms-rendezvous"
        Context    = "./ms-rendezvous"
        Dockerfile = "./ms-rendezvous/Dockerfile"
    },
    @{
        Name       = "cloudhealth-ms-dossiers"
        Context    = "./ms-dossiers"
        Dockerfile = "./ms-dossiers/Dockerfile"
    }
)

# Kafka : on utilise l'image officielle Confluent (pas besoin de build)
# On la "mirror" sur ECR pour avoir une référence stable et privée
$KafkaSourceImage     = "confluentinc/cp-kafka:7.5.0"
$ZookeeperSourceImage = "confluentinc/cp-zookeeper:7.5.0"

# =============================================================================
#  Étape 1 : Vérifications préalables
# =============================================================================

Write-Step "Vérification des prérequis"

# AWS CLI
try {
    $awsVersion = aws --version 2>&1
    Write-Success "AWS CLI : $awsVersion"
} catch {
    Write-Err "AWS CLI non installé. Télécharge-le depuis https://awscli.amazonaws.com/AWSCLIV2.msi"
    exit 1
}

# Docker
try {
    $dockerVersion = docker --version 2>&1
    Write-Success "Docker  : $dockerVersion"
} catch {
    Write-Err "Docker non installé ou non démarré."
    exit 1
}

# Docker daemon running ?
docker info 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Err "Docker daemon n'est pas démarré. Ouvre Docker Desktop."
    exit 1
}

# AWS credentials configurées ?
Write-Step "Vérification des identifiants AWS (région: $Region)"
$callerIdentity = aws sts get-caller-identity --output json 2>&1 | ConvertFrom-Json
if (-not $callerIdentity.Account) {
    Write-Err "Identifiants AWS invalides. Lance : aws configure"
    Write-Err "Tu dois fournir : Access Key ID, Secret Access Key, Region ($Region), Output (json)"
    exit 1
}

$AccountId = $callerIdentity.Account
$EcrRegistry = "$AccountId.dkr.ecr.$Region.amazonaws.com"

Write-Success "Account ID  : $AccountId"
Write-Success "User/Role   : $($callerIdentity.Arn)"
Write-Success "ECR Registry: $EcrRegistry"

# =============================================================================
#  Étape 2 : Authentification Docker -> ECR
# =============================================================================

Write-Step "Authentification Docker auprès d'ECR"

aws ecr get-login-password --region $Region | docker login --username AWS --password-stdin $EcrRegistry
if ($LASTEXITCODE -ne 0) {
    Write-Err "Échec de l'authentification ECR. Vérifie tes droits IAM (AmazonEC2ContainerRegistryFullAccess)."
    exit 1
}
Write-Success "Docker authentifié sur $EcrRegistry"

# =============================================================================
#  Étape 3 : Création des repositories ECR (si absents)
# =============================================================================

Write-Step "Création / vérification des repositories ECR"

$AllRepos = @()
$AllRepos += $Services | ForEach-Object { $_.Name }
if (-not $SkipKafka) {
    $AllRepos += "cloudhealth-kafka"
    $AllRepos += "cloudhealth-zookeeper"
}

foreach ($repo in $AllRepos) {
    $exists = aws ecr describe-repositories --repository-names $repo --region $Region 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Info "Repo existe déjà : $repo"
    } else {
        aws ecr create-repository `
            --repository-name $repo `
            --region $Region `
            --image-scanning-configuration scanOnPush=true `
            --image-tag-mutability MUTABLE `
            --output json | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Repo créé : $repo"
        } else {
            Write-Err "Échec création du repo $repo"
            exit 1
        }
    }
}

# =============================================================================
#  Étape 4 : Build, Tag et Push des microservices
# =============================================================================

if ($SkipBuild) {
    Write-Warn "Mode -SkipBuild activé. Les images ne seront pas rebuilées."
} else {
    Write-Step "Build des images microservices (--platform linux/amd64)"
    Write-Info "Cette étape peut prendre 5-15 minutes selon ta connexion."
}

foreach ($svc in $Services) {
    $name       = $svc.Name
    $context    = $svc.Context
    $dockerfile = $svc.Dockerfile
    $localTag   = "${name}:${Tag}"
    $remoteTag  = "${EcrRegistry}/${name}:${Tag}"

    if (-not $SkipBuild) {
        Write-Step "Build $name"
        docker buildx build `
            --platform linux/amd64 `
            --file $dockerfile `
            --tag $localTag `
            --load `
            $context
        if ($LASTEXITCODE -ne 0) {
            Write-Err "Échec build de $name"
            exit 1
        }
        Write-Success "$name buildé"
    }

    Write-Step "Tag & Push $name -> ECR"
    docker tag $localTag $remoteTag
    if ($LASTEXITCODE -ne 0) { Write-Err "Échec tag de $name"; exit 1 }

    docker push $remoteTag
    if ($LASTEXITCODE -ne 0) { Write-Err "Échec push de $name"; exit 1 }

    Write-Success "$name poussé sur ECR : $remoteTag"
}

# =============================================================================
#  Étape 5 : Mirror Kafka & Zookeeper depuis Docker Hub vers ECR
# =============================================================================

if (-not $SkipKafka) {
    Write-Step "Mirror de Kafka et Zookeeper depuis Docker Hub vers ECR"
    Write-Info "On pull les images officielles Confluent puis on les tag/push vers ECR."

    # Kafka
    Write-Step "Pull $KafkaSourceImage (--platform linux/amd64)"
    docker pull --platform linux/amd64 $KafkaSourceImage
    if ($LASTEXITCODE -ne 0) { Write-Err "Échec pull Kafka"; exit 1 }

    $kafkaRemote = "${EcrRegistry}/cloudhealth-kafka:${Tag}"
    docker tag $KafkaSourceImage $kafkaRemote
    docker push $kafkaRemote
    if ($LASTEXITCODE -ne 0) { Write-Err "Échec push Kafka"; exit 1 }
    Write-Success "Kafka poussé : $kafkaRemote"

    # Zookeeper
    Write-Step "Pull $ZookeeperSourceImage (--platform linux/amd64)"
    docker pull --platform linux/amd64 $ZookeeperSourceImage
    if ($LASTEXITCODE -ne 0) { Write-Err "Échec pull Zookeeper"; exit 1 }

    $zkRemote = "${EcrRegistry}/cloudhealth-zookeeper:${Tag}"
    docker tag $ZookeeperSourceImage $zkRemote
    docker push $zkRemote
    if ($LASTEXITCODE -ne 0) { Write-Err "Échec push Zookeeper"; exit 1 }
    Write-Success "Zookeeper poussé : $zkRemote"
}

# =============================================================================
#  Étape 6 : Récapitulatif
# =============================================================================

Write-Host "`n=============================================" -ForegroundColor Green
Write-Host "  DÉPLOIEMENT ECR TERMINÉ AVEC SUCCÈS " -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Account ID  : $AccountId"
Write-Host "Region      : $Region"
Write-Host "Tag         : $Tag"
Write-Host ""
Write-Host "Images disponibles sur ECR :" -ForegroundColor Cyan
foreach ($svc in $Services) {
    Write-Host "  - $EcrRegistry/$($svc.Name):$Tag"
}
if (-not $SkipKafka) {
    Write-Host "  - $EcrRegistry/cloudhealth-kafka:$Tag"
    Write-Host "  - $EcrRegistry/cloudhealth-zookeeper:$Tag"
}

Write-Host ""
Write-Host "Vérifie dans la console : https://$Region.console.aws.amazon.com/ecr/repositories?region=$Region" -ForegroundColor Yellow
Write-Host ""
Write-Host "Prochaine étape : Étape 4 — Création des bases de données RDS et DocumentDB" -ForegroundColor Magenta
Write-Host ""
