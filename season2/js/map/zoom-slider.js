// ==========================================================
// 🔍 ズームスライダー コンポーネント
// window.MapApp.zoomSlider として公開します。
// 無段階ズーム（1/3倍〜3倍）をスライダーで操作するための共通ロジック。
// minecraft_map.html だけでなく、map_compare.html でも同じ動きで使えるように
// 汎用化してあります（比較ページでは左側の地図を「基準」として渡してください。
// 右側の地図は既存のパン・ズーム連動処理で自動的に追従します）。
//
// 使い方：
//   MapApp.zoomSlider.init({
//       map: map,                       // ズーム操作の基準にする地図（Leafletインスタンス）
//       sliderId: 'zoom-slider',        // スライダーのid（省略可）
//       labelId: 'zoom-slider-label',   // 倍率表示のid（省略可）
//       baseline: -2                    // 「1.0倍」とみなすズームレベル（省略可、デフォルト-2）
//   });
// ==========================================================
(function () {
    window.MapApp = window.MapApp || {};

    function init(options) {
        const opts = options || {};
        const map = opts.map;
        const sliderId = opts.sliderId || 'zoom-slider';
        const labelId = opts.labelId || 'zoom-slider-label';
        const baseline = (typeof opts.baseline === 'number') ? opts.baseline : -2;

        const slider = document.getElementById(sliderId);
        const label = document.getElementById(labelId);
        if (!map || !slider || !label) return;

        function formatZoomLabel(zoomLevel) {
            const multiplier = Math.pow(2, zoomLevel - baseline);
            return `${multiplier.toFixed(2)}×`;
        }

        // スライダーを動かしたら地図をズームする
        slider.addEventListener('input', (e) => {
            map.setZoom(parseFloat(e.target.value));
        });

        // 地図側がズームしたら（マウスホイール・ピンチ操作など）スライダー側も同期する
        map.on('zoom', () => {
            const z = map.getZoom();
            slider.value = z;
            label.textContent = formatZoomLabel(z);
        });

        label.textContent = formatZoomLabel(map.getZoom());
    }

    window.MapApp.zoomSlider = { init };
})();
