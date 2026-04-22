# db-export.ps1 — Run from project root: .\scripts\db-export.ps1

param([string]$Tag = (Get-Date -Format "yyyy-MM-dd_HH-mm"))

$Root    = Split-Path $PSScriptRoot -Parent
$Backups = Join-Path $Root "backups"
New-Item -ItemType Directory -Force -Path $Backups | Out-Null

Write-Host ""
Write-Host "DB export $Tag" -ForegroundColor Cyan

$f1 = Join-Path $Backups ("medusa_" + $Tag + ".sql")
Write-Host "Dumping Medusa DB..." -ForegroundColor Yellow
docker compose exec -T postgres-commerce pg_dump -U medusa -d medusa_db --no-owner --no-acl | Set-Content -Path $f1 -Encoding utf8
if ($LASTEXITCODE -ne 0) { Write-Host "FAILED" -ForegroundColor Red; exit 1 }
Write-Host "  OK: $f1" -ForegroundColor Green

$f2 = Join-Path $Backups ("strapi_" + $Tag + ".sql")
Write-Host "Dumping Strapi DB..." -ForegroundColor Yellow
docker compose exec -T postgres-content pg_dump -U strapi -d strapi_db --no-owner --no-acl | Set-Content -Path $f2 -Encoding utf8
if ($LASTEXITCODE -ne 0) { Write-Host "FAILED" -ForegroundColor Red; exit 1 }
Write-Host "  OK: $f2" -ForegroundColor Green

$f3 = Join-Path $Backups ("strapi-uploads_" + $Tag)
Write-Host "Copying Strapi uploads..." -ForegroundColor Yellow
docker compose cp content:/workspace/apps/content/public/uploads $f3 2>$null
Write-Host "  OK: $f3" -ForegroundColor Green

Write-Host ""
Write-Host "Export complete. Files in backups/:" -ForegroundColor Cyan
Get-ChildItem $Backups | Where-Object { $_.Name -like ("*" + $Tag + "*") } | ForEach-Object { Write-Host "  $($_.Name)" }
Write-Host ""
Write-Host "To restore: .\scripts\db-import.ps1 -Tag $Tag" -ForegroundColor Gray
Write-Host ""
