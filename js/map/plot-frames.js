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
    const FRAME_INSET_BLOCKS = 1; // 隣り合う区画の線が重ならないよう、少し内側に描く

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

        (typeof plotData !== 'undefined' ? plotData : []).forEach((plot) => {
            const x0 = plot.x + FRAME_INSET_BLOCKS;
            const x1 = plot.x + plot.w - FRAME_INSET_BLOCKS;
            const z0 = plot.z + FRAME_INSET_BLOCKS;
            const z1 = plot.z + plot.h - FRAME_INSET_BLOCKS;
            L.rectangle([[-z0, x0], [-z1, x1]], {
                ...common,
                color: FRAME_COLORS[plot.color] || '#ffffff',
                weight: 3,
                opacity: 1
            }).addTo(layer);
        });

        return layer;
    }

    window.MapApp.plotFrames = { create };
})();
