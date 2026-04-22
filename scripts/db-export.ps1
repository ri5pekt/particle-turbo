# db-export.ps1
# Dumps both Postgres databases (Medusa + Strapi) and copies Strapi uploads to backups/
# Run from the project root: .\scripts\db-export.ps1

param(
    [string]$Tag = (Get-Date -Format "yyyy-MM-dd_HH-mm")
)

$Root     = Split-Path $PSScriptRoot -Parent
$Backups  = Join-Path $Root "backups"

New-Item -ItemType Directory -Force -Path $Backups | Out-Null

Write-Host ""
Write-Host "=== particle-turbo DB export — $Tag ===" -ForegroundColor Cyan
Write-Host ""

# ---------------------------------------------------------------------------
# 1. Medusa (commerce) database
# ---------------------------------------------------------------------------
$MedusaDump = Join-Path $Backups "medusa_$Tag.sql"
Write-Host "Dumping Medusa DB → $MedusaDump" -ForegroundColor Yellow

docker compose exec -T postgres-commerce `
    pg_dump -U medusa -d medusa_db --no-owner --no-acl `
    | Out-File -FilePath $MedusaDump -Encoding utf8

if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✔ Medusa dump complete" -ForegroundColor Green
} else {
    Write-Host "  ✘ Medusa dump FAILED" -ForegroundColor Red
    exit 1
}

# ---------------------------------------------------------------------------
# 2. Strapi (content) database
# ---------------------------------------------------------------------------
$StrapiDump = Join-Path $Backups "strapi_$Tag.sql"
Write-Host "Dumping Strapi DB → $StrapiDump" -ForegroundColor Yellow

docker compose exec -T postgres-content `
    pg_dump -U strapi -d strapi_db --no-owner --no-acl `
    | Out-File -FilePath $StrapiDump -Encoding utf8

if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✔ Strapi dump complete" -ForegroundColor Green
} else {
    Write-Host "  ✘ Strapi dump FAILED" -ForegroundColor Red
    exit 1
}

# ---------------------------------------------------------------------------
# 3. Strapi uploads (media library)
# ---------------------------------------------------------------------------
$UploadsDir = Join-Path $Backups "strapi-uploads_$Tag"
Write-Host "Copying Strapi uploads → $UploadsDir" -ForegroundColor Yellow

docker compose cp content:/workspace/apps/content/public/uploads $UploadsDir 2>$null

if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✔ Uploads copied" -ForegroundColor Green
} else {
    Write-Host "  ⚠ Uploads folder empty or not found (ok if no media uploaded yet)" -ForegroundColor DarkYellow
}

# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------
Write-Host ""
Write-Host "=== Export complete ===" -ForegroundColor Cyan
Write-Host "Files in backups/:"
Get-ChildItem $Backups | Where-Object { $_.Name -like "*$Tag*" } | ForEach-Object {
    Write-Host "  $($_.Name)"
}
Write-Host ""
Write-Host "Copy the backups/ folder to the new machine, then run:" -ForegroundColor Gray
Write-Host "  .\scripts\db-import.ps1 -Tag $Tag" -ForegroundColor Gray
Write-Host ""
