// ==========================================================
// 📊 homeクラ メンバー拠点マップ - メンバーデータ
// ここを編集すればマップ・一覧に反映されます。
//
// icon  : avatars フォルダに入れた顔画像のファイル名（例: "xxxxxx.png"）
//         空欄のままだとプレースホルダー画像が表示されます
// name2 / icon2 : 同じ拠点に2人目がいる場合はここに記入すると
//                 アイコンが2つ並んで表示されます
// name3 / icon3 : 同じ拠点に3人目がいる場合はここに記入すると
//                 アイコンが3つ並んで表示されます（1人1行で改行表示）
// area / name が空欄の行は「未登録」として地図にも一覧にも表示されません
// ==========================================================
const memberData = [
    { area: "エリア01", name: "Ｍさん", icon: "MrMsan.svg", name2: "", icon2: "", x: 720, z: 0 }, // 01人目
    { area: "エリア02", name: "２８（ふたば）", icon: "ftb28.svg", name2: "", icon2: "", x: 624, z: 360 }, // 02人目
    { area: "", name: "", icon: "", name2: "", icon2: "", x: 0, z: 0 }, // 03人目
    { area: "", name: "", icon: "", name2: "", icon2: "", x: 0, z: 0 }, // 04人目
    { area: "エリア05", name: "うどん", icon: "UDON130.svg", name2: "", icon2: "", x: -360, z: 624 }, // 05人目
    { area: "エリア06", name: "黎乃鈴 -Kurono Suzu-", icon: "kuronosuzu.svg", name2: "", icon2: "", x: -624, z: 360 }, // 06人目
    { area: "エリア07", name: "神宮寺", icon: "jingujich.svg", name2: "", icon2: "", x: -720, z: 0 }, // 07人目
    { area: "", name: "", icon: "", name2: "", icon2: "", x: 0, z: 0 }, // 08人目
    { area: "", name: "", icon: "", name2: "", icon2: "", x: 0, z: 0 }, // 09人目
    { area: "エリア10", name: "", icon: "Tanish1.svg", name2: "", icon2: "yukiyanagiKOMARI.svg", x: 0, z: -720 }, // 10人目
    { area: "エリア11", name: "月成るくす", icon: "tsukinarilux.svg", name2: "", icon2: "", x: 360, z: -624 }, // 11人目
    { area: "エリア12", name: "メッス", icon: "messu009.svg", name2: "", icon2: "", x: 624, z: -360 }, // 12人目
    { area: "エリア13", name: "ぽこにゃん", icon: "pokonyan_0603.svg", name2: "", icon2: "", x: 966, z: 259 }, // 13人目
    { area: "エリア14", name: "久那式リン", icon: "Kunashiki_Lin.svg", name2: "", icon2: "", x: 707, z: 707 }, // 14人目
    { area: "共有地", name: "共有地", icon: "HOME.png", name2: "", icon2: "", x: 514, z: 817 }, // 共有地
    { area: "エリア15", name: "しろくる", icon: "sirokuru.svg", name2: "", icon2: "", x: 259, z: 966 }, // 15人目
    { area: "エリア16", name: "神近", icon: "kamichika.svg", name2: "", icon2: "", x: -259, z: 966 }, // 16人目
    { area: "エリア17", name: "早乙女燈真", icon: "saotomeirix.svg", name2: "久遠星那", icon2: "kuon_irix.svg", x: -707, z: 707 }, // 17人目
    { area: "", name: "", icon: "", name2: "", icon2: "", x: 0, z: 0 }, // 18人目
    { area: "エリア19", name: "瑞木ゆき", icon: "MizukiYuki22.svg", name2: "", icon2: "", x: -966, z: -259 }, // 19人目
    { area: "エリア20", name: "じゃじゃーん菊池", icon: "jajaankikuchi.svg", name2: "", icon2: "", x: -707, z: -707 }, // 20人目
    { area: "エリア21", name: "さかいさんだー", icon: "Sakai_Thunder.svg", name2: "", icon2: "", x: -259, z: -966 }, // 21人目
    { area: "", name: "", icon: "", name2: "", icon2: "", x: 0, z: 0 }, // 22人目
    { area: "", name: "", icon: "", name2: "", icon2: "", x: 0, z: 0 }, // 23人目
    { area: "エリア24", name: "よいよい", icon: "yoiy0i.svg", name2: "", icon2: "", x: 966, z: -259 }, // 24人目
    { area: "エリア25", name: "LeftLily/レフトリリー", icon: "LeftLily0427.svg", name2: "", icon2: "", x: 1280, z: 0 }, // 25人目
    { area: "エリア26", name: "まぐにぃ", icon: "maguro29.svg", name2: "", icon2: "", x: 1109, z: 640 }, // 26人目
    { area: "エリア27", name: "うえまさ", icon: "uema5a.svg", name2: "", icon2: "", x: 640, z: 1109 }, // 27人目
    { area: "エリア28", name: "珍珠花こまり", icon: "yukiyanagiKOMARI.svg", name2: "たにしらいす", icon2: "Tanish1.svg", x: 0, z: 1280 }, // 28人目
    { area: "エリア29", name: "うが", icon: "uga_youtube.svg", name2: "", icon2: "", x: -640, z: 1109 }, // 29人目
    { area: "エリア30", name: "ゆりも", icon: "yurimosaaan.svg", name2: "", icon2: "", x: -1109, z: 640 }, // 30人目
    { area: "エリア31", name: "ナナホシナナ", icon: "nanahoshiNanaVT.svg", name2: "", icon2: "", x: -1280, z: 0 }, // 31人目
    { area: "エリア32", name: "タツナミ先生", icon: "shyutan.svg", name2: "むっこさん", icon2: "mukkoman.svg", x: -1109, z: -640 }, // 32人目（2名）
    { area: "", name: "", icon: "", name2: "", icon2: "", x: 0, z: 0 }, // 33人目
    { area: "エリア34", name: "鶴太郎", icon: "turu0004.svg", name2: "", icon2: "", x: 0, z: -1280 }, // 34人目
    { area: "引越し中", name: "", icon: "", name2: "", icon2: "", x: 640, z: -1109 }, // 35人目
    { area: "エリア36", name: "凸もり", icon: "totsumori.svg", name2: "", icon2: "", x: 1109, z: -640 }  // 36人目
    { area: "夏祭り", name: "夏祭り", icon: "maturi.png", name2: "", icon2: "", x: -9, z: -388 }, // イベント会場
];
