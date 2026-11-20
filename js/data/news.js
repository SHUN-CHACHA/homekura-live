// ==========================================================
// ナナホシナナさん制作「だいたい週刊homeクラNEWS」の設定と、これまでの回の一覧
//
// ■ トップページ「LIVE中」の上に出す速報バナー
// ・いちばん新しい回を表示する（episodes の先頭と、Worker が見つけた最新回のうち新しい方）
// ・Worker の /portal が、ナナホシナナさんの直近10本の動画から
//   タイトルに「だいたい週刊homeクラNEWS」が入った最新回を newsItems として返すので、
//   episodes に書き足さなくても新しい回は自動で表示される
// ・表示をやめたい時は enabled を false にする
//
// ■ 過去の回の一覧（news.html）
// ・Worker が新しい回を見つけるたびに記録していく（/news）ので、新しい回をここに書き足す必要はない
// ・episodes は、Worker が記録を始める前の回と、Worker が止まっている時の予備。ここの回と記録を合わせて新しい順に並べる
// ==========================================================
window.HOMEKURA_NEWS = {
    enabled: true,
    // 公開から何日間バナーを表示するか（過ぎたら自動で消える。新しい回が出ればまた表示される）
    maxDays: 7,
    // タイトルにこの言葉が入っている動画を「NEWS」とみなす（全角・半角、大文字・小文字は区別しない）
    titleTag: "だいたい週刊homeクラNEWS",
    // NEWS を作っている人のチャンネル（ナナホシナナ）
    channelId: "UCncsOsnMBAAaYb6WidBYIDw",
    creatorName: "ナナホシナナ",
    // これまでの回（新しい順。videoId・タイトル・公開日時）
    episodes: [
        { videoId: "AijGZbYy2bs", title: "【#homeクラ】11/17 だいたい週刊homeクラNEWS【マイクラ / ナナホシナナ 】", publishedAt: "2026-11-17T01:40:51Z" },
        { videoId: "J9BpXe5nK6s", title: "【#homeクラ】だいたい週刊homeクラNEWS 速報：UFO襲来【マイクラ / ナナホシナナ 】", publishedAt: "2026-11-09T02:20:39Z" }
    ]
};
