// ==========================================================
// 🗺️ 背景地図画像コンポーネント（Season3準備用）
// window.MapApp.mapConfig として公開します。
//
// ★ 新しいワールドの地図画像ができたら、この mapImageList に追記してください！
// 地図画像は "map" フォルダの中に入れてください（ファイル名の拡張子（.png / .webp）を除いた名前がそのまま地図のドロップダウンメニューに表示されます）
// 例：ファイル名：10月16日.png　→　「10月16日」
// 一番上（配列の先頭）が「初期表示される最新の地図」になります。新しい地図画像は
// 配列の先頭に追加してください。
//
// ※ Season2（現行）の地図画像一覧はこのファイルには含まれていません。
// ==========================================================
(function () {
    window.MapApp = window.MapApp || {};

    const mapImageList = [
        {
            // 1ブロック＝1マス（1ブロック＝2px、2048×2048）で描いた、ブロックを積み上げた立体の地図。
            // 軽くするため256色の WebP にしている（元の PNG は 4.3MB → 1.8MB）。
            // 雪山・森などは最初の全体図から、陸と海の境目と写っていない部分は配信の地図アイテムから判定した。
            // 範囲は区画の枠（js/data/MAP_plots.js）に合わせた位置（X -418〜606 / Z -656〜368）
            fileName: 'map/10月18日.webp',
            bounds: [[-418, -656], [606, 368]],
            opacity: 1
        },
        {
            // 区画と配信者名だけの配置図（画像ファイルではなく、区画とメンバーのデータからその場で描く。js/map/layout-diagram.js）
            label: '配置図',
            layout: true
        },
    ];

    // ファイル名から拡張子(.png / .webp)を除いた部分をそのままラベルとして使う
    function getMapLabel(fileName) {
        const base = fileName.split('/').pop();
        return base.replace(/\.[^/.]+$/, '');
    }

    // ドロップダウンに表示する名前（label があればそれ、なければファイル名から）
    function getEntryLabel(entry) {
        return entry.label || getMapLabel(entry.fileName);
    }

    // 選んだ地図のレイヤーを作る。配置図の時は、地図の上の区画の枠線・顔アイコン・ネームタグを隠す（配置図に名前が書いてあるため）
    function createOverlay(entry, targetMap) {
        targetMap.getContainer().classList.toggle('layout-mode', !!entry.layout);
        if (entry.layout) return window.MapApp.layoutDiagram.createOverlay();
        const overlay = L.imageOverlay(entry.fileName, toLeafletBounds(entry.bounds), {
            opacity: entry.opacity,
            interactive: false // 画像がクリック操作を遮らないようにする
        });
        // 画像が見つからなくても地図全体がクラッシュしないためのエラー対策
        overlay.on('error', function () {
            console.log(`背景画像 ${entry.fileName} が見つからないか、ローカル制限でロードできません。`);
        });
        return overlay;
    }

    // bounds([X, Z]の順)をLeafletが要求する[Z由来の緯度, X由来の経度]の順に変換する
    function toLeafletBounds(bounds) {
        return bounds.map(([x, z]) => [-z, x]);
    }

    let map = null;
    let bgImageOverlay = null;
    const mapImageSelects = () => Array.from(document.querySelectorAll('.map-image-select'));

    // ドロップダウンに mapImageList の一覧を反映する（先頭＝最新が選択された状態で開始）
    // デスクトップ用・スマホ用など、複数箇所にある .map-image-select すべてに反映する
    function populateMapImageSelect() {
        mapImageSelects().forEach((sel) => {
            sel.innerHTML = '';
            mapImageList.forEach((entry, index) => {
                const option = document.createElement('option');
                option.value = index;
                option.textContent = getEntryLabel(entry);
                sel.appendChild(option);
            });
        });
    }

    // どれか1つのドロップダウンが変更されたら、他のドロップダウンにも同じ選択を反映する
    function syncMapImageSelects(value) {
        mapImageSelects().forEach((sel) => { sel.value = value; });
    }

    function loadBackgroundImage() {
        // 既存の画像レイヤーがあれば一旦地図から削除する
        if (bgImageOverlay) {
            map.removeLayer(bgImageOverlay);
            bgImageOverlay = null;
        }

        // チェックボックスがON、かつ選択中の地図画像がある場合にのみ重ねる
        const isChecked = document.getElementById('toggle-bg-image').checked;
        const currentSelect = mapImageSelects()[0];
        const selectedEntry = mapImageList[Number(currentSelect ? currentSelect.value : 0)] || mapImageList[0];

        if (isChecked && selectedEntry) {
            bgImageOverlay = createOverlay(selectedEntry, map);
            bgImageOverlay.addTo(map);
        } else {
            map.getContainer().classList.remove('layout-mode');
        }
    }

    function init(mapInstance) {
        map = mapInstance;
        populateMapImageSelect();

        document.getElementById('toggle-bg-image').addEventListener('change', loadBackgroundImage);
        document.querySelectorAll('.map-image-select').forEach((sel) => {
            sel.addEventListener('change', (e) => {
                syncMapImageSelects(e.target.value);
                loadBackgroundImage();
            });
        });
    }

    window.MapApp.mapConfig = {
        mapImageList,
        getMapLabel,
        getEntryLabel,
        createOverlay,
        toLeafletBounds,
        init,
        loadBackgroundImage: () => loadBackgroundImage()
    };
})();
