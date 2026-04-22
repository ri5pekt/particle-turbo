# db-import.ps1
# Restores Medusa + Strapi databases and uploads from a backups/ export.
# Run from the project root: .\scripts\db-import.ps1 -Tag 2026-01-01_12-00
#
# IMPORTANT: Run AFTER docker compose --profile apps up (databases must be running).
# This will WIPE existing data and replace it with the dump.

param(
    [Parameter(Mandatory=$true)]
    [string]$Tag
)

$Root       = Split-Path $PSScriptRoot -Parent
$Backups    = Join-Path $Root "backups"
$MedusaDump = Join-Path $Backups "medusa_$Tag.sql"
$StrapiDump = Join-Path $Backups "strapi_$Tag.sql"
$UploadsDir = Join-Path $Backups "strapi-uploads_$Tag"

# Validate files exist
foreach ($f in @($MedusaDump, $StrapiDump)) {
    if (-not (Test-Path $f)) {
        Write-Host "ERROR: File not found: $f" -ForegroundColor Red
        Write-Host "Available backups:" -ForegroundColor Yellow
        Get-ChildItem $Backups -Filter "*.sql" | ForEach-Object { Write-Host "  $($_.Name)" }
        exit 1
    }
}

Write-Host ""
Write-Host "=== particle-turbo DB import — $Tag ===" -ForegroundColor Cyan
Write-Host "WARNING: This will WIPE and replace both databases." -ForegroundColor Red
$confirm = Read-Host "Type YES to continue"
if ($confirm -ne "YES") { Write-Host "Aborted."; exit 0 }
Write-Host ""

# ---------------------------------------------------------------------------
# 1. Medusa database
# ---------------------------------------------------------------------------
Write-Host "Restoring Medusa DB from $MedusaDump ..." -ForegroundColor Yellow

# Drop and recreate
docker compose exec -T postgres-commerce psql -U medusa -c "DROP DATABASE IF EXISTS medusa_db;" postgres
docker compose exec -T postgres-commerce psql -U medusa -c "CREATE DATABASE medusa_db;" postgres

# Restore
Get-Content $MedusaDump -Raw | docker compose exec -T postgres-commerce psql -U medusa -d medusa_db

if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✔ Medusa restored" -ForegroundColor Green
} else {
    Write-Host "  ✘ Medusa restore FAILED" -ForegroundColor Red
    exit 1
}

# ---------------------------------------------------------------------------
# 2. Strapi database
# ---------------------------------------------------------------------------
Write-Host "Restoring Strapi DB from $StrapiDump ..." -ForegroundColor Yellow

docker compose exec -T postgres-content psql -U strapi -c "DROP DATABASE IF EXISTS strapi_db;" postgres
docker compose exec -T postgres-content psql -U strapi -c "CREATE DATABASE strapi_db;" postgres

Get-Content $StrapiDump -Raw | docker compose exec -T postgres-content psql -U strapi -d strapi_db

if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✔ Strapi restored" -ForegroundColor Green
} else {
    Write-Host "  ✘ Strapi restore FAILED" -ForegroundColor Red
    exit 1
}

# ---------------------------------------------------------------------------
# 3. Strapi uploads
# ---------------------------------------------------------------------------
if (Test-Path $UploadsDir) {
    Write-Host "Restoring Strapi uploads from $UploadsDir ..." -ForegroundColor Yellow
    docker compose cp $UploadsDir content:/workspace/apps/content/public/uploads
    Write-Host "  ✔ Uploads restored" -ForegroundColor Green
} else {
    Write-Host "  ⚠ No uploads folder found at $UploadsDir — skipping media restore" -ForegroundColor DarkYellow
}

# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------
Write-Host ""
Write-Host "=== Import complete ===" -ForegroundColor Cyan
Write-Host "Restart the app containers to apply:"
Write-Host "  docker compose --profile apps restart" -ForegroundColor Gray
Write-Host ""
