# db-import.ps1 — Run from project root: .\scripts\db-import.ps1 -Tag 2026-04-23_00-29
# WARNING: wipes existing data and replaces it with the dump.

param([Parameter(Mandatory=$true)][string]$Tag)

$Root       = Split-Path $PSScriptRoot -Parent
$Backups    = Join-Path $Root "backups"
$MedusaDump = Join-Path $Backups ("medusa_" + $Tag + ".sql")
$StrapiDump = Join-Path $Backups ("strapi_" + $Tag + ".sql")
$UploadsDir = Join-Path $Backups ("strapi-uploads_" + $Tag)

foreach ($f in @($MedusaDump, $StrapiDump)) {
    if (-not (Test-Path $f)) {
        Write-Host "ERROR: not found: $f" -ForegroundColor Red
        Write-Host "Available SQL files in backups/:"
        Get-ChildItem $Backups -Filter "*.sql" | ForEach-Object { Write-Host "  $($_.Name)" }
        exit 1
    }
}

Write-Host ""
Write-Host "DB import $Tag" -ForegroundColor Cyan
Write-Host "WARNING: this will WIPE and replace both databases." -ForegroundColor Red
$confirm = Read-Host "Type YES to continue"
if ($confirm -ne "YES") { Write-Host "Aborted."; exit 0 }
Write-Host ""

Write-Host "Restoring Medusa DB..." -ForegroundColor Yellow
docker compose exec -T postgres-commerce psql -U medusa -c "DROP DATABASE IF EXISTS medusa_db;" postgres
docker compose exec -T postgres-commerce psql -U medusa -c "CREATE DATABASE medusa_db;" postgres
Get-Content $MedusaDump -Raw | docker compose exec -T postgres-commerce psql -U medusa -d medusa_db
if ($LASTEXITCODE -ne 0) { Write-Host "FAILED" -ForegroundColor Red; exit 1 }
Write-Host "  OK Medusa restored" -ForegroundColor Green

Write-Host "Restoring Strapi DB..." -ForegroundColor Yellow
docker compose exec -T postgres-content psql -U strapi -c "DROP DATABASE IF EXISTS strapi_db;" postgres
docker compose exec -T postgres-content psql -U strapi -c "CREATE DATABASE strapi_db;" postgres
Get-Content $StrapiDump -Raw | docker compose exec -T postgres-content psql -U strapi -d strapi_db
if ($LASTEXITCODE -ne 0) { Write-Host "FAILED" -ForegroundColor Red; exit 1 }
Write-Host "  OK Strapi restored" -ForegroundColor Green

if (Test-Path $UploadsDir) {
    Write-Host "Restoring Strapi uploads..." -ForegroundColor Yellow
    docker compose cp $UploadsDir content:/workspace/apps/content/public/uploads
    Write-Host "  OK uploads restored" -ForegroundColor Green
} else {
    Write-Host "  No uploads folder found at $UploadsDir - skipping" -ForegroundColor DarkYellow
}

Write-Host ""
Write-Host "Import complete. Restart app containers:" -ForegroundColor Cyan
Write-Host "  docker compose --profile apps restart" -ForegroundColor Gray
Write-Host ""
