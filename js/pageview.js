// ==========================================================
// 📊 このページが開かれたことを、Worker（homekura-yt-proxy）に1回だけ知らせる（アクセス統計用）
// Worker のアクセス統計に /pv/ページ名 として残る。YouTube API は使わない。
//
// 使い方：js/stats-owner.js（関係者の印）の後に読み込み、data-page にページ名を書く
//   <script src="js/stats-owner.js"></script>
//   <script src="js/pageview.js" data-page="map"></script>
// ※ トップページ（index.html）は配信情報の取得（/portal）がそのまま記録になるので、読み込まない
// ==========================================================
(function () {
    const page = (document.currentScript && document.currentScript.dataset.page) || 'unknown';
    const proxy = (window.CONFIG && window.CONFIG.YOUTUBE_PROXY_URL) || 'https://homekura-yt-proxy.eisyun.workers.dev';
    const stats = window.HomekuraStats ? window.HomekuraStats.statsQuery('load') : 'src=load';
    try {
        fetch(`${proxy}/pv/${encodeURIComponent(page)}?${stats}`, { cache: 'no-store', keepalive: true }).catch(() => {});
    } catch (_) { /* 古いブラウザなどで送れなくても、ページの表示には影響させない */ }
})();
