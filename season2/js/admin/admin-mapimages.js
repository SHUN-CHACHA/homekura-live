// ─── 背景地図（map-config.js の mapImageList）編集用の状態 ───
let mapImages = [];
let mapImageEditIndex = -1;

// ==========================================================
// 🖼️ 背景地図（js/map/map-config.js の mapImageList）編集機能
// ==========================================================

function stripMapPrefix(fileName) {
    return (fileName || "").replace(/^map\//, '');
}

function collectFormMapImage() {
    const rawName = document.getElementById('mc_filename').value.trim();
    const fileName = rawName ? (rawName.startsWith('map/') ? rawName : `map/${rawName}`) : '';
    const opacityRaw = document.getElementById('mc_opacity').value.trim();

    return {
        fileName,
        bounds: [
            [Number(document.getElementById('mc_x1').value) || 0, Number(document.getElementById('mc_z1').value) || 0],
            [Number(document.getElementById('mc_x2').value) || 0, Number(document.getElementById('mc_z2').value) || 0]
        ],
        opacity: opacityRaw !== "" ? Number(opacityRaw) : 1
    };
}

function saveMapImage() {
    const data = collectFormMapImage();
    if (!data.fileName) { alert("画像ファイル名を入力してください！"); return; }

    if (mapImageEditIndex > -1) {
        mapImages[mapImageEditIndex] = data;
        alert(`「${stripMapPrefix(data.fileName)}」を更新しました！`);
        cancelMapImageEdit();
    } else {
        // 新規追加は先頭（＝初期表示される最新の地図）に入れる
        mapImages.unshift(data);
        alert(`「${stripMapPrefix(data.fileName)}」を一覧の先頭に新規保存しました！`);
        clearMapImageForm();
    }

    localStorage.setItem('custom_map_images', JSON.stringify(mapImages));
    renderMapImageList();
    updateMapConfigOutput();
}

function deleteMapImage(idx) {
    if (confirm(`「${stripMapPrefix(mapImages[idx].fileName)}」を削除しますか？`)) {
        if (mapImageEditIndex === idx) cancelMapImageEdit();
        mapImages.splice(idx, 1);
        localStorage.setItem('custom_map_images', JSON.stringify(mapImages));
        renderMapImageList();
        updateMapConfigOutput();
    }
}

function moveMapImage(idx, delta) {
    const target = idx + delta;
    if (target < 0 || target >= mapImages.length) return;
    [mapImages[idx], mapImages[target]] = [mapImages[target], mapImages[idx]];
    if (mapImageEditIndex === idx) mapImageEditIndex = target;
    else if (mapImageEditIndex === target) mapImageEditIndex = idx;
    localStorage.setItem('custom_map_images', JSON.stringify(mapImages));
    renderMapImageList();
    updateMapConfigOutput();
}

function renderMapImageList() {
    const tbody = document.getElementById('mapImageTableBody');
    tbody.innerHTML = "";

    if (!mapImages.length) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#8ca08a; padding:20px; font-size:13px;">背景地図データがありません。</td></tr>`;
        return;
    }

    mapImages.forEach((m, idx) => {
        const b = m.bounds || [[0, 0], [0, 0]];
        tbody.innerHTML += `
            <tr>
                <td style="text-align:center; font-family:monospace;">${idx + 1}</td>
                <td><strong class="clickable-name" onclick="editMapImage(${idx})" title="クリックして編集">${stripMapPrefix(m.fileName) || '(未設定)'}</strong></td>
                <td style="font-family:monospace; font-size:11px;">[${b[0][0]}, ${b[0][1]}] → [${b[1][0]}, ${b[1][1]}]</td>
                <td style="font-family:monospace; font-size:12px; text-align:center;">${m.opacity}</td>
                <td>
                    <button class="btn-uuid-manual" style="font-size:11px;" onclick="moveMapImage(${idx}, -1)" ${idx === 0 ? 'disabled' : ''}>▲</button>
                    <button class="btn-uuid-manual" style="font-size:11px;" onclick="moveMapImage(${idx}, 1)" ${idx === mapImages.length - 1 ? 'disabled' : ''}>▼</button>
                    <button class="btn-del" onclick="deleteMapImage(${idx})">削除</button>
                </td>
            </tr>`;
    });
}

function editMapImage(idx) {
    mapImageEditIndex = idx;
    const m = mapImages[idx];
    const b = m.bounds || [[0, 0], [0, 0]];

    document.getElementById('mc_filename').value = stripMapPrefix(m.fileName);
    document.getElementById('mc_x1').value = b[0][0];
    document.getElementById('mc_z1').value = b[0][1];
    document.getElementById('mc_x2').value = b[1][0];
    document.getElementById('mc_z2').value = b[1][1];
    document.getElementById('mc_opacity').value = (typeof m.opacity === 'number') ? m.opacity : 1;

    document.getElementById('mapImageFormContainer').className = "editing";
    document.getElementById('mapImageEditNotice').style.display = "block";
    document.getElementById('mapImageSaveBtn').innerText = "変更を上書き保存";
    document.getElementById('mapImageCancelBtn').style.display = "inline-block";

    window.scrollTo({ top: document.getElementById('mapImageFormContainer').offsetTop - 20, behavior: 'smooth' });
}

function cancelMapImageEdit() {
    mapImageEditIndex = -1;
    clearMapImageForm();
    document.getElementById('mapImageFormContainer').className = "";
    document.getElementById('mapImageEditNotice').style.display = "none";
    document.getElementById('mapImageSaveBtn').innerText = "背景地図を保存";
    document.getElementById('mapImageCancelBtn').style.display = "none";
}

function clearMapImageForm() {
    ['mc_filename', 'mc_x1', 'mc_z1', 'mc_x2', 'mc_z2'].forEach((id) => document.getElementById(id).value = "");
    document.getElementById('mc_opacity').value = "1";
}

// ─── js/map/map-config.js 全文の出力 ─────────────────────────
// mapImageList 以外の部分（関数・エクスポート部分）は変更されないので、
// 実際のファイルからそのまま抜き出した固定テキストとして持っておく。
const MAP_CONFIG_HEAD = [
    "// ==========================================================",
    "// 🗺️ 背景地図画像コンポーネント",
    "// window.MapApp.mapConfig として公開します。",
    "//",
    "// ★ 新しい月の地図ができたら、この mapImageList に追記してください！",
    "// 毎月の地図画像は \"map\" フォルダの中に入れてください（ファイル名の.pngを除いた名前がそのまま地図のドロップダウンメニューに表示されます）",
    "// 例：ファイル名：7月4日.png　→　「7月4日」",
    "// 一番上（配列の先頭）が「初期表示される最新の地図」になります。新しい月の画像は",
    "// 配列の先頭に追加してください。",
    "// ==========================================================",
    "(function () {",
    "    window.MapApp = window.MapApp || {};",
].join('\n');

const MAP_CONFIG_TAIL = [
    "    // ファイル名から拡張子(.png)を除いた部分をそのままラベルとして使う",
    "    function getMapLabel(fileName) {",
    "        const base = fileName.split('/').pop();",
    "        return base.replace(/\\.[^/.]+$/, '');",
    "    }",
    "",
    "    // bounds([X, Z]の順)をLeafletが要求する[Z由来の緯度, X由来の経度]の順に変換する",
    "    function toLeafletBounds(bounds) {",
    "        return bounds.map(([x, z]) => [-z, x]);",
    "    }",
    "",
    "    let map = null;",
    "    let bgImageOverlay = null;",
    "    const mapImageSelects = () => Array.from(document.querySelectorAll('.map-image-select'));",
    "",
    "    // ドロップダウンに mapImageList の一覧を反映する（先頭＝最新が選択された状態で開始）",
    "    // デスクトップ用・スマホ用など、複数箇所にある .map-image-select すべてに反映する",
    "    function populateMapImageSelect() {",
    "        mapImageSelects().forEach((sel) => {",
    "            sel.innerHTML = '';",
    "            mapImageList.forEach((entry, index) => {",
    "                const option = document.createElement('option');",
    "                option.value = index;",
    "                option.textContent = getMapLabel(entry.fileName);",
    "                sel.appendChild(option);",
    "            });",
    "        });",
    "    }",
    "",
    "    // どれか1つのドロップダウンが変更されたら、他のドロップダウンにも同じ選択を反映する",
    "    function syncMapImageSelects(value) {",
    "        mapImageSelects().forEach((sel) => { sel.value = value; });",
    "    }",
    "",
    "    function loadBackgroundImage() {",
    "        // 既存の画像レイヤーがあれば一旦地図から削除する",
    "        if (bgImageOverlay) {",
    "            map.removeLayer(bgImageOverlay);",
    "            bgImageOverlay = null;",
    "        }",
    "",
    "        // チェックボックスがON、かつ選択中の地図画像がある場合にのみ重ねる",
    "        const isChecked = document.getElementById('toggle-bg-image').checked;",
    "        const currentSelect = mapImageSelects()[0];",
    "        const selectedEntry = mapImageList[Number(currentSelect ? currentSelect.value : 0)] || mapImageList[0];",
    "",
    "        if (isChecked && selectedEntry && selectedEntry.fileName) {",
    "            bgImageOverlay = L.imageOverlay(selectedEntry.fileName, toLeafletBounds(selectedEntry.bounds), {",
    "                opacity: selectedEntry.opacity,",
    "                interactive: false // 画像がクリック操作を遮らないようにする",
    "            });",
    "",
    "            // 画像が見つからなくても地図全体がクラッシュしないためのエラー対策",
    "            bgImageOverlay.on('error', function () {",
    "                console.log(`背景画像 ${selectedEntry.fileName} が見つからないか、ローカル制限でロードできません。`);",
    "            });",
    "",
    "            bgImageOverlay.addTo(map);",
    "        }",
    "    }",
    "",
    "    function init(mapInstance) {",
    "        map = mapInstance;",
    "        populateMapImageSelect();",
    "",
    "        document.getElementById('toggle-bg-image').addEventListener('change', loadBackgroundImage);",
    "        document.querySelectorAll('.map-image-select').forEach((sel) => {",
    "            sel.addEventListener('change', (e) => {",
    "                syncMapImageSelects(e.target.value);",
    "                loadBackgroundImage();",
    "            });",
    "        });",
    "    }",
    "",
    "    window.MapApp.mapConfig = {",
    "        mapImageList,",
    "        getMapLabel,",
    "        toLeafletBounds,",
    "        init,",
    "        loadBackgroundImage: () => loadBackgroundImage()",
    "    };",
    "})();",
    "",
].join('\n');

function formatMapImageEntry(m) {
    const b = m.bounds || [[0, 0], [0, 0]];
    const x1 = Number.isFinite(b[0][0]) ? b[0][0] : 0;
    const z1 = Number.isFinite(b[0][1]) ? b[0][1] : 0;
    const x2 = Number.isFinite(b[1][0]) ? b[1][0] : 0;
    const z2 = Number.isFinite(b[1][1]) ? b[1][1] : 0;
    const opacity = Number.isFinite(m.opacity) ? m.opacity : 1;
    const fileName = (m.fileName || '').replace(/'/g, "\\'");
    return `        {
            fileName: '${fileName}',
            bounds: [[${x1}, ${z1}], [${x2}, ${z2}]],
            opacity: ${opacity}
        },`;
}

function updateMapConfigOutput() {
    const entries = mapImages.map((m) => formatMapImageEntry(m));
    const arrayBlock = `    const mapImageList = [\n${entries.join('\n')}\n    ];`;
    const fullFile = `${MAP_CONFIG_HEAD}\n\n${arrayBlock}\n\n${MAP_CONFIG_TAIL}`;
    document.getElementById('mapConfigOutput').value = fullFile;
}

function exportMapConfig() {
    updateMapConfigOutput();
    navigator.clipboard.writeText(document.getElementById('mapConfigOutput').value)
        .then(() => alert("js/map/map-config.js 用のコードをコピーしました！js/map/map-config.jsファイルに貼り付けて保存してください。"))
        .catch(() => { document.getElementById('mapConfigOutput').select(); alert('自動コピーに失敗しました。テキストエリアを全選択して手動でコピーしてください。'); });
}

// js/map/map-config.js を直接手入力で編集した場合に、このページ側のキャッシュ(localStorage)を破棄して
// 実際に読み込まれている mapImageList の内容に同期し直す
function reloadFromMapConfigJs() {
    if (!window.MapApp || !window.MapApp.mapConfig || !window.MapApp.mapConfig.mapImageList) {
        alert("js/map/map-config.js が読み込めていません。ページを開き直すか、map-config.js の内容をご確認ください。");
        return;
    }
    if (!confirm("このブラウザに保存されている編集中のデータは破棄され、js/map/map-config.js の内容に置き換わります。よろしいですか？")) {
        return;
    }
    localStorage.removeItem('custom_map_images');
    mapImages = JSON.parse(JSON.stringify(window.MapApp.mapConfig.mapImageList));
    cancelMapImageEdit();
    renderMapImageList();
    updateMapConfigOutput();
    alert("js/map/map-config.js の内容を読み込み直しました！");
}

function initMapConfigAdmin() {
    const saved = localStorage.getItem('custom_map_images');
    if (saved) {
        mapImages = JSON.parse(saved);
    } else if (window.MapApp && window.MapApp.mapConfig && window.MapApp.mapConfig.mapImageList) {
        mapImages = JSON.parse(JSON.stringify(window.MapApp.mapConfig.mapImageList));
    }
    document.getElementById('mc_opacity').value = "1";
    renderMapImageList();
    updateMapConfigOutput();
}
