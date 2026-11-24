# homeクラ デザインテーマ置き場

季節や Minecraft のアップデートに合わせたデザインを、1つずつ別のファイルで残しておくフォルダです。
**過去のテーマファイルは書き換えたり消したりしないでください**（デザインの歴史として残します）。

## テーマ一覧

| ファイル | テーマ | モチーフ | 公開した期間 | Git タグ |
| --- | --- | --- | --- | --- |
| （theme.css 本体） | いつもの緑 | 草ブロック | 〜 | `design/2026-autumn-green` |
| `2026-winter-deep-freeze.css` | 冬「Deep Freeze」 | Minecraft 26.4（氷の洞窟・雪レンガ・方解石） | 未公開（サーバーが 26.4 になったら公開） | — |

## 新しいテーマの作り方

1. このフォルダに `年-季節-名前.css` を作る（英小文字・数字・ハイフンだけ）。
2. 中身は `:root:root { ... }` の中で、`shared/theme.css` の色トークンを上書きする。
   `:root` を2回書くのは、theme.css の `:root` より優先させるため。
3. 公開前に、ページの URL に `?theme=ファイル名（.css なし）` を付けて見た目を確認する。
   例：`index.html?theme=2026-winter-deep-freeze`
   `?theme=default` を付けると、季節テーマなしの「いつもの緑」で見られます。
4. ブックマークアイコンの色を `shared/themes/icons.json` に足して、`python scripts\make-icons.py` を実行する
   （`img/themes/icons/テーマ名/` にアイコンができる。お試し表示のときはアイコンもこの色になる）。
5. 上の表に1行足す。

## 表に出すテーマの切り替え方

`shared/theme.css` の先頭にある `@import` の行で選びます。

- ON：`@import url("themes/ファイル名.css");`
- OFF：その行をコメント記号で囲む

ブックマークアイコンも一緒に切り替えます（img/ の3つのファイルが、そのテーマの色に置き換わる）。

```powershell
python scripts\make-icons.py --use 2026-winter-deep-freeze
```

切り替えてコミットしたら、そのときのサイト全体を残すために Git タグを付けます。

```powershell
git tag design/2026-winter
```

タグはパソコンの中にだけ作られます。GitHub にも残したいときは `git push origin design/2026-winter` を実行してください。

## ブックマークアイコン

- 「HOME / クラ」の2行の文字アイコン。色は `icons.json`（bg=背景、top=HOME、bottom=クラ）。
- 作り直しは `scripts/make-icons.py`（Python と Pillow、Windows の BIZ UDゴシックが必要）。
- 2026年11月まで使っていた白黒イラストのアイコンは `img/themes/icons/2026-autumn-original/` に残してある。
- ブラウザはアイコンを長く覚えているので、替えてから表示が変わるまで数時間〜数日かかることがある。

## 注意

- CSS のコメントの文章の中に `*/` を書かないこと。そこでコメントが終わってしまい、後ろの文字が CSS として読まれてしまいます。
- `@import` で読み込むテーマファイルには、ページの `?v=` の付け直し（pre-commit）が効きません。
  公開中のテーマファイルを後から直したときは、`@import` の URL の末尾に `?v=2` のような番号を付けて、ブラウザに古いファイルが残らないようにしてください。
- `season2/` は過去シーズンのページで、`season2/shared/theme.css` という別のコピーを使っているため、ここのテーマの影響は受けません。
