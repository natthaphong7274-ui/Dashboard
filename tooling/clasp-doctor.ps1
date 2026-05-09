$ErrorActionPreference = 'Stop'

$projectRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
$claspConfig = Join-Path $projectRoot '.clasp.json'
$srcDir = Join-Path $projectRoot 'src'

function Resolve-ClaspCommand {
  $cmd = Get-Command clasp -ErrorAction SilentlyContinue
  if ($null -ne $cmd) { return $cmd.Source }

  $fallbacks = @(
    (Join-Path $env:APPDATA 'npm\clasp.cmd'),
    'C:\Program Files\nodejs\clasp.cmd'
  )

  foreach ($path in $fallbacks) {
    if (Test-Path -LiteralPath $path) { return $path }
  }

  return $null
}

Write-Host "Dashboard clasp doctor" -ForegroundColor Cyan
Write-Host "Project: $projectRoot"
Write-Host ""

$claspCmd = Resolve-ClaspCommand
if ($null -eq $claspCmd) {
  Write-Host "clasp: NOT FOUND" -ForegroundColor Red
  Write-Host "Install it after npm is available:"
  Write-Host "  npm install -g @google/clasp"
} else {
  Write-Host "clasp: $claspCmd" -ForegroundColor Green
  & $claspCmd --version
}

if (Test-Path -LiteralPath $claspConfig) {
  Write-Host ".clasp.json: found" -ForegroundColor Green
  $cfg = Get-Content -Raw -LiteralPath $claspConfig | ConvertFrom-Json
  Write-Host "scriptId: $($cfg.scriptId)"
  Write-Host "rootDir: $($cfg.rootDir)"
} else {
  Write-Host ".clasp.json: missing" -ForegroundColor Yellow
  Write-Host "Create it with:"
  Write-Host "  .\tooling\clasp-init.ps1 -ScriptId YOUR_SCRIPT_ID"
}

if (Test-Path -LiteralPath $srcDir) {
  Write-Host "src folder: found" -ForegroundColor Green
} else {
  Write-Host "src folder: missing" -ForegroundColor Red
}

Write-Host ""
Write-Host "Apps Script API setting:"
Write-Host "  https://script.google.com/home/usersettings"
