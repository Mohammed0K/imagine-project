[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$CertFile,

    [Parameter(Mandatory = $true)]
    [string]$KeyFile,

    [int]$Port = 8443,

    [string]$CaBundle = ""
)

$ErrorActionPreference = "Stop"

# Activate venv if found
$venv = Join-Path -Path $PSScriptRoot -ChildPath ".venv\Scripts\Activate.ps1"
if (Test-Path $venv) { . $venv } else { Write-Host "Activate your venv before running." }

# Optional CA bundle arg
$caArgs = @()
if ($CaBundle -and (Test-Path $CaBundle)) {
    $caArgs = @("--ssl-ca-certs", $CaBundle)
}

# Run uvicorn with TLS
python -m uvicorn imagine.asgi:application `
  --host 0.0.0.0 `
  --port $Port `
  --ssl-certfile $CertFile `
  --ssl-keyfile $KeyFile `
  @caArgs
