/* ==========================================================
   デザインのお試し表示（?theme=名前）

   ページの URL に ?theme=〇〇 を付けると、shared/themes/〇〇.css の見た目で表示します。
     例）index.html?theme=2026-winter-deep-freeze
   ?theme=default を付けると、季節テーマを外した「いつもの緑」で表示します。

   見ている人のブラウザで一時的に切り替えるだけで、サイトの設定は変わりません。
   theme.css の <link> のすぐ後に読み込んでください（色がチラつかないように）。
========================================================== */
(function () {
    var name;
    try {
        name = new URLSearchParams(location.search).get('theme');
    } catch (e) {
        return;
    }
    if (!name) return;
    // ファイル名に使える文字（英小文字・数字・ハイフン）だけ受け付ける
    if (!/^[a-z0-9-]+$/.test(name)) return;

    var themesBase = new URL('themes/', document.currentScript.src);

    // theme.css の中で @import している季節テーマを外す
    for (var i = 0; i < document.styleSheets.length; i++) {
        var sheet = document.styleSheets[i];
        if (!sheet.href || sheet.href.indexOf('/shared/theme.css') === -1) continue;
        try {
            for (var j = sheet.cssRules.length - 1; j >= 0; j--) {
                var rule = sheet.cssRules[j];
                if (rule.type === CSSRule.IMPORT_RULE && rule.href.indexOf('themes/') !== -1) {
                    sheet.deleteRule(j);
                }
            }
        } catch (e) { /* 読めないときは何もしない */ }
    }

    if (name === 'default') return;

    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = new URL(name + '.css', themesBase).href;
    document.head.appendChild(link);
})();
