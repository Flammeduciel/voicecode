# VoiceCode Model Download Script
# Run this once to download the STT model (~296MB)
# Requires: curl (built into Windows 10+)

$ErrorActionPreference = "Stop"

$MODELS_DIR = Join-Path $PSScriptRoot ".." "models"
$MODEL_NAME = "sherpa-onnx-streaming-zipformer-en-2023-06-26"
$MODEL_URL = "https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/$MODEL_NAME.tar.bz2"
$MODEL_PATH = Join-Path $MODELS_DIR "$MODEL_NAME.tar.bz2"
$EXTRACT_DIR = Join-Path $MODELS_DIR $MODEL_NAME

Write-Host "VoiceCode - Model Setup" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan

# Create models directory
if (-not (Test-Path $MODELS_DIR)) {
    New-Item -ItemType Directory -Path $MODELS_DIR -Force | Out-Null
    Write-Host "[+] Created models directory: $MODELS_DIR" -ForegroundColor Green
}

# Check if model already exists
if (Test-Path $EXTRACT_DIR) {
    Write-Host "[=] Model already downloaded: $MODEL_NAME" -ForegroundColor Yellow
    Write-Host "    Location: $EXTRACT_DIR"
    exit 0
}

# Download model
Write-Host "[~] Downloading STT model (~296MB)..." -ForegroundColor Cyan
Write-Host "    URL: $MODEL_URL"

try {
    curl.exe -LS -o $MODEL_PATH $MODEL_URL
    if ($LASTEXITCODE -ne 0) { throw "curl failed" }
} catch {
    Write-Host "[-] Download failed. Please install curl or download manually:" -ForegroundColor Red
    Write-Host "    $MODEL_URL"
    exit 1
}

# Extract model
Write-Host "[~] Extracting model..." -ForegroundColor Cyan
try {
    tar xf $MODEL_PATH -C $MODELS_DIR
    if ($LASTEXITCODE -ne 0) { throw "tar failed" }
} catch {
    Write-Host "[-] Extraction failed. Please install tar or extract manually." -ForegroundColor Red
    exit 1
}

# Cleanup archive
Remove-Item $MODEL_PATH -Force -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "[+] Model ready!" -ForegroundColor Green
Write-Host "    Location: $EXTRACT_DIR"
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Install Ollama (optional, for future code generation)"
Write-Host "  2. Open VS Code and install the VoiceCode extension"
Write-Host "  3. Press Ctrl+Shift+V to start recording"
