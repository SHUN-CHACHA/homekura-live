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
//   { area: "エリア01", name: "○○さん", icon: "xxxxxx.png", name2: "", icon2: "" },
// ==========================================================
// area にエリア番号（顔アイコンを置ける区画の番号。赤・オレンジの24区画は上の段から左→右の順に1〜24、追加の青の4区画は25〜28。js/data/MAP_plots.js の area）
// を書くだけで、その区画の中心に顔アイコンが置かれる（座標は書かなくてよい）。
// エリア以外の場所に置く時だけ、area を「共有地」などにして x, z（ブロック座標）を書く。
const memberData = [
    { area: "エリア01", name: "瑞木ゆき", icon: "MizukiYuki22.png", name2: "", icon2: "", name3: "", icon3: "" },
    { area: "エリア02", name: "うが", icon: "uga_youtube.png", name2: "", icon2: "", name3: "", icon3: "" },
    { area: "エリア03", name: "しろくる", icon: "sirokuru.png", name2: "", icon2: "", name3: "", icon3: "" },
    { area: "エリア04", name: "久遠星那", icon: "kuon_irix.png", name2: "", icon2: "", name3: "", icon3: "" },
    { area: "エリア05", name: "むっこさん", icon: "mukkoman.png", name2: "", icon2: "", name3: "", icon3: "" },
    { area: "エリア06", name: "久那式リン", icon: "Kunashiki_Lin.png", name2: "", icon2: "", name3: "", icon3: "" },
    { area: "エリア07", name: "神近", icon: "kamichika.png", name2: "", icon2: "", name3: "", icon3: "" },
    { area: "エリア08", name: "よいよい", icon: "yoiy0i.png", name2: "", icon2: "", name3: "", icon3: "" },
    { area: "エリア09", name: "さかいさんだー", icon: "Sakai_Thunder.png", name2: "", icon2: "", name3: "", icon3: "" },
    { area: "エリア10", name: "メッス", icon: "messu009.png", name2: "", icon2: "", name3: "", icon3: "" },
    { area: "エリア11", name: "LeftLily", icon: "LeftLily0427.png", name2: "", icon2: "", name3: "", icon3: "" },
    { area: "エリア13", name: "まぐにぃ", icon: "maguro29.png", name2: "", icon2: "", name3: "", icon3: "" },
    { area: "エリア14", name: "ナナホシナナ", icon: "nanahoshiNanaVT.png", name2: "", icon2: "", name3: "", icon3: "" },
    { area: "エリア15", name: "Ｍさん", icon: "MrMsan.png", name2: "", icon2: "", name3: "", icon3: "" },
    { area: "エリア16", name: "鶴太郎", icon: "turu0004.png", name2: "", icon2: "", name3: "", icon3: "" },
    { area: "エリア17", name: "神宮寺", icon: "jingujich.png", name2: "", icon2: "", name3: "", icon3: "" },
    { area: "エリア18", name: "じゃじゃーん菊池", icon: "jajaankikuchi.png", name2: "", icon2: "", name3: "", icon3: "" },
    { area: "エリア19", name: "KtR（こーたろー）", icon: "HAOgame_KtR.png", name2: "", icon2: "", name3: "", icon3: "" },
    { area: "エリア20", name: "早乙女燈真", icon: "Saotome_UUUM.png", name2: "", icon2: "", name3: "", icon3: "" },
    { area: "エリア21", name: "タツナミ先生", icon: "shyutan.png", name2: "", icon2: "", name3: "", icon3: "" },
    { area: "エリア22", name: "黎乃鈴", icon: "kuronosuzu.png", name2: "", icon2: "", name3: "", icon3: "" },
    { area: "エリア23", name: "珍珠花こまり", icon: "yukiyanagiKOMARI.png", name2: "", icon2: "", name3: "", icon3: "" },
    { area: "エリア24", name: "こみちん", icon: "komichin.png", name2: "", icon2: "", name3: "", icon3: "" }
];
