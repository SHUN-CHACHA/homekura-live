// ==========================================================
// 👥 メンバー名簿（js/data/config.js）編集タブのロジック
// ==========================================================
let channels  = [];
let editIndex = -1;
let currentUUID = "";
let uuidTimer   = null;

// ─── 初期化 ───────────────────────────────────────────
function initAdmin() {
    const saved = localStorage.getItem('custom_channels');
    if (saved) { channels = JSON.parse(saved); }
    else if (window.CONFIG?.DEFAULT_CHANNELS) { channels = [...window.CONFIG.DEFAULT_CHANNELS]; }
    renderMemberList();
    updateConfigOutput();
}

// ─── カラー同期 ────────────────────────────────────────
function syncColorPickerToText(val) { document.getElementById('m_color_text').value = val.toUpperCase(); }
function syncTextColorToPicker(val) { if (val.match(/^#[0-9a-fA-F]{6}$/)) document.getElementById('m_color').value = val; }

// ─── Minecraft ID 入力（debounce 700ms）──────────────────
function onMcIdInput(rawId) {
    const mcId = cleanMcId(rawId);
    clearTimeout(uuidTimer);
    currentUUID = "";
    resetUuidUI();

    if (!mcId) { updateAvatarPreview("", ""); return; }

    setBadge("wait", "入力受付中…");
    uuidTimer = setTimeout(() => fetchUUID(mcId), 700);
}

// ─── UUID取得 (Ashcon API — CORS対応) ──────────────────
// Mojang の api.mojang.com はブラウザからの fetch を CORS でブロックするため、
// CORS ヘッダーを付けて中継してくれる api.ashcon.app を使用する。
async function fetchUUID(mcId) {
    setBadge("wait", "UUID取得中…");
    try {
        const res = await fetch(`https://api.ashcon.app/mojang/v2/user/${encodeURIComponent(mcId)}`);
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.reason || `HTTP ${res.status}`);
        }
        const data = await res.json();
        // ashcon は "uuid" フィールドにハイフン付きで返してくれる
        const uuid = data.uuid;
        if (!uuid) throw new Error("UUIDが見つかりません");

        currentUUID = uuid;
        setUuidDisplay(uuid, "ok");
        setBadge("ok", "✅ 取得成功");
        updateAvatarPreview(mcId, uuid);

    } catch (e) {
        currentUUID = "";
        setUuidDisplay(`取得失敗: ${e.message}`, "err");
        setBadge("err", "❌ 失敗");
        updateAvatarPreview("", "");
        // 失敗時は手動入力ボタンを表示
        document.getElementById('uuidManualToggleBtn').style.display = "inline-block";
    }
}

// ─── UUID手動入力 ───────────────────────────────────────
function toggleUuidManual() {
    const area = document.getElementById('uuidManualArea');
    const isOpen = area.style.display !== "none";
    if (isOpen) {
        closeUuidManual();
    } else {
        area.style.display = "block";
        document.getElementById('uuidManualInput').focus();
    }
}

function closeUuidManual() {
    document.getElementById('uuidManualArea').style.display = "none";
    document.getElementById('uuidManualInput').value = "";
    document.getElementById('uuidManualValidation').textContent = "";
    document.getElementById('uuidManualConfirmBtn').disabled = true;
}

// UUID形式バリデーション（ハイフンあり・なし両対応）
function validateManualUuid(val) {
    const trimmed = val.trim();
    const validationEl = document.getElementById('uuidManualValidation');
    const confirmBtn = document.getElementById('uuidManualConfirmBtn');

    // ハイフンなし32文字 or ハイフンあり36文字
    const noHyphen = /^[0-9a-fA-F]{32}$/.test(trimmed);
    const withHyphen = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(trimmed);

    if (noHyphen || withHyphen) {
        validationEl.style.color = "#065f46";
        validationEl.textContent = "✅ 正しいUUID形式です";
        confirmBtn.disabled = false;
    } else if (trimmed.length > 0) {
        validationEl.style.color = "#991b1b";
        validationEl.textContent = "❌ UUID形式が正しくありません（例: 069a79f4-44e9-4726-a5be-fca90e38aaf5）";
        confirmBtn.disabled = true;
    } else {
        validationEl.textContent = "";
        confirmBtn.disabled = true;
    }
}

function confirmManualUuid() {
    const mcId = cleanMcId(document.getElementById('m_mc').value);
    let val = document.getElementById('uuidManualInput').value.trim();

    // ハイフンなし32文字の場合は自動でハイフン付きに変換
    if (/^[0-9a-fA-F]{32}$/.test(val)) {
        val = `${val.slice(0,8)}-${val.slice(8,12)}-${val.slice(12,16)}-${val.slice(16,20)}-${val.slice(20)}`;
    }

    currentUUID = val;
    setUuidDisplay(val, "ok");
    setBadge("ok", "✅ 手動入力");
    document.getElementById('uuidManualToggleBtn').style.display = "none";
    closeUuidManual();
    updateAvatarPreview(mcId, val);
}

// ─── UUID表示UI ────────────────────────────────────────
function resetUuidUI() {
    const el = document.getElementById('uuidDisplay');
    el.textContent = "—";
    el.className = "uuid-display";
    document.getElementById('uuidBadge').style.display = "none";
}
function setUuidDisplay(text, state) {
    const el = document.getElementById('uuidDisplay');
    el.textContent = text;
    el.className = `uuid-display${state ? ' ' + state : ''}`;
}
function setBadge(cls, text) {
    const el = document.getElementById('uuidBadge');
    el.className = `uuid-badge ${cls}`;
    el.textContent = text;
    el.style.display = "inline-block";
}

// ─── アバタープレビュー（Mineatar）────────────────────────
function updateAvatarPreview(mcId, uuid) {
    const box  = document.getElementById('previewHeadBox');
    const btn  = document.getElementById('downloadAvatarBtn');
    const note = document.getElementById('mineafarNote');

    if (uuid) {
        const imgUrl = `https://api.mineatar.io/head/${uuid}?overlay=true&scale=8`;
        box.innerHTML = `<img class="mc-head-img" src="${imgUrl}"
            onerror="this.onerror=null; this.src='avatars/fallback.svg';">`;
        btn.disabled  = false;
        btn.innerText = `画像を ${mcId}.png でPCに保存`;
        note.style.display = "block";
    } else {
        box.innerHTML = `<div class="coming-soon-lbl">CS</div>`;
        btn.disabled  = true;
        btn.innerText = "画像を [マイクラID].png でPCに保存";
        note.style.display = "none";
    }
}

// ─── PNGダウンロード ────────────────────────────────────
// ※ 以前はBase64エンコードしてSVGラッパーに格納して保存していたが、
//   表示先（マップ・一覧）は元々CSS側で背景色/角丸を付けており、SVGの背景矩形は使われていなかった。
//   また、SVG内で36pxに一度縮小 → 表示先でさらに縮小、という二重縮小になっており、
//   小さいマーカー表示（拠点マップの複数人アイコンなど）で表示崩れが起きたため、
//   PNGをそのまま保存する方式に変更した（2026-08-18）。
async function downloadMinecraftAvatar() {
    const mcId = cleanMcId(document.getElementById('m_mc').value);
    if (!mcId || !currentUUID) { alert("UUID取得が完了してからダウンロードしてください。"); return; }

    const btn = document.getElementById('downloadAvatarBtn');
    const orig = btn.innerText;
    btn.disabled = true;
    btn.innerText = "ダウンロード中…";

    try {
        const pngUrl  = `https://api.mineatar.io/head/${currentUUID}?overlay=true&scale=8`;
        const response = await fetch(pngUrl);
        if (!response.ok) throw new Error("Mineatar画像の取得に失敗しました");

        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl; a.download = `${mcId}.png`;
        document.body.appendChild(a); a.click();
        document.body.removeChild(a); URL.revokeObjectURL(blobUrl);

    } catch (err) {
        alert("画像の保存に失敗しました。\n" + err.message);
        console.error(err);
    } finally {
        btn.disabled = false;
        btn.innerText = orig;
    }
}

// ─── ユーティリティ ────────────────────────────────────
function cleanMcId(s) { return s ? s.toString().replace(/\r?\n|\r/g, '').trim() : ""; }

// ─── メンバー一覧レンダリング ──────────────────────────────
function renderMemberList() {
    const tbody = document.getElementById('memberTableBody');
    tbody.innerHTML = "";

    if (!channels.length) {
        tbody.innerHTML = `<tr><td colspan="15" style="text-align:center; color:#8ca08a; padding:20px; font-size:13px;">まだメンバーが登録されていません。左のフォームから追加してください。</td></tr>`;
        populateChannelSelects();
        return;
    }

    // 本番ページ(index.html)の「全メンバー一覧」と同じ並び順で表示する：
    // order番号の昇順（未設定は最後尾）に並べ、グループが変わったら見出し行を挟む。
    // ※ config.js内の実際の配列順序（保存・出力される順序）はここでは変わらない。
    // 編集・削除ボタンは元の配列インデックス(origIdx)を使う。
    const sorted = channels
        .map((ch, origIdx) => ({ ch, origIdx }))
        .sort((a, b) => {
            const orderA = (typeof a.ch.order === 'number') ? a.ch.order : Infinity;
            const orderB = (typeof b.ch.order === 'number') ? b.ch.order : Infinity;
            return orderA - orderB;
        });

    let lastGroupLabel = null;

    sorted.forEach(({ ch, origIdx }) => {
        if (ch.group && ch.group.trim() !== "") {
            if (ch.group !== lastGroupLabel) {
                tbody.innerHTML += `<tr><td colspan="15" class="member-group-heading">${ch.group}</td></tr>`;
                lastGroupLabel = ch.group;
            }
        } else {
            lastGroupLabel = null; // グループ未設定のメンバーを挟んだら、次に同じグループ名が来ても見出しを出し直す
        }

        const idx = origIdx;
        const pureMcId = cleanMcId(ch.minecraftId);
        const uuid     = ch.uuid || "";

        const avatarPath = ch.avatarImg && ch.avatarImg.trim()
            ? ch.avatarImg.trim()
            : (pureMcId ? `avatars/${pureMcId}.png` : "avatars/fallback.svg");

        const mcHeadHtml = `<div class="mc-head-box" style="border-color:${ch.color||'var(--border-color)'}">
            <img class="mc-head-img" src="${avatarPath}" alt="${ch.name||''}"
                onerror="this.onerror=null; this.src='avatars/fallback.svg';"></div>`;

        // UUID: 先頭8文字 + …、ホバーでフル表示
        const uuidCell = uuid
            ? `<span class="uuid-cell" title="${uuid}" style="cursor:help;">${uuid.slice(0,8)}&hellip;</span>`
            : `<span style="color:#94a3b8; font-size:11px;">—</span>`;

        const mcText      = pureMcId || "";
        const ytCell      = ch.id       ? `<a href="https://youtube.com/channel/${ch.id}" target="_blank" style="font-family:monospace;font-size:11px;color:#dc2626;word-break:break-all;">${ch.id}</a>` : "";
        const yt2Cell     = ch.id2      ? `<a href="https://youtube.com/channel/${ch.id2}" target="_blank" style="font-family:monospace;font-size:11px;color:#dc2626;word-break:break-all;">${ch.id2}</a>` : `<span style="color:#94a3b8; font-size:11px;">—</span>`;
        const xCell       = ch.twitterId ? `<a href="https://x.com/${ch.twitterId}" target="_blank" style="font-size:12px;color:#14171a;">@${ch.twitterId}</a>` : "";
        const twitchCell  = ch.twitchId  ? `<a href="https://twitch.tv/${ch.twitchId}" target="_blank" style="font-size:12px;color:#9146ff;">@${ch.twitchId}</a>` : "";
        const tiktokCell  = ch.tiktokId  ? `<a href="https://www.tiktok.com/@${ch.tiktokId}" target="_blank" style="font-size:12px;color:#010101;">@${ch.tiktokId}</a>` : "";
        const instaCell   = ch.instaId   ? `<a href="https://instagram.com/${ch.instaId}" target="_blank" style="font-size:12px;color:#e1306c;">@${ch.instaId}</a>` : "";
        const discordCell  = ch.discordUrl  ? `<a href="${ch.discordUrl}" target="_blank" style="font-size:12px;color:#5865f2;">リンク</a>` : "";
        const homepageCell = ch.homepageUrl ? `<a href="${ch.homepageUrl}" target="_blank" style="font-size:12px;color:var(--accent-blue);">🏠 リンク</a>` : "";
        const orderCell = (typeof ch.order === 'number') ? ch.order : `<span style="color:#94a3b8;">—</span>`;

        tbody.innerHTML += `
            <tr>
                <td style="text-align:center; font-size:12px; color:var(--secondary-text);">${orderCell}</td>
                <td style="text-align:center;"><span style="display:inline-block;width:20px;height:20px;border-radius:50%;background:${ch.color||'#ff9900'};border:1px solid var(--border-color);"></span></td>
                <td style="text-align:center;">${mcHeadHtml}</td>
                <td><strong class="clickable-name" onclick="editMember(${idx})" title="クリックして編集">${ch.name||''}</strong></td>
                <td style="font-size:12px;color:var(--secondary-text);">${mcText}</td>
                <td>${uuidCell}</td>
                <td>${ytCell}</td>
                <td>${yt2Cell}</td>
                <td>${xCell}</td>
                <td>${twitchCell}</td>
                <td>${tiktokCell}</td>
                <td>${instaCell}</td>
                <td>${discordCell}</td>
                <td>${homepageCell}</td>
                <td><button class="btn-del" onclick="deleteMember(${idx})">削除</button></td>
            </tr>`;
    });

    populateChannelSelects();
}

// ─── 編集モード ────────────────────────────────────────
function editMember(idx) {
    editIndex = idx;
    const ch = channels[idx];

    document.getElementById('m_name').value = ch.name || "";
    document.getElementById('m_id').value   = ch.id   || "";
    document.getElementById('m_id2').value  = ch.id2  || "";

    const pureMcId = cleanMcId(ch.minecraftId);
    document.getElementById('m_mc').value = pureMcId;

    if (ch.uuid) {
        currentUUID = ch.uuid;
        setUuidDisplay(ch.uuid, "ok");
        setBadge("ok", "✅ 保存済み");
        document.getElementById('uuidManualToggleBtn').style.display = "none";
        closeUuidManual();
        updateAvatarPreview(pureMcId, ch.uuid);
    } else if (pureMcId) {
        currentUUID = "";
        resetUuidUI();
        document.getElementById('uuidManualToggleBtn').style.display = "none";
        closeUuidManual();
        fetchUUID(pureMcId);
    } else {
        currentUUID = "";
        resetUuidUI();
        document.getElementById('uuidManualToggleBtn').style.display = "none";
        closeUuidManual();
        updateAvatarPreview("", "");
    }

    document.getElementById('m_x').value       = ch.twitterId  || "";
    document.getElementById('m_tw').value       = ch.twitchId   || "";
    document.getElementById('m_tt').value       = ch.tiktokId   || "";
    document.getElementById('m_inst').value     = ch.instaId    || "";
    document.getElementById('m_discord').value   = ch.discordUrl  || "";
    document.getElementById('m_homepage').value  = ch.homepageUrl || "";

    const c = ch.color || "#ff9900";
    document.getElementById('m_color').value      = c;
    document.getElementById('m_color_text').value = c.toUpperCase();

    document.getElementById('m_order').value = (typeof ch.order === 'number') ? ch.order : "";
    document.getElementById('m_group').value = ch.group || "";

    document.getElementById('memberFormContainer').className = "editing";
    document.getElementById('editNotice').style.display      = "block";
    document.getElementById('saveBtn').innerText             = "変更を上書き保存";
    document.getElementById('cancelBtn').style.display       = "inline-block";

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function cancelEdit() {
    editIndex = -1;
    clearForm();
    document.getElementById('memberFormContainer').className = "";
    document.getElementById('editNotice').style.display      = "none";
    document.getElementById('saveBtn').innerText             = "メンバーを保存";
    document.getElementById('cancelBtn').style.display       = "none";
}

function clearForm() {
    ['m_name','m_id','m_id2','m_mc','m_x','m_tw','m_tt','m_inst','m_discord','m_homepage','m_order','m_group'].forEach(id => document.getElementById(id).value = "");
    currentUUID = "";
    resetUuidUI();
    document.getElementById('uuidManualToggleBtn').style.display = "none";
    closeUuidManual();
    updateAvatarPreview("", "");
    document.getElementById('m_color').value      = "#ff9900";
    document.getElementById('m_color_text').value = "#FF9900";
}

// ─── 保存・削除 ────────────────────────────────────────
function addMember() {
    const name       = document.getElementById('m_name').value.trim();
    const id         = document.getElementById('m_id').value.trim();
    const id2        = document.getElementById('m_id2').value.trim();
    const minecraftId = cleanMcId(document.getElementById('m_mc').value);
    const twitterId  = document.getElementById('m_x').value.trim().replace(/^@/, '');
    const twitchId   = document.getElementById('m_tw').value.trim();
    const tiktokId   = document.getElementById('m_tt').value.trim().replace(/^@/, '');
    const instaId    = document.getElementById('m_inst').value.trim();
    const discordUrl  = document.getElementById('m_discord').value.trim();
    const homepageUrl = document.getElementById('m_homepage').value.trim();
    const color      = document.getElementById('m_color_text').value.trim().toLowerCase();
    const orderRaw   = document.getElementById('m_order').value.trim();
    const group      = document.getElementById('m_group').value.trim();

    if (!name || !id) { alert("名前とYouTubeチャンネルIDは必須です！"); return; }
    if (!color.match(/^#[0-9a-fA-F]{6}$/)) { alert("カラーコードは #ffffff のような形式で入力してください！"); return; }

    const pureMcId = cleanMcId(minecraftId);
    const memberData = { name, id, minecraftId, uuid: currentUUID, twitterId, twitchId, tiktokId, instaId, discordUrl, homepageUrl, color, avatarImg: pureMcId ? `avatars/${pureMcId}.png` : "" };

    // サブチャンネルは入力した時だけ保存する（配信中・予約・新着の判定にも反映される）
    if (id2 !== "") {
        memberData.id2 = id2;
    }
    // order は数字を入力した時だけ保存する（未入力なら一覧の一番最後に表示される仕様）
    if (orderRaw !== "" && !isNaN(Number(orderRaw))) {
        memberData.order = Number(orderRaw);
    }
    // group は入力した時だけ保存する（同じgroup名の人同士が隣接する時だけ見出しが出る仕様）
    if (group !== "") {
        memberData.group = group;
    }

    if (editIndex > -1) {
        channels[editIndex] = memberData;
        alert(`${name} さんの情報を更新しました！`);
        cancelEdit();
    } else {
        channels.push(memberData);
        alert(`${name} さんを新規保存しました！`);
        clearForm();
    }

    localStorage.setItem('custom_channels', JSON.stringify(channels));
    renderMemberList();
    updateConfigOutput();
}

function deleteMember(idx) {
    if (confirm(`${channels[idx].name} さんを削除しますか？`)) {
        if (editIndex === idx) cancelEdit();
        channels.splice(idx, 1);
        localStorage.setItem('custom_channels', JSON.stringify(channels));
        renderMemberList();
        updateConfigOutput();
    }
}

// ─── config.js 出力 ────────────────────────────────────
function updateConfigOutput() {
    const formatted = channels.map(ch => {
        const pureMcId = cleanMcId(ch.minecraftId);
        return { ...ch, avatarImg: pureMcId ? `avatars/${pureMcId}.png` : "" };
    });
    const cfg      = (typeof CONFIG !== 'undefined') ? CONFIG : (window.CONFIG || {});
    // APIキーはもうconfig.jsに書かない運用。既存値があっても引き継がない（Worker側のSecretで管理）。
    const proxyUrl = cfg.YOUTUBE_PROXY_URL || "";
    // キャッシュ設定は元の値を引き継ぐ（なければデフォルト）
    const cacheDuration     = cfg.CACHE_DURATION_MS          ?? (5  * 60 * 1000);
    const iconCacheDuration = cfg.CHANNEL_ICON_CACHE_DURATION_MS ?? (24 * 60 * 60 * 1000);
    document.getElementById('configOutput').value =
        `window.CONFIG = {\n    // ⚠️ APIキーはここに書きません（Cloudflare Worker側のSecretで管理）\n    YOUTUBE_API_KEY: "",\n    // YouTube APIプロキシ（Cloudflare Worker）のURL\n    YOUTUBE_PROXY_URL: "${proxyUrl}",\n    // キャッシュ有効期間（ミリ秒）。デフォルト5分。\n    CACHE_DURATION_MS: ${cacheDuration},\n    // チャンネルアイコンのキャッシュ有効期間（ミリ秒）。デフォルト24時間。\n    CHANNEL_ICON_CACHE_DURATION_MS: ${iconCacheDuration},\n    DEFAULT_CHANNELS: ${JSON.stringify(formatted, null, 8)}\n};`;
}

function exportConfig() {
    updateConfigOutput();
    navigator.clipboard.writeText(document.getElementById('configOutput').value)
        .then(() => alert("js/data/config.js 用のコードをコピーしました！js/data/config.jsファイルに貼り付けて保存してください。"))
        .catch(() => { document.getElementById('configOutput').select(); alert('自動コピーに失敗しました。テキストエリアを全選択して手動でコピーしてください。'); });
}

// js/data/config.js を直接手入力で編集した場合に、このページ側のキャッシュ(localStorage)を破棄して
// 実際に読み込まれている window.CONFIG.DEFAULT_CHANNELS の内容に同期し直す
function reloadFromConfigJs() {
    if (!window.CONFIG || !window.CONFIG.DEFAULT_CHANNELS) {
        alert("js/data/config.js が読み込めていません。ページを開き直すか、config.js の内容をご確認ください。");
        return;
    }
    if (!confirm("このブラウザに保存されている編集中のデータは破棄され、js/data/config.js の内容に置き換わります。よろしいですか？")) {
        return;
    }
    localStorage.removeItem('custom_channels');
    channels = [...window.CONFIG.DEFAULT_CHANNELS];
    cancelEdit();
    renderMemberList();
    updateConfigOutput();
    alert("js/data/config.js の内容を読み込み直しました！");
}
