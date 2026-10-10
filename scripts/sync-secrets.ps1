# Synchronize environments to local repositories
$ErrorActionPreference = "Stop"

$infraRoot = $PSScriptRoot | Split-Path -Parent
$projectsRoot = $infraRoot | Split-Path -Parent

$envMappings = @{
    "oplox.env"          = "oplox\.env"
    "audio-gym.env"      = "ai-app-audio-gym\.env"
    "off-grid-audio.env" = "ai-app-off-grid-audio\.env"
    "off-grid-video.env" = "ai-app-off-grid-video\.env"
    "mail-triage.env"    = "ai-app-mail-triage\.env"
    "design-vault.env"   = "ai-platform-design-vault\.env"
}

Write-Host "Syncing development environments from ai-platform-infra..." -ForegroundColor Cyan

foreach ($srcFile in $envMappings.Keys) {
    $srcPath = Join-Path $infraRoot "environments\dev\$srcFile"
    $relDest = $envMappings[$srcFile]
    $destPath = Join-Path $projectsRoot $relDest

    if (Test-Path $srcPath) {
        $destDir = Split-Path $destPath -Parent
        if (Test-Path $destDir) {
            Copy-Item -Path $srcPath -Destination $destPath -Force
            Write-Host "  -> Injected $srcFile into $relDest" -ForegroundColor Green
        }
    }
}

Write-Host "All project environments synchronized successfully!" -ForegroundColor Green
