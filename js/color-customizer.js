// ==========================================================
// 🎨 カラーカスタマイズ機能コンポーネント（PC専用・この端末にのみ保存）
// window.MapApp.colorCustomizer として公開します。
// 色が変わったら 'mapapp:colorschange' イベントを発行するので、
// 地図側（map-grid.js）はそれを購読して自分の色を更新します。
// ==========================================================
(function () {
    window.MapApp = window.MapApp || {};

    const CUSTOM_COLOR_STORAGE_KEY = 'homekura_map_custom_colors';

    const defaultCustomColors = {
        voidBg: '#141417',
        gridColor: '#ffffff',
        xAxisColor: '#ef4444',
        zAxisColor: '#3b82f6',
        panelBg: '#1a1a1f',
        iconBorder: '#4caf50',
        iconBg: '#26262b',
        textColor: '#ffffff',
        textBg: '#1a1a1f'
    };

    function loadCustomColors() {
        try {
            const saved = JSON.parse(localStorage.getItem(CUSTOM_COLOR_STORAGE_KEY));
            return { ...defaultCustomColors, ...(saved || {}) };
        } catch (e) {
            return { ...defaultCustomColors };
        }
    }

    // 16進カラーコードを rgba() 文字列に変換する（ネームタグ背景の半透明化に使用）
    function hexToRgba(hex, alpha) {
        const h = hex.replace('#', '');
        const r = parseInt(h.substring(0, 2), 16);
        const g = parseInt(h.substring(2, 4), 16);
        const b = parseInt(h.substring(4, 6), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    let customColors = loadCustomColors();

    function applyCustomColors() {
        const root = document.documentElement.style;
        root.setProperty('--custom-void-bg', customColors.voidBg);
        root.setProperty('--custom-panel-bg', customColors.panelBg);
        root.setProperty('--custom-icon-border', customColors.iconBorder);
        root.setProperty('--custom-icon-bg', customColors.iconBg);
        root.setProperty('--custom-text-color', customColors.textColor);
        root.setProperty('--custom-text-bg', hexToRgba(customColors.textBg, 0.85));

        // グリッド線・軸線の色更新は地図側(map-grid.js)に任せる。
        // このイベントを購読して色を反映してもらう。
        document.dispatchEvent(new CustomEvent('mapapp:colorschange', { detail: { colors: customColors } }));
    }

    function resetCustomColors() {
        customColors = { ...defaultCustomColors };
        localStorage.removeItem(CUSTOM_COLOR_STORAGE_KEY);
        applyCustomColors();
    }

    function setColor(key, value) {
        customColors[key] = value;
        applyCustomColors();
    }

    function saveCustomColors() {
        localStorage.setItem(CUSTOM_COLOR_STORAGE_KEY, JSON.stringify(customColors));
    }

    // 🎨 カラーカスタマイズパネルのUI（トグルボタン・色入力欄・リセットボタン）を配線する
    const colorInputMap = {
        'cc-void-bg': 'voidBg',
        'cc-grid-color': 'gridColor',
        'cc-x-axis-color': 'xAxisColor',
        'cc-z-axis-color': 'zAxisColor',
        'cc-panel-bg': 'panelBg',
        'cc-icon-border': 'iconBorder',
        'cc-icon-bg': 'iconBg',
        'cc-text-color': 'textColor',
        'cc-text-bg': 'textBg'
    };

    function syncColorInputsFromState() {
        Object.keys(colorInputMap).forEach((inputId) => {
            const input = document.getElementById(inputId);
            if (input) input.value = customColors[colorInputMap[inputId]];
        });
    }

    function initUI() {
        Object.keys(colorInputMap).forEach((inputId) => {
            const input = document.getElementById(inputId);
            if (!input) return;
            input.addEventListener('input', (e) => {
                setColor(colorInputMap[inputId], e.target.value);
            });
            input.addEventListener('change', saveCustomColors);
        });

        const toggleBtn = document.getElementById('color-customizer-toggle');
        const panel = document.getElementById('color-customizer-panel');
        if (toggleBtn && panel) {
            toggleBtn.addEventListener('click', () => panel.classList.toggle('open'));
        }

        const resetBtn = document.getElementById('color-customizer-reset');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                resetCustomColors();
                syncColorInputsFromState();
            });
        }

        syncColorInputsFromState();
    }

    window.MapApp.colorCustomizer = {
        defaultCustomColors,
        getColors: () => customColors,
        applyCustomColors,
        resetCustomColors,
        setColor,
        saveCustomColors,
        initUI
    };
})();
