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
        textBg: '#1a1a1f',
        // 透明にできる項目のON/OFF
        iconBorderTransparent: false,
        iconBgTransparent: false,
        textBgTransparent: false
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

    // 簡易的な16進カラーコードの妥当性チェック（#付き6桁 or 3桁）
    function isValidHex(value) {
        return /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/.test(value);
    }

    let customColors = loadCustomColors();

    function applyCustomColors() {
        const root = document.documentElement.style;
        root.setProperty('--custom-void-bg', customColors.voidBg);
        root.setProperty('--custom-panel-bg', customColors.panelBg);
        root.setProperty('--custom-icon-border', customColors.iconBorderTransparent ? 'transparent' : customColors.iconBorder);
        root.setProperty('--custom-icon-bg', customColors.iconBgTransparent ? 'transparent' : customColors.iconBg);
        root.setProperty('--custom-text-color', customColors.textColor);
        root.setProperty('--custom-text-bg', customColors.textBgTransparent ? 'transparent' : hexToRgba(customColors.textBg, 0.85));

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

    function setTransparent(key, isTransparent) {
        customColors[key] = isTransparent;
        applyCustomColors();
    }

    function saveCustomColors() {
        localStorage.setItem(CUSTOM_COLOR_STORAGE_KEY, JSON.stringify(customColors));
    }

    // 🎨 カラーカスタマイズパネルのUI（トグルボタン・色入力欄・16進テキスト欄・透明チェック・リセットボタン）を配線する
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

    // 透明チェックボックスがある項目（input id -> customColorsのキー）
    const transparentInputMap = {
        'cc-icon-border-transparent': 'iconBorderTransparent',
        'cc-icon-bg-transparent': 'iconBgTransparent',
        'cc-text-bg-transparent': 'textBgTransparent'
    };

    function syncColorInputsFromState() {
        Object.keys(colorInputMap).forEach((inputId) => {
            const key = colorInputMap[inputId];
            const colorInput = document.getElementById(inputId);
            const textInput = document.getElementById(`${inputId}-text`);
            const value = customColors[key];
            if (colorInput) colorInput.value = value;
            if (textInput) textInput.value = value;
        });

        Object.keys(transparentInputMap).forEach((checkboxId) => {
            const checkbox = document.getElementById(checkboxId);
            const key = transparentInputMap[checkboxId];
            if (!checkbox) return;
            checkbox.checked = !!customColors[key];
            const row = checkbox.closest('.color-row');
            if (row) row.classList.toggle('is-transparent', !!customColors[key]);
        });
    }

    function initUI() {
        // 色ピッカー ⇔ 16進テキスト入力の相互連動
        Object.keys(colorInputMap).forEach((inputId) => {
            const key = colorInputMap[inputId];
            const colorInput = document.getElementById(inputId);
            const textInput = document.getElementById(`${inputId}-text`);
            if (!colorInput) return;

            colorInput.addEventListener('input', (e) => {
                setColor(key, e.target.value);
                if (textInput) textInput.value = e.target.value;
            });
            colorInput.addEventListener('change', saveCustomColors);

            if (textInput) {
                textInput.addEventListener('input', (e) => {
                    const value = e.target.value.trim();
                    if (isValidHex(value)) {
                        setColor(key, value);
                        colorInput.value = value;
                    }
                });
                textInput.addEventListener('change', (e) => {
                    const value = e.target.value.trim();
                    if (isValidHex(value)) {
                        saveCustomColors();
                    } else {
                        // 不正な値なら現在の色に戻す
                        e.target.value = customColors[key];
                    }
                });
            }
        });

        // 透明チェックボックスの配線
        Object.keys(transparentInputMap).forEach((checkboxId) => {
            const checkbox = document.getElementById(checkboxId);
            const key = transparentInputMap[checkboxId];
            if (!checkbox) return;

            checkbox.addEventListener('change', (e) => {
                setTransparent(key, e.target.checked);
                saveCustomColors();
                const row = checkbox.closest('.color-row');
                if (row) row.classList.toggle('is-transparent', e.target.checked);
            });
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
