// ==========================================================
// 🔄 メンバー配置の履歴（席替え前など、前のエリア割り当て）
// 「2枚の地図を比較」ページの「配置」の選択欄で、今の割り当て（js/data/MAP_member.js）と見比べられる。
//
// memberLayoutCurrentLabel : 今の割り当て（MAP_member.js）の名前
// memberLayoutHistory      : 前の割り当て。新しいものを先頭に追加する。
//   label   : 選択欄に出す名前（例："席替え前"）
//   members : その時の MAP_member.js の行をそのままコピーしたもの（area を書けば座標は自動で入る）
//
// ★ 次に席替えがあったら：今の MAP_member.js の行を members にコピーして先頭に追加し、
//   MAP_member.js を新しい割り当てに書き換え、memberLayoutCurrentLabel も直す。
// ==========================================================
const memberLayoutCurrentLabel = "席替え後";
const memberLayoutHistory = [
    {
        label: "席替え前",
        members: [
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
            { area: "エリア12", name: "神圭アガリ", icon: "KamikadoAgari.png", name2: "", icon2: "", name3: "", icon3: "" },
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
            { area: "エリア24", name: "こみちん", icon: "komichin.png", name2: "", icon2: "", name3: "", icon3: "" },
            { area: "エリア25", name: "たいたい", icon: "taitai0904.png", name2: "", icon2: "", name3: "", icon3: "" },
            { area: "エリア26", name: "末吉かき", icon: "Kaki_Sueyoshi.png", name2: "", icon2: "", name3: "", icon3: "" },
            { area: "エリア27", name: "UDON", icon: "UDON_130.png", name2: "", icon2: "", name3: "", icon3: "" }
        ]
    }
];
