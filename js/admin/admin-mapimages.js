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
        // 配置図は画像ファイルではなく区画とメンバーのデータから自動で描くので、ここでは編集しない（並べ替えだけできる）
        const nameCell = m.layout
            ? `<strong>${m.label || '配置図'}</strong> <span style="font-size:11px; color:#5c6b5a;">（自動で描く図）</span>`
            : `<strong class="clickable-name" onclick="editMapImage(${idx})" title="クリックして編集">${stripMapPrefix(m.fileName) || '(未設定)'}</strong>`;
        tbody.innerHTML += `
            <tr>
                <td style="text-align:center; font-family:monospace;">${idx + 1}</td>
                <td>${nameCell}</td>
                <td style="font-family:monospace; font-size:11px;">${m.layout ? '—' : `[${b[0][0]}, ${b[0][1]}] → [${b[1][0]}, ${b[1][1]}]`}</td>
                <td style="font-family:monospace; font-size:12px; text-align:center;">${m.layout ? '—' : m.opacity}</td>
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

// ─── 📷 スクリーンショットのウォーターマーク（map-config.js の watermark） ─────────
let mapWatermark = { enabled: true, lines: [] };

function renderWatermarkForm() {
    document.getElementById('wm_enabled').checked = !!mapWatermark.enabled;
    document.getElementById('wm_text').value = (mapWatermark.lines || []).join('\n');
}

function saveWatermark() {
    mapWatermark = {
        enabled: document.getElementById('wm_enabled').checked,
        lines: document.getElementById('wm_text').value.split('\n').map((l) => l.trim()).filter(Boolean)
    };
    localStorage.setItem('custom_map_watermark', JSON.stringify(mapWatermark));
    updateMapConfigOutput();
    alert(mapWatermark.enabled
        ? 'ウォーターマークの設定を保存しました！下の「map-config.jsの内容をコピー」で js/map/map-config.js に反映してください。'
        : 'ウォーターマークを入れない設定にしました！下の「map-config.jsの内容をコピー」で js/map/map-config.js に反映してください。');
}

// ─── js/map/map-config.js 全文の出力 ─────────────────────────
// 実際の js/map/map-config.js を読み込み、その中の「地図の一覧（mapImageList）」と「ウォーターマーク（watermark）」の部分だけを
// この画面で編集した内容に差し替えて出力する（関数などそれ以外の部分は、今のファイルのまま変えない）。
let mapConfigSource = null;   // 実際の map-config.js の文字
let originalEntryTexts = {};  // 変更していない地図は、説明のコメントごと元の書き方のまま出すための対応表（中身 → 元の文字）

const LIST_RE = /    const mapImageList = \[\n([\s\S]*?)\n    \];/;
const WATERMARK_RE = /    const watermark = \{[\s\S]*?\n    \};/;

function jsString(s) {
    return `'${String(s || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

// 「const mapImageList = [ ... ];」の中身を、地図1つずつの元の文字（前に付いている説明のコメントも含む）に分ける
function splitArrayEntries(body) {
    const entries = [];
    let depth = 0, quote = null, from = 0;
    for (let i = 0; i < body.length; i++) {
        const ch = body[i];
        if (quote) {
            if (ch === '\\') { i++; continue; }
            if (ch === quote) quote = null;
            continue;
        }
        if (ch === '/' && body[i + 1] === '/') { // 行コメントの中の括弧は数えない
            const end = body.indexOf('\n', i);
            i = end === -1 ? body.length : end;
            continue;
        }
        if (ch === "'" || ch === '"' || ch === '`') { quote = ch; continue; }
        if (ch === '{') depth++;
        else if (ch === '}') {
            depth--;
            if (depth === 0) {
                let end = i + 1;
                if (body[end] === ',') end++;
                entries.push(body.slice(from, end).replace(/^\n+/, ''));
                from = end;
            }
        }
    }
    return entries;
}

function formatMapImageEntry(m) {
    const original = originalEntryTexts[JSON.stringify(m)];
    if (original) return original;
    if (m.layout) {
        return `        {
            label: ${jsString(m.label || '配置図')},
            layout: true
        },`;
    }
    const b = m.bounds || [[0, 0], [0, 0]];
    const num = (v) => (Number.isFinite(v) ? v : 0);
    const opacity = Number.isFinite(m.opacity) ? m.opacity : 1;
    return `        {
            fileName: ${jsString(m.fileName)},
            bounds: [[${num(b[0][0])}, ${num(b[0][1])}], [${num(b[1][0])}, ${num(b[1][1])}]],
            opacity: ${opacity}
        },`;
}

function formatWatermark(w) {
    const lines = (w.lines || []).map(jsString).join(', ');
    return `    const watermark = {
        enabled: ${w.enabled ? 'true' : 'false'},
        lines: [${lines}]
    };`;
}

function updateMapConfigOutput() {
    const out = document.getElementById('mapConfigOutput');
    if (!mapConfigSource || !LIST_RE.test(mapConfigSource) || !WATERMARK_RE.test(mapConfigSource)) {
        out.value = '';
        out.placeholder = 'js/map/map-config.js を読み込めなかったため、コードを作れません（サイトのアドレスで管理画面を開いてください）';
        return;
    }
    const listBlock = `    const mapImageList = [\n${mapImages.map(formatMapImageEntry).join('\n')}\n    ];`;
    out.value = mapConfigSource
        .replace(LIST_RE, () => listBlock)
        .replace(WATERMARK_RE, () => formatWatermark(mapWatermark));
}

function exportMapConfig() {
    updateMapConfigOutput();
    if (!document.getElementById('mapConfigOutput').value) {
        alert('js/map/map-config.js を読み込めなかったため、コピーできません。');
        return;
    }
    navigator.clipboard.writeText(document.getElementById('mapConfigOutput').value)
        .then(() => alert("js/map/map-config.js 用のコードをコピーしました！js/map/map-config.jsファイルに貼り付けて保存してください。"))
        .catch(() => { document.getElementById('mapConfigOutput').select(); alert('自動コピーに失敗しました。テキストエリアを全選択して手動でコピーしてください。'); });
}

function currentMapConfig() {
    return (window.MapApp && window.MapApp.mapConfig) || null;
}

// js/map/map-config.js を直接手入力で編集した場合に、このページ側のキャッシュ(localStorage)を破棄して
// 実際に読み込まれている内容（地図の一覧・ウォーターマーク）に同期し直す
function reloadFromMapConfigJs() {
    const cfg = currentMapConfig();
    if (!cfg || !cfg.mapImageList) {
        alert("js/map/map-config.js が読み込めていません。ページを開き直すか、map-config.js の内容をご確認ください。");
        return;
    }
    if (!confirm("このブラウザに保存されている編集中のデータは破棄され、js/map/map-config.js の内容に置き換わります。よろしいですか？")) {
        return;
    }
    localStorage.removeItem('custom_map_images');
    localStorage.removeItem('custom_map_watermark');
    mapImages = JSON.parse(JSON.stringify(cfg.mapImageList));
    mapWatermark = JSON.parse(JSON.stringify(cfg.watermark || { enabled: true, lines: [] }));
    cancelMapImageEdit();
    renderMapImageList();
    renderWatermarkForm();
    updateMapConfigOutput();
    alert("js/map/map-config.js の内容を読み込み直しました！");
}

async function initMapConfigAdmin() {
    const cfg = currentMapConfig();
    const saved = localStorage.getItem('custom_map_images');
    if (saved) {
        mapImages = JSON.parse(saved);
    } else if (cfg && cfg.mapImageList) {
        mapImages = JSON.parse(JSON.stringify(cfg.mapImageList));
    }
    const savedWm = localStorage.getItem('custom_map_watermark');
    if (savedWm) {
        mapWatermark = JSON.parse(savedWm);
    } else if (cfg && cfg.watermark) {
        mapWatermark = JSON.parse(JSON.stringify(cfg.watermark));
    }
    document.getElementById('mc_opacity').value = "1";
    renderMapImageList();
    renderWatermarkForm();

    // 今の js/map/map-config.js を読み込んでおく（出力の土台にする）
    try {
        const res = await fetch('js/map/map-config.js', { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        mapConfigSource = (await res.text()).replace(/\r\n/g, '\n');
        const m = mapConfigSource.match(LIST_RE);
        if (m && cfg && cfg.mapImageList) {
            const texts = splitArrayEntries(m[1]);
            cfg.mapImageList.forEach((entry, i) => {
                if (texts[i]) originalEntryTexts[JSON.stringify(entry)] = texts[i];
            });
        }
    } catch (e) {
        console.warn('js/map/map-config.js を読み込めませんでした:', e);
    }
    updateMapConfigOutput();
}
