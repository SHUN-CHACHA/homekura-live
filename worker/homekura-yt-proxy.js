// ==========================================================
// 📺 homekura-yt-proxy（Cloudflare Worker）
// YouTube Data API へのプロキシ。APIキーはサイトに書かず、Worker の Secret に置く。
//
// ■ /portal（まとめて取得・みんなで共有するキャッシュ付き）
//   配信ポータルが表示に使う「チャンネルアイコン・最新動画・配信中/配信予定の詳細」を1回でまとめて返す。
//   結果は Workers KV（全国共通の保存場所）に保存し、保存期間（初期値10分）の間は YouTube API を呼ばずに返す。
//   → 見に来る人が何人でも、YouTube API の使用量は「保存期間ごとに1回分（約30ユニット）」で固定になる。
//   例：/portal?ids=UCxxx,UCyyy&subs=UCzzz&ttl=600
//     ids  : メインチャンネルのID（アイコンと最新動画を取る）
//     subs : サブチャンネルのID（最新動画だけ取る。なければ省略）
//     ttl  : 保存期間（秒）。600（10分）〜21600（6時間）の範囲に丸める。省略時は600
//
// ■ /channels・/playlistItems・/videos（これまでどおりの中継。キャッシュなし）
//   古いページ（ブラウザに残っている古いJSなど）が動き続けるように残している。
//
// ■ Cloudflare での設定（ダッシュボードで1回だけ）
//   1. Workers KV で名前空間を作る（例：homekura-portal-cache）
//   2. Worker の「設定 → バインディング」で KV を追加し、変数名を PORTAL_CACHE にする
//   3. APIキーの Secret の名前が YOUTUBE_API_KEY でなければ、下の getApiKey() に名前を足す
//   ※ KV を付けなくても動くが、その場合はデータセンターごとの別々のキャッシュになる（効果が少し下がる）
// ==========================================================

const YT_API = 'https://www.googleapis.com/youtube/v3';
const PASS_THROUGH_PATHS = ['channels', 'playlistItems', 'videos'];
const ALLOWED_ORIGINS = [/^https:\/\/shun-chacha\.github\.io$/, /^http:\/\/localhost(:\d+)?$/, /^http:\/\/127\.0\.0\.1(:\d+)?$/];
const DEFAULT_ORIGIN = 'https://shun-chacha.github.io';

const PORTAL_TTL_DEFAULT = 600;    // 10分
const PORTAL_TTL_MIN = 600;        // 短くしすぎて使用量が増えないよう、10分より短くはしない
const PORTAL_TTL_MAX = 21600;      // 6時間
const ICON_TTL = 86400;            // チャンネルアイコンは24時間
const MAX_CHANNELS = 80;           // 1回に指定できるチャンネル数の上限（いたずらで大量に呼ばれないように）
const CHANNEL_ID_RE = /^UC[\w-]{22}$/;

function getApiKey(env) {
    return env.YOUTUBE_API_KEY || env.YT_API_KEY || env.API_KEY || '';
}

function corsHeaders(request) {
    const origin = request.headers.get('Origin') || '';
    const allowed = ALLOWED_ORIGINS.some((re) => re.test(origin));
    return {
        'Access-Control-Allow-Origin': allowed ? origin : DEFAULT_ORIGIN,
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Vary': 'Origin'
    };
}

function json(request, body, status = 200, extra = {}) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json; charset=utf-8', ...corsHeaders(request), ...extra }
    });
}

async function ytGet(path, params, env) {
    const url = new URL(`${YT_API}/${path}`);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    url.searchParams.set('key', getApiKey(env));
    const res = await fetch(url.toString());
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.error) {
        const err = new Error(`YouTube API ${path}: ${res.status} ${data.error?.message || ''}`);
        err.status = res.status;
        throw err;
    }
    return data;
}

// ---------- 保存場所（KV があれば KV、なければデータセンターごとのキャッシュ） ----------
async function storeGet(env, key) {
    if (env.PORTAL_CACHE) {
        return env.PORTAL_CACHE.get(key, 'json');
    }
    const hit = await caches.default.match(`https://portal-cache.internal/${key}`);
    return hit ? hit.json() : null;
}

async function storePut(env, key, value) {
    // 古いデータも「YouTube API が失敗した時の予備」として使うので、保存期間より長め（7日）に残しておく
    const body = JSON.stringify(value);
    if (env.PORTAL_CACHE) {
        await env.PORTAL_CACHE.put(key, body, { expirationTtl: 7 * 86400 });
        return;
    }
    await caches.default.put(`https://portal-cache.internal/${key}`, new Response(body, {
        headers: { 'Content-Type': 'application/json', 'Cache-Control': `max-age=${7 * 86400}` }
    }));
}

async function hashKey(prefix, text) {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    const hex = Array.from(new Uint8Array(digest)).slice(0, 16).map((b) => b.toString(16).padStart(2, '0')).join('');
    return `${prefix}:${hex}`;
}

function parseIds(value) {
    return (value || '').split(',').map((s) => s.trim()).filter((s) => CHANNEL_ID_RE.test(s));
}

// ---------- チャンネルアイコン（24時間保存） ----------
async function getIcons(env, ids, now) {
    const key = await hashKey('icons', ids.join(','));
    const saved = await storeGet(env, key);
    if (saved && now - saved.timestamp < ICON_TTL * 1000) return saved.data;

    const chInfoMap = {};
    for (let i = 0; i < ids.length; i += 50) {
        const data = await ytGet('channels', { id: ids.slice(i, i + 50).join(','), part: 'snippet' }, env);
        (data.items || []).forEach((item) => {
            chInfoMap[item.id] = { icon: item.snippet?.thumbnails?.medium?.url || '' };
        });
    }
    await storePut(env, key, { timestamp: now, data: chInfoMap });
    return chInfoMap;
}

// ---------- 最新動画・配信中/配信予定（サイトの index.html で以前やっていた処理と同じ） ----------
async function getVideos(env, playlistChannelIds) {
    const playlistResults = await Promise.all(playlistChannelIds.map((id) =>
        ytGet('playlistItems', { playlistId: id.replace(/^UC/, 'UU'), part: 'snippet', maxResults: '10' }, env)
            .catch((e) => {
                // 動画が1本もないチャンネルなどは 404 になるので、そのチャンネルだけ飛ばす。割り当て切れ（403）などは全体を失敗にする
                if (e.status === 404) return null;
                throw e;
            })
    ));

    const videoIds = playlistResults.flatMap((r) => {
        const items = r?.items || [];
        // live/upcoming のものは「同日複数枠」に対応するため全部拾う
        const liveOrUpcoming = items.filter((i) => {
            const bc = i.snippet?.liveBroadcastContent;
            return bc === 'live' || bc === 'upcoming';
        });
        if (liveOrUpcoming.length > 0) {
            return liveOrUpcoming.map((i) => i.snippet?.resourceId?.videoId).filter(Boolean);
        }
        // live/upcoming が無ければ、新着表示判定用に直近2本まで候補として拾う
        return items.slice(0, 2).map((i) => i.snippet?.resourceId?.videoId).filter(Boolean);
    });

    const vItems = [];
    for (let i = 0; i < videoIds.length; i += 50) {
        const data = await ytGet('videos', { id: videoIds.slice(i, i + 50).join(','), part: 'snippet,liveStreamingDetails' }, env);
        vItems.push(...(data.items || []));
    }
    return vItems;
}

async function handlePortal(request, env, ctx, url) {
    const ids = parseIds(url.searchParams.get('ids'));
    const subs = parseIds(url.searchParams.get('subs'));
    if (!ids.length || ids.length + subs.length > MAX_CHANNELS) {
        return json(request, { error: 'ids の指定が正しくありません' }, 400);
    }
    const ttlParam = Number(url.searchParams.get('ttl')) || PORTAL_TTL_DEFAULT;
    const ttl = Math.min(PORTAL_TTL_MAX, Math.max(PORTAL_TTL_MIN, ttlParam));

    const now = Date.now();
    const key = await hashKey('portal', `${ids.join(',')}|${subs.join(',')}`);
    const saved = await storeGet(env, key);
    const age = saved ? Math.floor((now - saved.timestamp) / 1000) : null;

    if (saved && age < ttl) {
        return json(request, saved, 200, { 'Cache-Control': 'public, max-age=60', 'X-Portal-Cache': 'hit', 'X-Portal-Age': String(age) });
    }

    try {
        const [chInfoMap, vItems] = await Promise.all([getIcons(env, ids, now), getVideos(env, [...ids, ...subs])]);
        const fresh = { timestamp: now, chInfoMap, vItems };
        ctx.waitUntil(storePut(env, key, fresh));
        return json(request, fresh, 200, { 'Cache-Control': 'public, max-age=60', 'X-Portal-Cache': 'miss' });
    } catch (e) {
        // YouTube API が失敗した時（割り当て切れなど）は、古くても保存してある結果を返す
        if (saved) {
            return json(request, saved, 200, { 'Cache-Control': 'public, max-age=60', 'X-Portal-Cache': 'stale', 'X-Portal-Age': String(age) });
        }
        return json(request, { error: String(e.message || e) }, 502);
    }
}

async function handlePassThrough(request, env, path, url) {
    const params = {};
    url.searchParams.forEach((v, k) => { if (k !== 'key') params[k] = v; });
    const target = new URL(`${YT_API}/${path}`);
    Object.entries(params).forEach(([k, v]) => target.searchParams.set(k, v));
    target.searchParams.set('key', getApiKey(env));
    const res = await fetch(target.toString());
    return new Response(res.body, {
        status: res.status,
        headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=60', ...corsHeaders(request) }
    });
}

export default {
    async fetch(request, env, ctx) {
        if (request.method === 'OPTIONS') {
            return new Response(null, { status: 204, headers: corsHeaders(request) });
        }
        if (request.method !== 'GET') {
            return json(request, { error: 'GET のみ使えます' }, 405);
        }
        const url = new URL(request.url);
        const path = url.pathname.replace(/^\/+|\/+$/g, '');
        if (path === 'portal') return handlePortal(request, env, ctx, url);
        if (PASS_THROUGH_PATHS.includes(path)) return handlePassThrough(request, env, path, url);
        return json(request, { error: 'Not Found' }, 404);
    }
};
