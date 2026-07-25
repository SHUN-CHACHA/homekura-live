// ==========================================================
// 📍 「場所」（メンバーではない目印）の描画コンポーネント
// window.MapApp.mapLocations として公開します。
// locationData は js/MAP_locations.js（<script src="js/MAP_locations.js">）で定義されたものを使います。
// 顔アイコンと同じ見た目のマーカーとして表示されるので、
// 👁️ アイコン・座標のON/OFFボタンでも一緒に表示/非表示が切り替わります。
// ==========================================================
(function () {
    window.MapApp = window.MapApp || {};

    let map = null;

    function getLocationIcon(loc) {
        const avatarSrc = loc.icon ? `avatars/${loc.icon}` : '';
        return L.divIcon({
            className: 'custom-div-icon',
            html: `
                <div class="avatar-marker location-marker">
                    <img src="${avatarSrc}" alt="${loc.name}" onerror="avatarFallback(this)" />
                </div>
            `,
            iconSize: [36, 36],
            iconAnchor: [18, 18]
        });
    }

    function renderLocations() {
        (typeof locationData !== 'undefined' ? locationData : []).forEach((loc) => {
            if (!loc.name || !loc.icon) return;

            const leafletY = -loc.z;
            const leafletX = loc.x;

            const marker = L.marker([leafletY, leafletX], { icon: getLocationIcon(loc) }).addTo(map);
            marker.bindTooltip(`<div class="name-line">${loc.name}</div>`, {
                permanent: true,
                direction: 'bottom',
                offset: [0, 10],
                className: 'permanent-name-label'
            });
        });
    }

    function init(mapInstance) {
        map = mapInstance;
        renderLocations();
    }

    window.MapApp.mapLocations = { init };
})();
