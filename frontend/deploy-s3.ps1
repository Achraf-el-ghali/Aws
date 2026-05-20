# ============================================================
# Deploy Angular Frontend to S3 + invalidate CloudFront
# ============================================================
# Prerequisites :
#   1. AWS CLI configured (aws configure)
#   2. Bucket S3 created (private, with OAC)
#   3. CloudFront distribution created (with S3 origin via OAC)
#
# Usage :
#   .\deploy-s3.ps1 -BucketName "cloud-health-frontend" -DistributionId "EXXXXXXXXXXXXX"
# ============================================================

param(
    [Parameter(Mandatory=$true)]
    [string]$BucketName,

    [Parameter(Mandatory=$false)]
    [string]$DistributionId = ""
)

$ErrorActionPreference = "Stop"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Deploy Angular to S3 + CloudFront" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

# 1. Build Angular in production mode
Write-Host "`n[1/3] Building Angular (production)..." -ForegroundColor Yellow
npm run build -- --configuration=production
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed!" -ForegroundColor Red
    exit 1
}

$DistPath = "dist/cloud-health/browser"
if (-not (Test-Path $DistPath)) {
    Write-Host "Build output not found at $DistPath" -ForegroundColor Red
    exit 1
}

# 2. Sync to S3
Write-Host "`n[2/3] Uploading to s3://$BucketName ..." -ForegroundColor Yellow

# Static assets (cache 1 year)
aws s3 sync "$DistPath/" "s3://$BucketName/" `
    --delete `
    --cache-control "public, max-age=31536000, immutable" `
    --exclude "index.html" `
    --exclude "*.txt"

# index.html (no cache, always fresh)
aws s3 cp "$DistPath/index.html" "s3://$BucketName/index.html" `
    --cache-control "no-cache, no-store, must-revalidate" `
    --content-type "text/html"

# 3. Invalidate CloudFront cache (if distribution ID provided)
if ($DistributionId) {
    Write-Host "`n[3/3] Invalidating CloudFront cache..." -ForegroundColor Yellow
    aws cloudfront create-invalidation `
        --distribution-id $DistributionId `
        --paths "/*" | Out-Null
    Write-Host "CloudFront invalidation created." -ForegroundColor Green
} else {
    Write-Host "`n[3/3] Skipped CloudFront invalidation (no DistributionId provided)" -ForegroundColor Gray
}

Write-Host "`n============================================" -ForegroundColor Green
Write-Host "  Deployment complete!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
