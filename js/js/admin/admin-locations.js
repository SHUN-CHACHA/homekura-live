// ─── 拠点マップ（MAP_member.js）編集用の状態 ───────────────
let mapMembers   = [];
let locEditIndex = -1;

// ==========================================================
// 📍 拠点マップ（js/data/MAP_member.js）編集機能
// 「👥 メンバー追加・編集」（config.js）とは別データですが、
// 同じ管理画面上から一貫した操作感で編集できるようにしたセクションです。
// ==========================================================

// ─── 「登録メンバーから選択」ドロップダウンの選択肢を、上の名簿（channels）から生成 ───
function populateChannelSelects() {
    document.querySelectorAll('.loc-person-select').forEach((sel) => {
        const current = sel.value;
        sel.innerHTML = '<option value="">— 自由入力 —</option>';
        channels.forEach((ch, idx) => {
            const opt = document.createElement('option');
            opt.value = idx;
            opt.textContent = ch.name || `(名称未設定 ${idx})`;
            sel.appendChild(opt);
        });
        sel.value = (current !== "" && channels[Number(current)]) ? current : "";
    });
}

// 選択したチャンネルの名前・アイコンをフォームに自動入力する（表記ゆれ防止）
function deriveIconFromChannel(ch) {
    if (!ch) return "";
    if (ch.avatarImg) return ch.avatarImg.replace(/^avatars\//, '');
    const pureMcId = cleanMcId(ch.minecraftId);
    return pureMcId ? `${pureMcId}.svg` : "";
}

function fillPersonFromChannel(slot, idxStr) {
    if (idxStr === "") return; // 「自由入力」を選んだ場合は何もしない
    const ch = channels[Number(idxStr)];
    if (!ch) return;
    document.getElementById(`l_name${slot}`).value = ch.name || "";
    document.getElementById(`l_icon${slot}`).value = deriveIconFromChannel(ch);
}

// ─── フォーム⇔データ ────────────────────────────────────
function collectFormLocation() {
    return {
        area:  document.getElementById('l_area').value.trim(),
        name:  document.getElementById('l_name1').value.trim(),
        icon:  document.getElementById('l_icon1').value.trim(),
        name2: document.getElementById('l_name2').value.trim(),
        icon2: document.getElementById('l_icon2').value.trim(),
        name3: document.getElementById('l_name3').value.trim(),
        icon3: document.getElementById('l_icon3').value.trim(),
        x: Number(document.getElementById('l_x').value) || 0,
        z: Number(document.getElementById('l_z').value) || 0
    };
}

function saveLocation() {
    const data = collectFormLocation();

    if (locEditIndex > -1) {
        mapMembers[locEditIndex] = data;
        alert(`「${data.area || '(未登録)'}」の拠点情報を更新しました！`);
        cancelLocEdit();
    } else {
        mapMembers.push(data);
        alert(`「${data.area || '(未登録)'}」の拠点を新規保存しました！`);
        clearLocForm();
    }

    localStorage.setItem('custom_map_members', JSON.stringify(mapMembers));
    renderLocList();
    updateMapMemberOutput();
}

function deleteLocation(idx) {
    if (confirm(`「${mapMembers[idx].area || '(未登録)'}」の拠点データを削除しますか？`)) {
        if (locEditIndex === idx) cancelLocEdit();
        mapMembers.splice(idx, 1);
        localStorage.setItem('custom_map_members', JSON.stringify(mapMembers));
        renderLocList();
        updateMapMemberOutput();
    }
}

// ─── 拠点一覧レンダリング ──────────────────────────────
function renderLocList() {
    const tbody = document.getElementById('locTableBody');
    tbody.innerHTML = "";

    if (!mapMembers.length) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:#8ca08a; padding:20px; font-size:13px;">拠点データがありません。</td></tr>`;
        return;
    }

    const personCell = (name, icon) => {
        if (!name && !icon) return `<span style="color:#94a3b8; font-size:11px;">—</span>`;
        const avatarPath = icon ? `avatars/${icon}` : "avatars/fallback.svg";
        return `<div style="display:flex; align-items:center; gap:6px;">
            <div class="mc-head-box" style="width:24px; height:24px;">
                <img class="mc-head-img" src="${avatarPath}" alt="${name || ''}" onerror="this.onerror=null; this.src='avatars/fallback.svg';">
            </div>
            <span style="font-size:12px;">${name || '(名前未入力)'}</span>
        </div>`;
    };

    mapMembers.forEach((m, idx) => {
        tbody.innerHTML += `
            <tr>
                <td><strong class="clickable-name" onclick="editLocation(${idx})" title="クリックして編集">${m.area || '(未登録)'}</strong></td>
                <td>${personCell(m.name, m.icon)}</td>
                <td>${personCell(m.name2, m.icon2)}</td>
                <td>${personCell(m.name3, m.icon3)}</td>
                <td style="font-family:monospace; font-size:12px;">${m.x}</td>
                <td style="font-family:monospace; font-size:12px;">${m.z}</td>
                <td><button class="btn-del" onclick="deleteLocation(${idx})">削除</button></td>
            </tr>`;
    });
}

// ─── 編集モード ────────────────────────────────────────
function editLocation(idx) {
    locEditIndex = idx;
    const m = mapMembers[idx];

    document.getElementById('l_area').value  = m.area || "";
    document.getElementById('l_x').value     = (typeof m.x === 'number') ? m.x : 0;
    document.getElementById('l_z').value     = (typeof m.z === 'number') ? m.z : 0;
    document.getElementById('l_name1').value = m.name || "";
    document.getElementById('l_icon1').value = m.icon || "";
    document.getElementById('l_name2').value = m.name2 || "";
    document.getElementById('l_icon2').value = m.icon2 || "";
    document.getElementById('l_name3').value = m.name3 || "";
    document.getElementById('l_icon3').value = m.icon3 || "";
    document.querySelectorAll('.loc-person-select').forEach(sel => sel.value = "");

    document.getElementById('locFormContainer').className = "editing";
    document.getElementById('locEditNotice').style.display = "block";
    document.getElementById('locSaveBtn').innerText = "変更を上書き保存";
    document.getElementById('locCancelBtn').style.display = "inline-block";

    window.scrollTo({ top: document.getElementById('locFormContainer').offsetTop - 20, behavior: 'smooth' });
}

function cancelLocEdit() {
    locEditIndex = -1;
    clearLocForm();
    document.getElementById('locFormContainer').className = "";
    document.getElementById('locEditNotice').style.display = "none";
    document.getElementById('locSaveBtn').innerText = "拠点を保存";
    document.getElementById('locCancelBtn').style.display = "none";
}

function clearLocForm() {
    ['l_area','l_x','l_z','l_name1','l_icon1','l_name2','l_icon2','l_name3','l_icon3'].forEach(id => document.getElementById(id).value = "");
    document.querySelectorAll('.loc-person-select').forEach(sel => sel.value = "");
}

// ─── js/data/MAP_member.js 出力 ─────────────────────────────
function escJsString(s) {
    return (s || "").toString().replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function formatMapMemberRow(m) {
    const x = Number.isFinite(m.x) ? m.x : 0;
    const z = Number.isFinite(m.z) ? m.z : 0;
    return `    { area: "${escJsString(m.area)}", name: "${escJsString(m.name)}", icon: "${escJsString(m.icon)}", name2: "${escJsString(m.name2)}", icon2: "${escJsString(m.icon2)}", name3: "${escJsString(m.name3)}", icon3: "${escJsString(m.icon3)}", x: ${x}, z: ${z} }`;
}

function updateMapMemberOutput() {
    const header = `// ==========================================================
// 📊 homeクラ メンバー拠点マップ - メンバーデータ
// ここを編集すればマップ・一覧に反映されます。
//
// icon  : avatars フォルダに入れた顔画像のファイル名（例: "xxxxxx.png"）
//         空欄のままだとプレースホルダー画像が表示されます
// name2 / icon2 : 同じ拠点に2人目がいる場合はここに記入すると
//                 アイコンが2つ並んで表示されます
// name3 / icon3 : 同じ拠点に3人目がいる場合はここに記入すると
//                 アイコンが3つ並んで表示されます（1人1行で改行表示）
// area / name が空欄の行は「未登録」として地図にも一覧にも表示されません
// ==========================================================
`;
    const rows = mapMembers.map((m, idx) => {
        const comma = (idx < mapMembers.length - 1) ? ',' : '';
        return `${formatMapMemberRow(m)}${comma} // ${idx + 1}人目`;
    });
    const body = `const memberData = [\n${rows.join('\n')}\n];\n`;

    document.getElementById('mapMemberOutput').value = header + body;
}

function exportMapMembers() {
    updateMapMemberOutput();
    navigator.clipboard.writeText(document.getElementById('mapMemberOutput').value)
        .then(() => alert("js/data/MAP_member.js 用のコードをコピーしました！js/data/MAP_member.jsファイルに貼り付けて保存してください。"))
        .catch(() => { document.getElementById('mapMemberOutput').select(); alert('自動コピーに失敗しました。テキストエリアを全選択して手動でコピーしてください。'); });
}

// js/data/MAP_member.js を直接手入力で編集した場合に、このページ側のキャッシュ(localStorage)を破棄して
// 実際に読み込まれている memberData の内容に同期し直す
function reloadFromMapMemberJs() {
    if (typeof memberData === 'undefined') {
        alert("js/data/MAP_member.js が読み込めていません。ページを開き直すか、MAP_member.js の内容をご確認ください。");
        return;
    }
    if (!confirm("このブラウザに保存されている編集中のデータは破棄され、js/data/MAP_member.js の内容に置き換わります。よろしいですか？")) {
        return;
    }
    localStorage.removeItem('custom_map_members');
    mapMembers = JSON.parse(JSON.stringify(memberData));
    cancelLocEdit();
    renderLocList();
    updateMapMemberOutput();
    alert("js/data/MAP_member.js の内容を読み込み直しました！");
}

function initLocAdmin() {
    const savedLoc = localStorage.getItem('custom_map_members');
    if (savedLoc) {
        mapMembers = JSON.parse(savedLoc);
    } else if (typeof memberData !== 'undefined') {
        mapMembers = JSON.parse(JSON.stringify(memberData));
    }
    renderLocList();
    updateMapMemberOutput();
}
