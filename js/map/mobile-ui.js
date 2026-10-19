// ==========================================================
// 📱 スマホ用UIコンポーネント（メンバー一覧ドロワーの開閉・上部バーの高さ調整）
// window.MapApp.mobileUI として公開します。
// ==========================================================
(function () {
    window.MapApp = window.MapApp || {};

    let memberDrawer, drawerBackdrop, drawerToggleBtn, mobileTopbarEl;

    function openMemberDrawer() {
        memberDrawer.classList.add('drawer-open');
        drawerBackdrop.classList.remove('hidden');
    }

    function closeMemberDrawer() {
        memberDrawer.classList.remove('drawer-open');
        drawerBackdrop.classList.add('hidden');
    }

    function toggleMemberDrawer() {
        if (memberDrawer.classList.contains('drawer-open')) {
            closeMemberDrawer();
        } else {
            openMemberDrawer();
        }
    }

    // 上部バーの実際の高さを測って、マップの余白(padding-top)に反映する
    function updateMobileTopbarHeight() {
        if (mobileTopbarEl && mobileTopbarEl.offsetHeight > 0) {
            document.documentElement.style.setProperty('--mobile-topbar-height', `${mobileTopbarEl.offsetHeight}px`);
        }
    }

    function init() {
        memberDrawer = document.getElementById('member-drawer');
        drawerBackdrop = document.getElementById('drawer-backdrop');
        drawerToggleBtn = document.getElementById('member-drawer-toggle');
        mobileTopbarEl = document.getElementById('mobile-topbar');

        drawerToggleBtn.addEventListener('click', toggleMemberDrawer);
        drawerBackdrop.addEventListener('click', closeMemberDrawer);
        // メンバーを選んで地図にジャンプした時のドロワーの自動クローズは member-list.js 側で行う
    }

    window.MapApp.mobileUI = {
        init,
        openMemberDrawer: () => openMemberDrawer(),
        closeMemberDrawer: () => closeMemberDrawer(),
        updateMobileTopbarHeight: () => updateMobileTopbarHeight()
    };
})();
