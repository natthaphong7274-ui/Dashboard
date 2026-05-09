$ErrorActionPreference = 'Stop'

$projectRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
$claspConfig = Join-Path $projectRoot '.clasp.json'

function Resolve-ClaspCommand {
  $cmd = Get-Command clasp -ErrorAction SilentlyContinue
  if ($null -ne $cmd) { return $cmd.Source }
  $fallback = Join-Path $env:APPDATA 'npm\clasp.cmd'
  if (Test-Path -LiteralPath $fallback) { return $fallback }
  return $null
}

$claspCmd = Resolve-ClaspCommand
if ($null -eq $claspCmd) {
  throw "clasp is not installed or not in PATH. Install with: npm install -g @google/clasp"
}

if (-not (Test-Path -LiteralPath $claspConfig)) {
  throw "Missing .clasp.json. Run: .\tooling\clasp-init.ps1 -ScriptId YOUR_SCRIPT_ID"
}

Push-Location $projectRoot
try {
  & $claspCmd open
} finally {
  Pop-Location
}
