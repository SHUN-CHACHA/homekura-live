// ==========================================================
// 📌 メンバーのピン（マーカー）・一覧表示コンポーネント
// window.MapApp.memberList として公開します。
// memberData は MAP_member.js（<script src="MAP_member.js">）で定義されたものを使います。
// ==========================================================
(function () {
    window.MapApp = window.MapApp || {};

    const markers = {};
    let map = null;

    // 顔アイコンは区画（48×48ブロック）の枠いっぱいに表示する。背景地図の枠線のぶん少し内側に寄せ、
    // ズームに合わせて大きさ（CSS変数 --face-px）とネームタグの位置を更新する
    const PLOT_BLOCKS = 48;
    const PLOT_INSET_BLOCKS = 3;
    const MIN_FACE_PX = 16;
    let memberSelect, countSpan, cursorCoords;

    // 顔アイコンが見つからない場合のプレースホルダー画像（灰色のシルエット）
    const AVATAR_FALLBACK = "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36"><rect width="36" height="36" fill="#26262b"/><circle cx="18" cy="14" r="7" fill="#55555d"/><rect x="6" y="23" width="24" height="11" rx="3" fill="#55555d"/></svg>'
    );

    // 画像の読み込みに失敗した場合、プレースホルダーに差し替える
    // ※ 生成HTML内から onerror="avatarFallback(this)" で呼ばれるためグローバル関数として公開する
    window.avatarFallback = function (img) {
        img.onerror = null;
        img.src = AVATAR_FALLBACK;
    };

    // メンバー1件から、登録されている人物（名前+アイコン）を最大3人分の配列にする
    function getPeople(member) {
        const people = [];
        if (member.name && member.name.trim() !== "") {
            people.push({ name: member.name, icon: member.icon });
        }
        if (member.name2 && member.name2.trim() !== "") {
            people.push({ name: member.name2, icon: member.icon2 });
        }
        if (member.name3 && member.name3.trim() !== "") {
            people.push({ name: member.name3, icon: member.icon3 });
        }
        return people;
    }

    // 動的アイコン生成用（顔アイコン版）
    // memberData の icon 欄に指定されたファイル名を avatars フォルダから読み込みます
    // name2 / name3 が入っている場合は、その人数分アイコンを並べて表示します（最大3人）
    function getIcon(member, isRegistered) {
        const people = isRegistered ? getPeople(member) : [];

        if (people.length <= 1) {
            const single = people[0];
            const avatarSrc = (single && single.icon) ? `avatars/${single.icon}` : AVATAR_FALLBACK;
            const altName = single ? single.name : member.name;
            return L.divIcon({
                className: 'custom-div-icon',
                html: `
                    <div class="avatar-marker plot-fill ${isRegistered ? '' : 'unregistered'}">
                        <img src="${avatarSrc}" alt="${altName}" onerror="avatarFallback(this)" />
                    </div>
                `,
                iconSize: [0, 0], // 大きさは CSS（--face-px）で決め、拠点の座標を中心に配置する
                iconAnchor: [0, 0]
            });
        }

        // 2〜3人分のアイコンを並べて表示
        const iconsHtml = people.map((p) => {
            const avatarSrc = p.icon ? `avatars/${p.icon}` : AVATAR_FALLBACK;
            return `
                <div class="avatar-marker">
                    <img src="${avatarSrc}" alt="${p.name}" onerror="avatarFallback(this)" />
                </div>
            `;
        }).join('');

        return L.divIcon({
            className: 'custom-div-icon',
            html: `<div class="avatar-marker-group plot-fill">${iconsHtml}</div>`,
            iconSize: [0, 0],
            iconAnchor: [0, 0]
        });
    }

    // 今のズームでの顔アイコンの大きさ（px）
    function getFacePx() {
        const px = (PLOT_BLOCKS - PLOT_INSET_BLOCKS * 2) * Math.pow(2, map.getZoom());
        return Math.max(MIN_FACE_PX, px);
    }

    // 顔アイコンの大きさを更新し、ネームタグを顔アイコンの上端（枠の内側）にそろえる
    function updateFaceSize() {
        const px = getFacePx();
        map.getContainer().style.setProperty('--face-px', `${px}px`);
        Object.values(markers).forEach((marker) => {
            const tooltip = marker.getTooltip();
            if (!tooltip) return;
            tooltip.options.offset = [0, -px / 2];
            tooltip.update();
        });
    }

    function renderMembers() {
        memberData.forEach((member, index) => {
            const isRegistered = member.name.trim() !== ""; // 名前が入っているかどうか

            // 未登録（名前が空欄）のメンバーは地図にも一覧にも表示しない
            if (!isRegistered) {
                return;
            }

            const leafletY = -member.z;
            const leafletX = member.x;

            // マーカーの設置（顔アイコン）
            const marker = L.marker([leafletY, leafletX], { icon: getIcon(member, isRegistered) }).addTo(map);

            // メンバー名を「常に表示」するネームタグを設定（1人ずつ改行、最大3人まで対応）
            const people = getPeople(member);
            const nameLinesHtml = people.map((p) => `<div class="name-line">${p.name}</div>`).join('');
            const tooltipText = `
                ${nameLinesHtml}
                <div class="coord-line">X: ${member.x}, Z: ${member.z}</div>
            `;

            marker.bindTooltip(tooltipText, {
                permanent: true,
                direction: 'bottom',
                offset: [0, 0], // 位置は updateFaceSize() で顔アイコンの上端にそろえる
                className: 'permanent-name-label'
            });

            // 一覧でキーとして使うための名前
            const lookupName = member.name;
            markers[lookupName] = marker;

            // ドロップダウンの選択肢（例：区画07　久那式リン（X: 72, Z: -296））
            const displayName = people.map((p) => p.name).join('・');
            const option = document.createElement('option');
            option.value = String(index);
            option.textContent = `${member.area ? member.area + '　' : ''}${displayName}（X: ${member.x}, Z: ${member.z}）`;
            memberSelect.appendChild(option);
        });
    }

    // カメラ移動
    function focusOnBase(name, y, x) {
        map.setView([y, x], map.getMaxZoom(), { animate: true, duration: 0.8 });
    }

    // 初期表示（地図全体が収まる表示。fitMapHomeView が未定義なら (0, 0)）に戻る
    // ※ HTML側から onclick="resetMapView()" で呼ばれるためグローバル関数として公開する
    window.resetMapView = function () {
        if (window.fitMapHomeView) { window.fitMapHomeView(true); return; }
        map.setView([0, 0], -2, { animate: true });
    };

    // ドロップダウンでメンバーを選んだら、その拠点にジャンプする（スマホではドロワーも閉じる）
    function initMemberSelect() {
        memberSelect.addEventListener('change', (e) => {
            const member = memberData[Number(e.target.value)];
            if (e.target.value === '' || !member) return;
            focusOnBase(member.name, -member.z, member.x);
            if (window.MapApp.mobileUI) window.MapApp.mobileUI.closeMemberDrawer();
        });
    }

    function initCursorTracking() {
        map.on('mousemove', (e) => {
            const x = Math.round(e.latlng.lng);
            const z = Math.round(-e.latlng.lat);
            cursorCoords.textContent = `X: ${x}, Z: ${z}`;
        });
    }

    function init(mapInstance) {
        map = mapInstance;
        memberSelect = document.getElementById('member-select');
        countSpan = document.getElementById('member-count');
        cursorCoords = document.getElementById('cursor-coords');

        // 登録人数：同じ名前の人が複数拠点にいても1人として数える（重複除外、共有地は除外）
        const uniqueMemberNames = new Set();
        memberData.forEach((m) => {
            if (m.area === "共有地") return;
            if (m.name && m.name.trim() !== "") uniqueMemberNames.add(m.name.trim());
            if (m.name2 && m.name2.trim() !== "") uniqueMemberNames.add(m.name2.trim());
            if (m.name3 && m.name3.trim() !== "") uniqueMemberNames.add(m.name3.trim());
        });
        countSpan.textContent = uniqueMemberNames.size;

        // データ並び替え (エリアが空白でないものを優先、基本は登録順)
        memberData.sort((a, b) => {
            if (!a.area && b.area) return 1;
            if (a.area && !b.area) return -1;
            return a.area.localeCompare(b.area, undefined, { numeric: true, sensitivity: 'base' });
        });

        renderMembers();
        updateFaceSize();
        map.on('zoom zoomend', updateFaceSize);
        initMemberSelect();
        initCursorTracking();
    }

    window.MapApp.memberList = {
        init,
        markers,
        memberData: () => memberData,
        focusOnBase
    };
})();
