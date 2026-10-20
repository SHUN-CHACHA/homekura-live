// ==========================================================
// 🟥 区画の枠線コンポーネント
// window.MapApp.plotFrames として公開します。
// plotData / plotOutline は js/data/MAP_plots.js で定義されたものを使います。
// 背景の地図画像とは別の線として描くので、拡大してもくっきり表示され、
// 「地図の表示項目」の「区画の枠線を表示」で出し入れできます（.plot-frame を CSS で隠す）。
// ==========================================================
(function () {
    window.MapApp = window.MapApp || {};

    const FRAME_COLORS = {
        red: '#de1923',
        orange: '#fb8418',
        blue: '#05a7fb',
        yellow: '#fef90e'
    };
    const FRAME_WEIGHT = 3; // 枠線の太さ（画面上のピクセル）

    // 1つの地図に区画の枠線と外周線を描く（拠点マップ・地図の比較画面で共通）
    function create(map) {
        if (!map.getPane('plotFramePane')) {
            // 背景画像より上、顔アイコンより下に描く
            map.createPane('plotFramePane').style.zIndex = 450;
        }
        const layer = L.layerGroup().addTo(map);
        const common = { pane: 'plotFramePane', className: 'plot-frame', interactive: false, fill: false };

        if (typeof plotOutline !== 'undefined' && plotOutline.length) {
            L.polygon(plotOutline.map(([x, z]) => [-z, x]), { ...common, color: '#ffffff', weight: 4, opacity: 0.95 }).addTo(layer);
        }

        // 枠線の外側が区画の端（48×48ブロックなど）にぴったり来るよう、線の太さの半分だけ内側に描く。
        // 線の太さは画面上のピクセルなので、ブロック数に直した内側への幅はズームのたびに計算し直す（1ブロック＝2^ズーム px）。
        // 隣り合う赤・オレンジの区画の枠はくっつく
        const frames = (typeof plotData !== 'undefined' ? plotData : []).map((plot) => ({
            plot,
            rect: L.rectangle([[0, 0], [0, 0]], {
                ...common,
                color: FRAME_COLORS[plot.color] || '#ffffff',
                weight: FRAME_WEIGHT,
                opacity: 1
            }).addTo(layer)
        }));

        function updateFrameBounds() {
            const inset = (FRAME_WEIGHT / 2) / Math.pow(2, map.getZoom());
            frames.forEach(({ plot, rect }) => {
                rect.setBounds([[-(plot.z + inset), plot.x + inset], [-(plot.z + plot.h - inset), plot.x + plot.w - inset]]);
            });
        }
        updateFrameBounds();
        map.on('zoomend', updateFrameBounds);

        return layer;
    }

    window.MapApp.plotFrames = { create };
})();
