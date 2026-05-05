param(
  [string]$SourceDir = "chrome-extension",
  [string]$OutDir = "public",
  [string]$ZipName = "linkedin-roaster-extension.zip"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $SourceDir)) {
  throw "Source dir not found: $SourceDir"
}
if (-not (Test-Path $OutDir)) {
  New-Item -ItemType Directory -Path $OutDir | Out-Null
}

$zipPath = Join-Path $OutDir $ZipName
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }

Compress-Archive -Path (Join-Path $SourceDir "*") -DestinationPath $zipPath -Force
Write-Output "Created $zipPath"

