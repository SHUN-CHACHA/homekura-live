// ==========================================================
// 📊 homeクラ メンバー拠点マップ - メンバーデータ（Season3準備用）
// ここを編集すればマップ・一覧に反映されます。
//
// icon  : avatars フォルダに入れた顔画像のファイル名（例: "xxxxxx.png"）
//         空欄のままだとプレースホルダー画像が表示されます
// name2 / icon2 : 同じ拠点に2人目がいる場合はここに記入すると
//                 アイコンが2つ並んで表示されます
// name3 / icon3 : 同じ拠点に3人目がいる場合はここに記入すると
//                 アイコンが3つ並んで表示されます（1人1行で改行表示）
// area / name が空欄の行は「未登録」として地図にも一覧にも表示されません
//
// ※ Season2（現行）のメンバーデータはこのファイルには含まれていません。
//   新しいワールドの座標が分かり次第、ここに1人ずつ追加してください。
//   例：
//   { area: "エリア01", name: "○○さん", icon: "xxxxxx.png", name2: "", icon2: "", x: 0, z: 0 },
// ==========================================================
// 座標は各区画（48×48ブロック）の中心。区画番号は全体図の枠に上の段から左→右の順で振った番号。
const memberData = [
    { area: "区画01", name: "瑞木ゆき", icon: "MizukiYuki22.png", name2: "", icon2: "", name3: "", icon3: "", x: 104, z: -344 },
    { area: "区画02", name: "うが", icon: "uga_youtube.png", name2: "", icon2: "", name3: "", icon3: "", x: 8, z: -296 },
    { area: "区画03", name: "しろくる", icon: "sirokuru.png", name2: "", icon2: "", name3: "", icon3: "", x: 56, z: -296 },
    { area: "区画05", name: "久遠星那", icon: "kuon_irix.png", name2: "", icon2: "", name3: "", icon3: "", x: 152, z: -296 },
    { area: "区画06", name: "むっこさん", icon: "mukkoman.png", name2: "", icon2: "", name3: "", icon3: "", x: 200, z: -296 },
    { area: "区画07", name: "久那式リン", icon: "Kunashiki_Lin.png", name2: "", icon2: "", name3: "", icon3: "", x: -40, z: -248 },
    { area: "区画08", name: "神近", icon: "kamichika.png", name2: "", icon2: "", name3: "", icon3: "", x: 248, z: -248 },
    { area: "区画12", name: "よいよい", icon: "yoiy0i.png", name2: "", icon2: "", name3: "", icon3: "", x: -40, z: -200 },
    { area: "区画13", name: "さかいさんだー", icon: "Sakai_Thunder.png", name2: "", icon2: "", name3: "", icon3: "", x: 248, z: -200 },
    { area: "区画14", name: "メッス", icon: "messu009.png", name2: "", icon2: "", name3: "", icon3: "", x: -88, z: -152 },
    { area: "区画16", name: "LeftLily", icon: "LeftLily0427.png", name2: "", icon2: "", name3: "", icon3: "", x: 8, z: -152 },
    { area: "区画19", name: "まぐにぃ", icon: "maguro29.png", name2: "", icon2: "", name3: "", icon3: "", x: 152, z: -152 },
    { area: "区画20", name: "ナナホシナナ", icon: "nanahoshiNanaVT.png", name2: "", icon2: "", name3: "", icon3: "", x: 200, z: -152 },
    { area: "区画22", name: "Ｍさん", icon: "MrMsan.png", name2: "", icon2: "", name3: "", icon3: "", x: 296, z: -152 },
    { area: "区画23", name: "鶴太郎", icon: "turu0004.png", name2: "", icon2: "", name3: "", icon3: "", x: -40, z: -104 },
    { area: "区画24", name: "神宮寺", icon: "jingujich.png", name2: "", icon2: "", name3: "", icon3: "", x: 248, z: -104 },
    { area: "区画29", name: "KtR（こーたろー）", icon: "HAOgame_KtR.png", name2: "", icon2: "", name3: "", icon3: "", x: 248, z: -56 },
    { area: "区画30", name: "早乙女燈真", icon: "Saotome_UUUM.png", name2: "", icon2: "", name3: "", icon3: "", x: 8, z: -8 },
    { area: "区画31", name: "タツナミ先生", icon: "shyutan.png", name2: "", icon2: "", name3: "", icon3: "", x: 56, z: -8 },
    { area: "区画34", name: "珍珠花こまり", icon: "yukiyanagiKOMARI.png", name2: "", icon2: "", name3: "", icon3: "", x: 200, z: -8 },
    { area: "区画35", name: "こみちん", icon: "komichin.png", name2: "", icon2: "", name3: "", icon3: "", x: 104, z: 40 }
];
