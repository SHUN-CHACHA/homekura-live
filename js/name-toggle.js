// ==========================================================
// 📍 名前・アイコン表示のON/OFFトグルボタン コンポーネント
// window.MapApp.nameToggle として公開します。
// minecraft_map.html だけでなく、他のページ（例: map_compare.html）でも
// 同じ見た目・同じ動きで使い回せるように、汎用的に作ってあります。
//
// 使い方：
//   MapApp.nameToggle.init({
//       buttonId: 'icon-toggle-btn',      // ボタンのid
//       targetSelector: '#map-container'  // ON/OFFを適用する対象のセレクタ
//   });
// ==========================================================
(function () {
    window.MapApp = window.MapApp || {};

    function init(options) {
        const opts = options || {};
        const buttonId = opts.buttonId || 'icon-toggle-btn';
        const targetSelector = opts.targetSelector || '#map-container';

        const btn = document.getElementById(buttonId);
        const target = document.querySelector(targetSelector);
        if (!btn || !target) return;

        let visible = true;

        function render() {
            btn.textContent = visible ? '📍 名前 ON' : '📍 名前 OFF';
            btn.classList.toggle('is-off', !visible);
            target.classList.toggle('icons-hidden', !visible);
        }

        btn.addEventListener('click', () => {
            visible = !visible;
            render();
        });

        render();
    }

    window.MapApp.nameToggle = { init };
})();
