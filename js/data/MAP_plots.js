// ==========================================================
// 🟥 homeクラ メンバー拠点マップ - 区画の枠線データ（Season3）
// 背景の地図画像とは別に、地図の上に線として描きます（「地図の表示項目」の「区画の枠線を表示」で出し入れ）。
//
// no    : 区画番号（全35区画に、全体図の枠の上の段から左→右の順で振った番号）
// area  : エリア番号（顔アイコンを置ける赤・オレンジの24区画だけ。上の段から左→右の順に1〜24）。
//         MAP_member.js の area に「エリア01」のように書くと、その区画の中心に顔アイコンが置かれる
// color : 枠線の色（red / orange / blue / yellow）
// x, z  : 区画の北西の角（左上）のブロック座標
// w, h  : 区画の幅（東西）・高さ（南北）のブロック数。1区画＝3チャンク（48ブロック）
// ==========================================================
const plotData = [
    { no: 1, area: 1, color: "orange", x: 96, z: -400, w: 48, h: 48 },
    { no: 2, area: 2, color: "orange", x: -16, z: -336, w: 48, h: 48 },
    { no: 3, area: 3, color: "red", x: 32, z: -336, w: 48, h: 48 },
    { no: 4, color: "blue", x: 96, z: -336, w: 48, h: 48 },
    { no: 5, area: 4, color: "red", x: 160, z: -336, w: 48, h: 48 },
    { no: 6, area: 5, color: "orange", x: 208, z: -336, w: 48, h: 48 },
    { no: 7, area: 6, color: "red", x: -80, z: -272, w: 48, h: 48 },
    { no: 8, area: 7, color: "red", x: 272, z: -272, w: 48, h: 48 },
    { no: 9, color: "blue", x: -16, z: -272, w: 96, h: 96 },
    { no: 10, color: "blue", x: 96, z: -272, w: 48, h: 96 },
    { no: 11, color: "blue", x: 160, z: -272, w: 96, h: 96 },
    { no: 12, area: 8, color: "orange", x: -80, z: -224, w: 48, h: 48 },
    { no: 13, area: 9, color: "orange", x: 272, z: -224, w: 48, h: 48 },
    { no: 14, area: 10, color: "orange", x: -128, z: -160, w: 48, h: 48 },
    { no: 15, color: "blue", x: -80, z: -160, w: 48, h: 48 },
    { no: 16, area: 11, color: "orange", x: -16, z: -160, w: 48, h: 48 },
    { no: 17, area: 12, color: "red", x: 32, z: -160, w: 48, h: 48 },
    { no: 18, color: "yellow", x: 96, z: -160, w: 48, h: 48 },
    { no: 19, area: 13, color: "red", x: 160, z: -160, w: 48, h: 48 },
    { no: 20, area: 14, color: "orange", x: 208, z: -160, w: 48, h: 48 },
    { no: 21, color: "blue", x: 272, z: -160, w: 48, h: 48 },
    { no: 22, area: 15, color: "red", x: 320, z: -160, w: 48, h: 48 },
    { no: 23, area: 16, color: "red", x: -80, z: -96, w: 48, h: 48 },
    { no: 24, area: 17, color: "red", x: 272, z: -96, w: 48, h: 48 },
    { no: 25, color: "blue", x: -16, z: -96, w: 96, h: 96 },
    { no: 26, color: "blue", x: 96, z: -96, w: 48, h: 96 },
    { no: 27, color: "blue", x: 160, z: -96, w: 96, h: 96 },
    { no: 28, area: 18, color: "orange", x: -80, z: -48, w: 48, h: 48 },
    { no: 29, area: 19, color: "orange", x: 272, z: -48, w: 48, h: 48 },
    { no: 30, area: 20, color: "orange", x: -16, z: 16, w: 48, h: 48 },
    { no: 31, area: 21, color: "red", x: 32, z: 16, w: 48, h: 48 },
    { no: 32, color: "blue", x: 96, z: 16, w: 48, h: 48 },
    { no: 33, area: 22, color: "red", x: 160, z: 16, w: 48, h: 48 },
    { no: 34, area: 23, color: "orange", x: 208, z: 16, w: 48, h: 48 },
    { no: 35, area: 24, color: "orange", x: 96, z: 80, w: 48, h: 48 }
];

// 区画全体を囲む白い外周線（区画から1チャンク＝16ブロック外側）の頂点 [x, z]
const plotOutline = [
    [80, -416], [80, -352], [-32, -352], [-32, -288], [-96, -288], [-96, -176], [-144, -176],
    [-144, -96], [-96, -96], [-96, 16], [-32, 16], [-32, 80], [80, 80], [80, 144],
    [160, 144], [160, 80], [272, 80], [272, 16], [336, 16], [336, -96], [384, -96],
    [384, -176], [336, -176], [336, -288], [272, -288], [272, -352], [160, -352], [160, -416]
];

// エリア番号（「エリア01」「エリア1」「1」のどれでも可）から、その区画の中心のブロック座標 { x, z } を返す。見つからなければ null
function getAreaCenter(area) {
    // 「区画07」など別の書き方は番号として読まない（書いてある x, z を使う）
    const m = String(area || '').trim().match(/^(?:エリア)?\s*(\d+)$/);
    if (!m) return null;
    const plot = plotData.find((p) => p.area === Number(m[1]));
    return plot ? { x: plot.x + plot.w / 2, z: plot.z + plot.h / 2 } : null;
}

// MAP_member.js の各行の座標を、エリア番号の区画の中心に合わせる（エリア番号のない行は書いてある x, z のまま）
if (typeof memberData !== 'undefined') {
    memberData.forEach((member) => {
        const center = getAreaCenter(member.area);
        if (center) { member.x = center.x; member.z = center.z; }
    });
}
