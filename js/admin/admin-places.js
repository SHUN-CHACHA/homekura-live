// ─── 場所（MAP_locations.js）編集用の状態 ───────────────
let places = [];
let placeEditIndex = -1;

// ==========================================================
// 🗺️ 場所（js/data/MAP_locations.js）編集機能
// メンバーではない目印（祭会場・共有地・初期地など）専用のセクションです。
// ==========================================================

// 上の2セクション（メンバー名簿・拠点マップ）で既に使われているアイコンファイル名を集めて、
// プルダウンから選べるようにする（表記ゆれ・タイプミス防止）
function collectAllKnownIcons() {
    const set = new Set();
    channels.forEach((ch) => { const f = deriveIconFromChannel(ch); if (f) set.add(f); });
    mapMembers.forEach((m) => { [m.icon, m.icon2, m.icon3].forEach((f) => { if (f && f.trim()) set.add(f.trim()); }); });
    places.forEach((p) => { if (p.icon && p.icon.trim()) set.add(p.icon.trim()); });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
}

function populateIconPicker() {
    const sel = document.getElementById('placeIconPicker');
    if (!sel) return;
    sel.innerHTML = '<option value="">— 既存のアイコンから選ぶ —</option>';
    collectAllKnownIcons().forEach((f) => {
        const opt = document.createElement('option');
        opt.value = f;
        opt.textContent = f;
        sel.appendChild(opt);
    });
    sel.value = "";
}

function fillIconFromPicker(val) {
    if (!val) return;
    document.getElementById('pl_icon').value = val;
}

// ─── フォーム⇔データ ────────────────────────────────────
function collectFormPlace() {
    return {
        name: document.getElementById('pl_name').value.trim(),
        icon: document.getElementById('pl_icon').value.trim(),
        x: Number(document.getElementById('pl_x').value) || 0,
        z: Number(document.getElementById('pl_z').value) || 0
    };
}

function savePlace() {
    const data = collectFormPlace();
    if (!data.name) { alert("名前を入力してください！"); return; }

    if (placeEditIndex > -1) {
        places[placeEditIndex] = data;
        alert(`「${data.name}」を更新しました！`);
        cancelPlaceEdit();
    } else {
        places.push(data);
        alert(`「${data.name}」を新規保存しました！`);
        clearPlaceForm();
    }

    localStorage.setItem('custom_locations', JSON.stringify(places));
    renderPlaceList();
    updateLocationOutput();
}

function deletePlace(idx) {
    if (confirm(`「${places[idx].name}」を削除しますか？`)) {
        if (placeEditIndex === idx) cancelPlaceEdit();
        places.splice(idx, 1);
        localStorage.setItem('custom_locations', JSON.stringify(places));
        renderPlaceList();
        updateLocationOutput();
    }
}

// ─── 場所一覧レンダリング ──────────────────────────────
function renderPlaceList() {
    const tbody = document.getElementById('placeTableBody');
    tbody.innerHTML = "";

    if (!places.length) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#8ca08a; padding:20px; font-size:13px;">場所データがありません。</td></tr>`;
        populateIconPicker();
        return;
    }

    places.forEach((p, idx) => {
        const avatarPath = p.icon ? `avatars/${p.icon}` : "avatars/fallback.svg";
        tbody.innerHTML += `
            <tr>
                <td><strong class="clickable-name" onclick="editPlace(${idx})" title="クリックして編集">${p.name || '(名称未設定)'}</strong></td>
                <td>
                    <div style="display:flex; align-items:center; gap:6px;">
                        <div class="mc-head-box">
                            <img class="mc-head-img" src="${avatarPath}" alt="${p.name || ''}" onerror="this.onerror=null; this.src='avatars/fallback.svg';">
                        </div>
                        <span style="font-size:12px; color:#5c6b5a;">${p.icon || '—'}</span>
                    </div>
                </td>
                <td style="font-family:monospace; font-size:12px;">${p.x}</td>
                <td style="font-family:monospace; font-size:12px;">${p.z}</td>
                <td><button class="btn-del" onclick="deletePlace(${idx})">削除</button></td>
            </tr>`;
    });

    populateIconPicker();
}

// ─── 編集モード ────────────────────────────────────────
function editPlace(idx) {
    placeEditIndex = idx;
    const p = places[idx];

    document.getElementById('pl_name').value = p.name || "";
    document.getElementById('pl_icon').value = p.icon || "";
    document.getElementById('pl_x').value = (typeof p.x === 'number') ? p.x : 0;
    document.getElementById('pl_z').value = (typeof p.z === 'number') ? p.z : 0;
    document.getElementById('placeIconPicker').value = "";

    document.getElementById('placeFormContainer').className = "editing";
    document.getElementById('placeEditNotice').style.display = "block";
    document.getElementById('placeSaveBtn').innerText = "変更を上書き保存";
    document.getElementById('placeCancelBtn').style.display = "inline-block";

    window.scrollTo({ top: document.getElementById('placeFormContainer').offsetTop - 20, behavior: 'smooth' });
}

function cancelPlaceEdit() {
    placeEditIndex = -1;
    clearPlaceForm();
    document.getElementById('placeFormContainer').className = "";
    document.getElementById('placeEditNotice').style.display = "none";
    document.getElementById('placeSaveBtn').innerText = "場所を保存";
    document.getElementById('placeCancelBtn').style.display = "none";
}

function clearPlaceForm() {
    ['pl_name', 'pl_icon', 'pl_x', 'pl_z'].forEach((id) => document.getElementById(id).value = "");
    document.getElementById('placeIconPicker').value = "";
}

// ─── js/data/MAP_locations.js 出力 ───────────────────────────
function formatLocationRow(p) {
    const x = Number.isFinite(p.x) ? p.x : 0;
    const z = Number.isFinite(p.z) ? p.z : 0;
    return `    { name: "${escJsString(p.name)}", icon: "${escJsString(p.icon)}", x: ${x}, z: ${z} },`;
}

function updateLocationOutput() {
    const header = `// ==========================================================
// 📍 homeクラ メンバー拠点マップ - 「場所」データ（メンバーではない目印）
// ここを編集すればマップに反映されます。
//
// 参加者（メンバー）とは別の扱いです。ここに追加・削除しても
// 「登録メンバー」の人数には一切影響しません。
//
// icon : avatars フォルダに入れた画像のファイル名（例: "xxxxxx.png"）
// 増減自由です。行ごとコピペして増やしたり、丸ごと削除して減らせます。
// ==========================================================
`;
    const rows = places.map((p) => formatLocationRow(p));
    const body = `const locationData = [\n${rows.join('\n')}\n    // 新しい目印を追加する例：\n    // { name: "◯◯タワー", icon: "xxx.png", x: 100, z: 200 },\n];\n`;

    document.getElementById('placeDataOutput').value = header + body;
}

function exportLocationData() {
    updateLocationOutput();
    navigator.clipboard.writeText(document.getElementById('placeDataOutput').value)
        .then(() => alert("js/data/MAP_locations.js 用のコードをコピーしました！js/data/MAP_locations.jsファイルに貼り付けて保存してください。"))
        .catch(() => { document.getElementById('placeDataOutput').select(); alert('自動コピーに失敗しました。テキストエリアを全選択して手動でコピーしてください。'); });
}

// js/data/MAP_locations.js を直接手入力で編集した場合に、このページ側のキャッシュ(localStorage)を破棄して
// 実際に読み込まれている locationData の内容に同期し直す
function reloadFromLocationJs() {
    if (typeof locationData === 'undefined') {
        alert("js/data/MAP_locations.js が読み込めていません。ページを開き直すか、MAP_locations.js の内容をご確認ください。");
        return;
    }
    if (!confirm("このブラウザに保存されている編集中のデータは破棄され、js/data/MAP_locations.js の内容に置き換わります。よろしいですか？")) {
        return;
    }
    localStorage.removeItem('custom_locations');
    places = JSON.parse(JSON.stringify(locationData));
    cancelPlaceEdit();
    renderPlaceList();
    updateLocationOutput();
    alert("js/data/MAP_locations.js の内容を読み込み直しました！");
}

function initPlaceAdmin() {
    const saved = localStorage.getItem('custom_locations');
    if (saved) {
        places = JSON.parse(saved);
    } else if (typeof locationData !== 'undefined') {
        places = JSON.parse(JSON.stringify(locationData));
    }
    renderPlaceList();
    updateLocationOutput();
}
