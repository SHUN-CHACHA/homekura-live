// ==========================================================
// 📰 「だいたい週刊homeクラNEWS」の回を集める（トップページのバナーと news.html の一覧で共通）
// js/data/news.js の episodes と、Worker が記録してきた回（/news）と、YouTube から取得した動画（Worker の newsItems など）を
// 合わせて、同じ回は1つにまとめ、新しい順に並べて返す。配信中・配信予定の枠や、ほかの人の動画は入れない。
// ==========================================================
(function () {
    const norm = (s) => (s || '').normalize('NFKC').toLowerCase();

    // videos ：YouTube の動画（snippet 付き）の配列。省略可
    // archive：Worker の /news が返す回 [{ id, title, publishedAt, channelId, thumb }]。省略可
    // 返す内容：[{ id, title, publishedAt, thumb }]（新しい順）
    function collectNewsEpisodes(videos, archive) {
        const cfg = window.HOMEKURA_NEWS;
        if (!cfg) return [];
        const tag = norm(cfg.titleTag);
        const byId = new Map();
        (cfg.episodes || []).forEach((e) => {
            if (e && e.videoId) byId.set(e.videoId, { id: e.videoId, title: e.title || '', publishedAt: e.publishedAt || '', thumb: '' });
        });
        (archive || []).forEach((e) => {
            if (!e || !e.id) return;
            if (cfg.channelId && e.channelId && e.channelId !== cfg.channelId) return;
            byId.set(e.id, { id: e.id, title: e.title || '', publishedAt: e.publishedAt || '', thumb: e.thumb || '' });
        });
        (videos || []).forEach((v) => {
            const sn = v && v.snippet;
            if (!sn || !v.id || sn.liveBroadcastContent !== 'none') return;
            if (cfg.channelId && sn.channelId !== cfg.channelId) return;
            if (!tag || !norm(sn.title).includes(tag)) return;
            // 取得した動画の方がタイトル・サムネイルが新しいので、そちらで上書きする
            byId.set(v.id, {
                id: v.id,
                title: sn.title,
                publishedAt: sn.publishedAt,
                thumb: (sn.thumbnails && ((sn.thumbnails.maxres && sn.thumbnails.maxres.url) || (sn.thumbnails.high && sn.thumbnails.high.url))) || ''
            });
        });
        return [...byId.values()].sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0));
    }

    // サムネイル画像の URL（取得したものがなければ YouTube の決まった場所の画像）
    function newsThumbUrl(ep) {
        return ep.thumb || `https://i.ytimg.com/vi/${encodeURIComponent(ep.id)}/hqdefault.jpg`;
    }

    // Worker の /news から、記録してきた回を受け取る（失敗した時は空の配列）
    async function fetchNewsArchive() {
        const cfg = window.HOMEKURA_NEWS;
        const proxy = ((window.CONFIG && window.CONFIG.YOUTUBE_PROXY_URL) || '').replace(/\/$/, '');
        if (!cfg || !cfg.titleTag || !proxy) return [];
        try {
            const stats = window.HomekuraStats ? `&${window.HomekuraStats.statsQuery('load')}` : '';
            const res = await fetch(`${proxy}/news?tag=${encodeURIComponent(cfg.titleTag)}${stats}`);
            if (!res.ok) return [];
            const data = await res.json();
            return Array.isArray(data.episodes) ? data.episodes : [];
        } catch (e) {
            return [];
        }
    }

    // 回ごとのタグ（YouTube の公開日とタイトルだけから自動で作る）
    //   date    ：公開日から「11/17号」（タイトルに日付がない回でも必ず付く）
    //   breaking：タイトルに「速報」が入っていれば true
    //   topic   ：タイトルに書かれた内容（【…】・番組名・日付・「速報」を取り除いた残り）。内容がサムネイルにしかない回は ''
    function newsTags(ep) {
        const cfg = window.HOMEKURA_NEWS || {};
        const d = ep && ep.publishedAt ? new Date(ep.publishedAt) : null;
        const date = d && !isNaN(d) ? `${d.getMonth() + 1}/${d.getDate()}号` : '';
        const raw = ((ep && ep.title) || '').normalize('NFKC');
        const breaking = raw.includes('速報');
        let topic = raw
            .replace(/【[^】]*】/g, ' ')
            .replace(/\[[^\]]*\]/g, ' ');
        if (cfg.titleTag) {
            const t = cfg.titleTag.normalize('NFKC').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            topic = topic.replace(new RegExp(t, 'gi'), ' ');
        }
        topic = topic
            .replace(/\d{1,2}\s*[\/月]\s*\d{1,2}\s*日?\s*号?/g, ' ')
            .replace(/速報/g, ' ')
            .replace(/^[\s:：\-ー・|｜!！]+|[\s:：\-ー・|｜]+$/g, '')
            .replace(/\s+/g, ' ')
            .trim();
        return { date, breaking, topic };
    }

    window.newsTags = newsTags;
    window.collectNewsEpisodes = collectNewsEpisodes;
    window.fetchNewsArchive = fetchNewsArchive;
    window.newsThumbUrl = newsThumbUrl;
})();
