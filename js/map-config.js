// ==========================================================
// 🗺️ 背景地図画像コンポーネント
// window.MapApp.mapConfig として公開します。
//
// ★ 新しい月の地図ができたら、この mapImageList に追記してください！
// 毎月の地図画像は "map" フォルダの中に入れてください（ファイル名: MMDDworld_map.png）
// 例：7月4日の画像なら map/0704world_map.png
// 一番上（配列の先頭）が「初期表示される最新の地図」になります。新しい月の画像は
// 配列の先頭に追加してください。
// ==========================================================
(function () {
    window.MapApp = window.MapApp || {};

    const mapImageList = [
        {
            fileName: 'map/0704world_map.png',
            // [X座標, Z座標] の順で、画像の対角の2点を指定します（順不同でOK）。
            // 例：Chunkbaseで切り抜いた範囲が「X: -1600〜1600、Z: -1600〜1600」の場合
            //     bounds: [[-1600, -1600], [1600, 1600]]
            bounds: [[-1600, -1600], [1984, 1472]],
            opacity: 0.75 // 画像の透明度 (0.0 〜 1.0)
        },
        // ↓ 新しい月の地図を追加する場合は、この下に同じ形でコピペしてください。
        // 末尾の { } のブロックにも必ずカンマ「,」を付けてください（付け忘れると全体が動かなくなります）。
        // {
        //     fileName: 'map/0801world_map.png',
        //     bounds: [[-1600, -1600], [1984, 1472]],
        //     opacity: 0.75
        // },
        {
            fileName: 'map/マイクラ風.png',
            bounds: [[-1600, -1600], [1984, 1472]],
            opacity: 0.75
        },
    ];

    // ファイル名から拡張子(.png)を除いた部分をそのままラベルとして使う
    function getMapLabel(fileName) {
        const base = fileName.split('/').pop();
        return base.replace(/\.[^/.]+$/, '');
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
                option.textContent = getMapLabel(entry.fileName);
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

        if (isChecked && selectedEntry && selectedEntry.fileName) {
            bgImageOverlay = L.imageOverlay(selectedEntry.fileName, toLeafletBounds(selectedEntry.bounds), {
                opacity: selectedEntry.opacity,
                interactive: false // 画像がクリック操作を遮らないようにする
            });

            // 画像が見つからなくても地図全体がクラッシュしないためのエラー対策
            bgImageOverlay.on('error', function () {
                console.log(`背景画像 ${selectedEntry.fileName} が見つからないか、ローカル制限でロードできません。`);
            });

            bgImageOverlay.addTo(map);
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
        toLeafletBounds,
        init,
        loadBackgroundImage: () => loadBackgroundImage()
    };
})();
