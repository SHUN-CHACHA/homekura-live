// ==========================================================
// 📌 メンバーのピン（マーカー）・一覧表示コンポーネント
// window.MapApp.memberList として公開します。
// memberData は MAP_member.js（<script src="MAP_member.js">）で定義されたものを使います。
// ==========================================================
(function () {
    window.MapApp = window.MapApp || {};

    const markers = {};
    let map = null;
    let tableBody, mobileMemberList, countSpan, searchInput, cursorCoords;

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
                    <div class="avatar-marker ${isRegistered ? '' : 'unregistered'}">
                        <img src="${avatarSrc}" alt="${altName}" onerror="avatarFallback(this)" />
                    </div>
                `,
                iconSize: [36, 36],
                iconAnchor: [18, 18]
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

        const groupWidth = people.length * 30 + (people.length - 1) * 3; // アイコン幅30px + 間隔3px
        return L.divIcon({
            className: 'custom-div-icon',
            html: `<div class="avatar-marker-group">${iconsHtml}</div>`,
            iconSize: [groupWidth, 30],
            iconAnchor: [groupWidth / 2, 15]
        });
    }

    function renderMembers() {
        tableBody.innerHTML = '';
        mobileMemberList.innerHTML = '';

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
                offset: [0, 10],
                className: 'permanent-name-label'
            });

            // 一覧でキーとして使うための名前
            const lookupName = member.name;
            markers[lookupName] = marker;

            const displayName = people.map((p) => p.name).join('・');
            const searchName = people.map((p) => p.name).join(' ').trim().toLowerCase();
            const searchArea = member.area ? member.area.toLowerCase() : "";

            // テーブル行作成（PC表示）
            const tr = document.createElement('tr');
            tr.className = 'hover:bg-[#222227] cursor-pointer transition-colors border-b border-gray-800 text-gray-300';
            tr.setAttribute('data-name', searchName);
            tr.setAttribute('data-area', searchArea);

            tr.innerHTML = `
                <td class="py-3 px-4 font-mono font-bold text-green-500">
                    ${member.area || "-"}
                </td>
                <td class="py-3 px-4 font-medium text-gray-100">
                    ${displayName}
                </td>
                <td class="py-3 px-4 text-right font-mono text-gray-300">
                    ${member.x}
                </td>
                <td class="py-3 px-4 text-right font-mono text-gray-300">
                    ${member.z}
                </td>
            `;

            tr.addEventListener('click', () => {
                focusOnBase(lookupName, leafletY, leafletX);
            });

            tableBody.appendChild(tr);

            // 顔アイコン付きカード作成（スマホ表示）
            const avatarSrc = member.icon ? `avatars/${member.icon}` : AVATAR_FALLBACK;
            const row = document.createElement('div');
            row.className = 'mobile-member-row';
            row.setAttribute('data-name', searchName);
            row.setAttribute('data-area', searchArea);
            row.innerHTML = `
                <img class="mm-avatar" src="${avatarSrc}" alt="${member.name}" onerror="avatarFallback(this)" />
                <div class="mm-text">
                    <div class="mm-name">${displayName}</div>
                    <div class="mm-area">${member.area || ''}</div>
                </div>
            `;
            row.addEventListener('click', () => {
                focusOnBase(lookupName, leafletY, leafletX);
                if (window.MapApp.mobileUI) window.MapApp.mobileUI.closeMemberDrawer();
            });
            mobileMemberList.appendChild(row);
        });
    }

    // カメラ移動
    function focusOnBase(name, y, x) {
        map.setView([y, x], 1, { animate: true, duration: 0.8 });
    }

    // 中心 (0, 0) に戻る
    // ※ HTML側から onclick="resetMapView()" で呼ばれるためグローバル関数として公開する
    window.resetMapView = function () {
        map.setView([0, 0], -2, { animate: true });
    };

    function initSearch() {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            const rows = tableBody.getElementsByTagName('tr');
            const mobileRows = mobileMemberList.getElementsByClassName('mobile-member-row');

            const applyFilter = (el) => {
                const name = el.getAttribute('data-name');
                const area = el.getAttribute('data-area');

                if (query === "") {
                    el.style.display = '';
                } else if (name.includes(query) || area.includes(query)) {
                    el.style.display = '';
                } else {
                    el.style.display = 'none';
                }
            };

            for (let row of rows) applyFilter(row);
            for (let row of mobileRows) applyFilter(row);
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
        tableBody = document.getElementById('member-table-body');
        mobileMemberList = document.getElementById('mobile-member-list');
        countSpan = document.getElementById('member-count');
        searchInput = document.getElementById('search-input');
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
        initSearch();
        initCursorTracking();
    }

    window.MapApp.memberList = {
        init,
        markers,
        memberData: () => memberData,
        focusOnBase
    };
})();
