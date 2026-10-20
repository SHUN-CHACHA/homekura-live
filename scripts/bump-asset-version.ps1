# ==========================================================
# サイト内のすべての HTML ページが読み込む CSS・JS・画像・PDF・ページへのリンクに「?v=バージョン番号」を付け直すスクリプト
# （ブラウザのキャッシュで古いファイルが表示され続けるのを防ぐ）
#
# 普段は git commit 時に scripts/git-hooks/pre-commit から自動で実行されます（-Stage 付きで、書き換えたページをコミットに含める）。
# 手動で実行する場合：
#   powershell -ExecutionPolicy Bypass -File scripts\bump-asset-version.ps1
# ==========================================================
param([switch]$Stage)
$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
# バージョン番号は日時ではなく、毎回ランダムな英小文字・数字6文字（例：k3f9a2）にする
$chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
$version = -join (1..6 | ForEach-Object { $chars[(Get-Random -Maximum $chars.Length)] })
$utf8NoBom = New-Object System.Text.UTF8Encoding $false

# src="..." / href="..." のうち、サイト内のファイル（http・#・${...} などで始まらないもの）が対象
$attrPattern = '(?<attr>(?:src|href)=")(?<path>(?!https?:|//|#|data:|mailto:|javascript:|\$\{)[^"?#]+\.(?:css|js|png|jpe?g|gif|svg|ico|webp|pdf|html))(?:\?v=[0-9a-z]+)?"'

# .git フォルダ以外にあるすべての HTML ページ
$pages = Get-ChildItem -Path $root -Recurse -File -Filter '*.html' | Where-Object { $_.FullName -notmatch '[\\/]\.git[\\/]' }

foreach ($page in $pages) {
    $file = $page.FullName
    $before = [System.IO.File]::ReadAllText($file, $utf8NoBom)
    $text = [regex]::Replace($before, $attrPattern, { param($m) "$($m.Groups['attr'].Value)$($m.Groups['path'].Value)?v=$version`"" })
    # JavaScriptで組み立てるアバター画像のパス用
    $text = [regex]::Replace($text, "const ASSET_VERSION = '[0-9a-z]*';", "const ASSET_VERSION = '$version';")
    if ($text -eq $before) { continue } # 読み込みのないページ（空のページなど）は書き換えない

    [System.IO.File]::WriteAllText($file, $text, $utf8NoBom)
    $rel = $file.Substring($root.Length + 1)
    if ($Stage) { git -C $root add -- $rel }
    Write-Host "$rel asset version -> $version"
}
