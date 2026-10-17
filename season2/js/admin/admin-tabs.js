// ==========================================================
// 📑 セクション切り替えタブ（メンバー / 拠点マップ / 場所）
// ==========================================================
const ADMIN_TABS = ['members', 'locations', 'places', 'mapimages'];

function switchAdminTab(tabName) {
    if (!ADMIN_TABS.includes(tabName)) tabName = ADMIN_TABS[0];

    document.querySelectorAll('.admin-tab-btn').forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    document.querySelectorAll('.admin-tab-panel').forEach((panel) => {
        panel.classList.toggle('active', panel.id === `tab-panel-${tabName}`);
    });

    localStorage.setItem('admin_active_tab', tabName);
    window.scrollTo(0, 0);
}

function initAdminTabs() {
    const saved = localStorage.getItem('admin_active_tab');
    switchAdminTab(ADMIN_TABS.includes(saved) ? saved : ADMIN_TABS[0]);
}
