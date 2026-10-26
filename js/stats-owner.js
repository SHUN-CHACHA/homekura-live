// ==========================================================
// 📊 関係者（自分たち）のブラウザの印。アクセス統計（Worker の Analytics Engine）で自分のアクセスを除外するのに使う
// window.HomekuraStats として公開します（トップページ・Season2 のページで共通）。
//
//   ?me=1     を付けて開く → このブラウザを関係者として登録（以降のアクセスに who=owner が付く）
//   ?me=0     を付けて開く → 登録を外す
//   ?me=check を付けて開く → 今このブラウザが登録されているかを表示する
//
// 登録は localStorage と Cookie の両方に保存し、どちらか片方が消えていても、もう片方から自動で戻す（外れにくくする）。
// Cookie の有効期限はブラウザの上限（約400日）に合わせ、開くたびに延ばす。
// ==========================================================
(function () {
    const KEY = 'homekura_stats_owner';
    const COOKIE_PATH = '/homekura-live/';
    const COOKIE_MAX_AGE = 400 * 24 * 60 * 60; // 400日（多くのブラウザの上限）

    function readStorage() {
        try { return localStorage.getItem(KEY) === '1'; } catch (_) { return false; }
    }
    function writeStorage(on) {
        try {
            if (on) localStorage.setItem(KEY, '1');
            else localStorage.removeItem(KEY);
        } catch (_) { /* 保存できない環境（シークレットモードなど）では何もしない */ }
    }
    function readCookie() {
        return document.cookie.split(';').some((c) => c.trim() === `${KEY}=1`);
    }
    function writeCookie(on) {
        const secure = location.protocol === 'https:' ? '; Secure' : '';
        document.cookie = on
            ? `${KEY}=1; Max-Age=${COOKIE_MAX_AGE}; Path=${COOKIE_PATH}; SameSite=Lax${secure}`
            : `${KEY}=; Max-Age=0; Path=${COOKIE_PATH}; SameSite=Lax${secure}`;
    }

    function setOwner(on) {
        writeStorage(on);
        writeCookie(on);
    }

    // どちらかに印が残っていれば関係者とみなし、消えている方を書き戻す（Cookie の期限もここで延ばす）
    function isOwner() {
        const owner = readStorage() || readCookie();
        if (owner) setOwner(true);
        return owner;
    }

    // ?me=1 / ?me=0 / ?me=check の処理（処理したら アドレスから ?me= を消す）
    (() => {
        const me = new URLSearchParams(location.search).get('me');
        if (me !== '1' && me !== '0' && me !== 'check') return;
        if (me === '1') {
            setOwner(true);
            alert(isOwner()
                ? 'このブラウザを関係者として登録しました。これ以降のアクセスは統計で除外できます。'
                : 'このブラウザでは登録を保存できませんでした（シークレットモードや、サイトのデータを保存しない設定になっていないか確認してください）。');
        } else if (me === '0') {
            setOwner(false);
            alert('このブラウザの関係者登録を外しました。');
        } else {
            const storage = readStorage();
            const cookie = readCookie();
            const owner = isOwner();
            alert(owner
                ? `このブラウザは関係者として登録されています。\n（ブラウザ内の保存：${storage ? 'あり' : 'なし→戻しました'}／Cookie：${cookie ? 'あり' : 'なし→戻しました'}）`
                : 'このブラウザは関係者として登録されていません。\n登録するには、アドレスの最後に ?me=1 を付けて開いてください。');
        }
        const url = new URL(location.href);
        url.searchParams.delete('me');
        history.replaceState(null, '', url);
    })();

    // Worker に渡す統計用の項目（きっかけ src と、関係者なら who=owner）
    function statsQuery(src) {
        return `src=${src}${isOwner() ? '&who=owner' : ''}`;
    }

    window.HomekuraStats = { isOwner, setOwner, statsQuery };
})();
