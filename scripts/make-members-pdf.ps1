# ==========================================================
# members_print.html から members.pdf（メンバー名簿PDF）を作り直すスクリプト
#
# 使い方：js/data/config.js のメンバーを変更したあと、PowerShellで次を実行
#   powershell -ExecutionPolicy Bypass -File scripts\make-members-pdf.ps1
# できあがった members.pdf をコミット・プッシュすると、トップページの「PDF」ボタンに反映されます。
# ==========================================================
$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$page = Join-Path $root 'members_print.html'
$out  = Join-Path $root 'members.pdf'

$edgeCandidates = @(
    "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe",
    "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe"
)
$edge = $edgeCandidates | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $edge) { throw 'Microsoft Edge が見つかりません。' }

$pageUrl = ([System.Uri]$page).AbsoluteUri
# 一時プロファイルを使うことで、普段使っているEdgeが開いていても干渉しない
$profileDir = Join-Path $env:TEMP 'homekura-members-pdf'

if (Test-Path $out) { Remove-Item $out -Force }
$edgeArgs = @(
    '--headless', '--disable-gpu', '--no-first-run',
    "--user-data-dir=$profileDir",
    '--allow-file-access-from-files',
    '--no-pdf-header-footer',
    '--virtual-time-budget=5000',
    "--print-to-pdf=$out",
    $pageUrl
)
Start-Process -FilePath $edge -ArgumentList $edgeArgs -Wait -WindowStyle Hidden

if (-not (Test-Path $out)) { throw 'members.pdf を作成できませんでした。' }
$size = [math]::Round((Get-Item $out).Length / 1KB)
Write-Host "members.pdf を作成しました（${size} KB）: $out"
