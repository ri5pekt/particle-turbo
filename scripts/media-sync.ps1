# media-sync.ps1 — Quick media-only export/import (no DB)
# Export: .\scripts\media-sync.ps1 -Direction export
# Import: .\scripts\media-sync.ps1 -Direction import

param([ValidateSet("export","import")][string]$Direction = "export")

$Root     = Split-Path $PSScriptRoot -Parent
$LocalDir = Join-Path $Root "backups\strapi-uploads-latest"

if ($Direction -eq "export") {
    Write-Host "Exporting Strapi uploads -> $LocalDir" -ForegroundColor Yellow
    New-Item -ItemType Directory -Force -Path $LocalDir | Out-Null
    docker compose cp content:/workspace/apps/content/public/uploads $LocalDir
    Write-Host "  OK. Copy backups\strapi-uploads-latest\ to the new machine." -ForegroundColor Green
} else {
    if (-not (Test-Path $LocalDir)) {
        Write-Host "ERROR: $LocalDir not found. Run export first." -ForegroundColor Red
        exit 1
    }
    Write-Host "Importing uploads -> Strapi container..." -ForegroundColor Yellow
    docker compose cp $LocalDir content:/workspace/apps/content/public/uploads
    Write-Host "  OK." -ForegroundColor Green
}
