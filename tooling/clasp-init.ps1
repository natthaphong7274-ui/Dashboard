param(
  [Parameter(Mandatory = $true)]
  [string]$ScriptId
)

$ErrorActionPreference = 'Stop'

$projectRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
$rootDir = Join-Path $projectRoot 'src'

if (-not (Test-Path -LiteralPath $rootDir)) {
  throw "Missing src folder: $rootDir"
}

$config = [ordered]@{
  scriptId = $ScriptId
  rootDir = "src"
}

$outPath = Join-Path $projectRoot '.clasp.json'
$json = $config | ConvertTo-Json
[System.IO.File]::WriteAllText($outPath, $json + [Environment]::NewLine, [System.Text.Encoding]::UTF8)

Write-Host "Created .clasp.json for Apps Script project:" -ForegroundColor Green
Write-Host "  $ScriptId"
Write-Host ""
Write-Host "Next:"
Write-Host "  1. clasp login"
Write-Host "  2. .\tooling\clasp-pull.ps1"
Write-Host "  3. .\tooling\clasp-push.ps1"
