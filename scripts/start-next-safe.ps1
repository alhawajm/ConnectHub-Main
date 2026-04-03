param(
  [Parameter(Mandatory = $true)]
  [ValidateSet("dev", "start")]
  [string]$Mode
)

$projectPath = (Get-Location).Path

$targets = Get-CimInstance Win32_Process -Filter "name = 'node.exe'" |
  Where-Object {
    $_.CommandLine -like "*$projectPath*" -and (
      $_.CommandLine -like '*next\dist\bin\next*' -or
      $_.CommandLine -like '*npm-cli.js run dev*' -or
      $_.CommandLine -like '*npm-cli.js start*'
    )
  } |
  Select-Object -ExpandProperty ProcessId

if ($targets) {
  Stop-Process -Id $targets -Force
  Start-Sleep -Milliseconds 500
}

if (Test-Path '.next') {
  Remove-Item -LiteralPath '.next' -Recurse -Force
}

if ($Mode -eq 'start') {
  & npm.cmd run build
  if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
  }
}

if ($Mode -eq 'dev') {
  & .\node_modules\.bin\next.cmd dev
} else {
  & .\node_modules\.bin\next.cmd start
}

exit $LASTEXITCODE
