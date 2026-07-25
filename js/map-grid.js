// ==========================================================
// 📏 地図の格子線・座標ラベル・軸線コンポーネント
// window.MapApp.mapGrid として公開します。
// init(map) を呼んでから使います。
// ==========================================================
(function () {
    window.MapApp = window.MapApp || {};

    const GRID_INTERVAL = 256;
    const AXIS_LABEL_INTERVAL = 512;
    const LOW_ZOOM_THRESHOLD = -2; // これより低いズームレベル（1倍未満）では座標を非表示にする

    let map = null;
    let gridLayerGroup = null;
    let mapEl = null;
    let axisLabelContainer = null;
    let xAxisLine = null;
    let zAxisLine = null;

    function getColors() {
        const cc = window.MapApp.colorCustomizer;
        return cc ? cc.getColors() : { gridColor: '#ffffff', xAxisColor: '#ef4444', zAxisColor: '#3b82f6' };
    }

    // ==========================================================
    // 📏 動的格子線（X:0, Z:0 を起点に256ブロックごと）
    // 表示範囲（パン・ズーム）に合わせて、見えている範囲全体をカバーするように再描画する
    // ==========================================================
    function updateGrid() {
        gridLayerGroup.clearLayers();

        const bounds = map.getBounds();
        const west = bounds.getWest();
        const east = bounds.getEast();
        const south = bounds.getSouth();
        const north = bounds.getNorth();

        // 現在の表示範囲より少し広めに、256の倍数へスナップして描画開始/終了位置を決める
        const xStart = Math.floor(west / GRID_INTERVAL) * GRID_INTERVAL - GRID_INTERVAL;
        const xEnd = Math.ceil(east / GRID_INTERVAL) * GRID_INTERVAL + GRID_INTERVAL;
        const yStart = Math.floor(south / GRID_INTERVAL) * GRID_INTERVAL - GRID_INTERVAL;
        const yEnd = Math.ceil(north / GRID_INTERVAL) * GRID_INTERVAL + GRID_INTERVAL;

        const gridStyle = { color: getColors().gridColor, weight: 1, opacity: 0.12, interactive: false };

        // 縦線（X座標が一定の線）
        for (let x = xStart; x <= xEnd; x += GRID_INTERVAL) {
            L.polyline([[yStart, x], [yEnd, x]], gridStyle).addTo(gridLayerGroup);
        }
        // 横線（Z座標が一定の線。leafletY = -z）
        for (let y = yStart; y <= yEnd; y += GRID_INTERVAL) {
            L.polyline([[y, xStart], [y, xEnd]], gridStyle).addTo(gridLayerGroup);
        }
    }

    // ==========================================================
    // 🔍 ズームアウト時は座標表示を隠して密集を緩和する
    // ==========================================================
    function updateZoomDensityClass() {
        if (map.getZoom() < LOW_ZOOM_THRESHOLD) {
            mapEl.classList.add('low-zoom');
        } else {
            mapEl.classList.remove('low-zoom');
        }
    }

    // ==========================================================
    // 📏 512刻みのX軸・Z軸ラベル（画面上端・右端に表示するルーラー）
    // ==========================================================
    function updateAxisLabels() {
        axisLabelContainer.innerHTML = '';

        const bounds = map.getBounds();
        const west = bounds.getWest();
        const east = bounds.getEast();
        const south = bounds.getSouth();
        const north = bounds.getNorth();

        // 画面上端：X座標のラベル（512刻み）
        const xStart = Math.ceil(west / AXIS_LABEL_INTERVAL) * AXIS_LABEL_INTERVAL;
        const xEnd = Math.floor(east / AXIS_LABEL_INTERVAL) * AXIS_LABEL_INTERVAL;
        for (let x = xStart; x <= xEnd; x += AXIS_LABEL_INTERVAL) {
            const point = map.latLngToContainerPoint([north, x]);
            const label = document.createElement('div');
            label.className = 'axis-label-x';
            label.textContent = x;
            label.style.left = `${point.x}px`;
            axisLabelContainer.appendChild(label);
        }

        // 画面右端：Z座標のラベル（512刻み。leafletY = -z）
        const yStart = Math.ceil(south / AXIS_LABEL_INTERVAL) * AXIS_LABEL_INTERVAL;
        const yEnd = Math.floor(north / AXIS_LABEL_INTERVAL) * AXIS_LABEL_INTERVAL;
        for (let y = yStart; y <= yEnd; y += AXIS_LABEL_INTERVAL) {
            const z = -y;
            const point = map.latLngToContainerPoint([y, east]);
            const label = document.createElement('div');
            label.className = 'axis-label-z';
            label.textContent = z;
            label.style.top = `${point.y}px`;
            axisLabelContainer.appendChild(label);
        }
    }

    function updateAxisLineColors() {
        const colors = getColors();
        if (xAxisLine) xAxisLine.setStyle({ color: colors.xAxisColor, opacity: colors.xAxisTransparent ? 0 : 0.6 });
        if (zAxisLine) zAxisLine.setStyle({ color: colors.zAxisColor, opacity: colors.zAxisTransparent ? 0 : 0.6 });
    }

    // ==========================================================
    // 🚀 初期化：地図オブジェクトを受け取り、格子・軸線・イベントを設定する
    // ==========================================================
    function init(mapInstance) {
        map = mapInstance;
        gridLayerGroup = L.layerGroup().addTo(map);
        mapEl = document.getElementById('map');
        axisLabelContainer = document.getElementById('axis-labels');

        const colors = getColors();
        zAxisLine = L.polyline([[4000, 0], [-4000, 0]], { color: colors.zAxisColor, weight: 2, opacity: colors.zAxisTransparent ? 0 : 0.6, dashArray: '6, 6' }).addTo(map);
        xAxisLine = L.polyline([[0, -4000], [0, 4000]], { color: colors.xAxisColor, weight: 2, opacity: colors.xAxisTransparent ? 0 : 0.6, dashArray: '6, 6' }).addTo(map);

        map.on('moveend zoomend', updateGrid);
        map.on('zoomend', updateZoomDensityClass);
        map.on('moveend zoomend move zoom', updateAxisLabels);

        // カラーカスタマイズパネルからの変更を購読
        document.addEventListener('mapapp:colorschange', () => {
            updateGrid();
            updateAxisLineColors();
        });
    }

    window.MapApp.mapGrid = {
        init,
        updateGrid: () => updateGrid(),
        updateAxisLabels: () => updateAxisLabels(),
        updateZoomDensityClass: () => updateZoomDensityClass()
    };
})();
