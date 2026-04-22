# media-sync.ps1
# Copies Strapi's uploaded media out of the Docker container to backups/strapi-uploads-latest/
# Useful for a quick media-only sync without a full DB export.
# Run from the project root: .\scripts\media-sync.ps1

param(
    [ValidateSet("export","import")]
    [string]$Direction = "export"
)

$Root      = Split-Path $PSScriptRoot -Parent
$LocalDir  = Join-Path $Root "backups\strapi-uploads-latest"

if ($Direction -eq "export") {
    Write-Host "Copying Strapi uploads → $LocalDir ..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Force -Path $LocalDir | Out-Null
    docker compose cp content:/workspace/apps/content/public/uploads $LocalDir
    Write-Host "  ✔ Done. Copy the backups\strapi-uploads-latest\ folder to the new machine." -ForegroundColor Green
} else {
    if (-not (Test-Path $LocalDir)) {
        Write-Host "ERROR: $LocalDir not found. Run export first on the source machine." -ForegroundColor Red
        exit 1
    }
    Write-Host "Copying $LocalDir → Strapi container ..." -ForegroundColor Yellow
    docker compose cp $LocalDir content:/workspace/apps/content/public/uploads
    Write-Host "  ✔ Done." -ForegroundColor Green
}
