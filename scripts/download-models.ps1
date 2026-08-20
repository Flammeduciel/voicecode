# VoiceCode Model Download Script
# Run this once to download the STT models (~700MB total)
# Requires: curl (built into Windows 10+)

$ErrorActionPreference = "Stop"

$MODELS_DIR = Join-Path $PSScriptRoot ".." "models"

$MODELS = @(
    @{
        Name = "sherpa-onnx-streaming-zipformer-en-2023-06-26"
        Url = "https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/sherpa-onnx-streaming-zipformer-en-2023-06-26.tar.bz2"
        Size = "~296MB"
        Language = "English"
    },
    @{
        Name = "sherpa-onnx-streaming-zipformer-fr-2023-04-14"
        Url = "https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/sherpa-onnx-streaming-zipformer-fr-2023-04-14.tar.bz2"
        Size = "~398MB"
        Language = "French"
    }
)

Write-Host "VoiceCode - Model Setup" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan
Write-Host ""

# Create models directory
if (-not (Test-Path $MODELS_DIR)) {
    New-Item -ItemType Directory -Path $MODELS_DIR -Force | Out-Null
    Write-Host "[+] Created models directory: $MODELS_DIR" -ForegroundColor Green
}

$downloaded = 0

foreach ($model in $MODELS) {
    $modelName = $model.Name
    $modelUrl = $model.Url
    $modelSize = $model.Size
    $modelLang = $model.Language
    $archivePath = Join-Path $MODELS_DIR "$modelName.tar.bz2"
    $extractDir = Join-Path $MODELS_DIR $modelName

    Write-Host "--- $modelLang Model ---" -ForegroundColor Yellow
    Write-Host "    Name: $modelName"
    Write-Host "    Size: $modelSize"

    # Check if model already exists
    if (Test-Path $extractDir) {
        Write-Host "[=] Already downloaded" -ForegroundColor Yellow
        Write-Host ""
        continue
    }

    # Download model
    Write-Host "[~] Downloading $modelLang STT model ($modelSize)..." -ForegroundColor Cyan

    try {
        curl.exe -LS -o $archivePath $modelUrl
        if ($LASTEXITCODE -ne 0) { throw "curl failed" }
    } catch {
        Write-Host "[-] Download failed. Please install curl or download manually:" -ForegroundColor Red
        Write-Host "    $modelUrl"
        exit 1
    }

    # Extract model
    Write-Host "[~] Extracting model..." -ForegroundColor Cyan
    try {
        tar xf $archivePath -C $MODELS_DIR
        if ($LASTEXITCODE -ne 0) { throw "tar failed" }
    } catch {
        Write-Host "[-] Extraction failed. Please install tar or extract manually." -ForegroundColor Red
        exit 1
    }

    # Cleanup archive
    Remove-Item $archivePath -Force -ErrorAction SilentlyContinue

    Write-Host "[+] $modelLang model ready!" -ForegroundColor Green
    Write-Host ""
    $downloaded++
}

Write-Host "========================" -ForegroundColor Cyan
Write-Host "[+] All models ready!" -ForegroundColor Green
Write-Host "    Location: $MODELS_DIR"
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Open VS Code and install the VoiceCode extension"
Write-Host "  2. Press Ctrl+Shift+V to start recording"
Write-Host "  3. Use the EN/FR switcher in the panel to change language"
