// config.js
// APIキーと初期配信者リストをまとめて管理します

const CONFIG = {
    YOUTUBE_API_KEY: 'AIzaSyDoy4uvy_4jXcpGw8fxTE33lFmBn18fAYY',

    // 配信者一覧データ
    DEFAULT_CHANNELS: [
        {
                "name": "まぐにぃ",
                "id": "UCMP7QuS4suoONg47Nbi-wrg",
                "twitterId": "maguro29",
                "twitchId": "maguro29game",
                "tiktokId": "",
                "instaId": "",
                "discordUrl": "https://discord.gg/bRuT74X7sS",
                "color": "#ff9900"
        },
        {
                "name": "じゃじゃーん菊地",
                "id": "UCi2kiw8hMo0vMAh5lXiafug",
                "twitterId": "kikuchidaisuke",
                "twitchId": "",
                "tiktokId": "jajakiku",
                "instaId": "",
                "discordUrl": "",
                "color": "#ffff00"
        },
        {
                "name": "さかいさんだー",
                "id": "UCuk8ABJTVWiApYlEojW_QrA",
                "twitterId": "Sakai_Thunder",
                "twitchId": "",
                "tiktokId": "",
                "instaId": "",
                "discordUrl": "",
                "color": "#ff00ff"
        },
        {
                "name": "Ｍさん",
                "id": "UCGK0iFuXhfA5VnL64xiKEmQ",
                "twitterId": "maikura_souti",
                "twitchId": "msan_no_nitizyou",
                "tiktokId": "msan_official",
                "instaId": "",
                "discordUrl": "",
                "color": "#00ffff"
        },
        {
                "name": "タツナミ先生",
                "id": "UCedenULTLYf3DanflEXdRCQ",
                "twitterId": "tatsunami",
                "twitchId": "",
                "tiktokId": "",
                "instaId": "",
                "discordUrl": "",
                "color": "#00ff00"
        },
        {
                "name": "神近",
                "id": "UCdLe2q91fJkN9GEyDvItp-w",
                "twitterId": "t_kamichika",
                "twitchId": "",
                "tiktokId": "",
                "instaId": "",
                "discordUrl": "",
                "color": "#ffffff"
        },
        {
                "name": "しろくる",
                "id": "UCTl5XpFddyDsj5woStUPu0w",
                "twitterId": "sirokuru_",
                "twitchId": "sirokuru",
                "tiktokId": "sirokuru",
                "instaId": "",
                "discordUrl": "",
                "color": "#ffffff"
        },
        {
                "name": "たにし",
                "id": "UCiC8VCiSLD3mxoO-QFKQnBQ",
                "twitterId": "tanishi_manbo",
                "twitchId": "tanishi1200",
                "tiktokId": "",
                "instaId": "",
                "discordUrl": "",
                "color": "#0000ff"
        },
        {
                "name": "凸もり",
                "id": "UCdN9GjPrqhcrzE27eWNNjxg",
                "twitterId": "mk_2_totsu",
                "twitchId": "totsumori",
                "tiktokId": "",
                "instaId": "",
                "discordUrl": "",
                "color": "#888888"
        },
        {
                "name": "神宮寺ちゃんねる",
                "id": "UCou8IVB8jJPk56H0farYQdA",
                "twitterId": "jinguji777ch",
                "twitchId": "",
                "tiktokId": "",
                "instaId": "",
                "discordUrl": "",
                "color": "#ff0000"
        },
        {
                "name": "カズクラ",
                "id": "UCu3Mp1ZimtNvyA-bcfo9VrQ",
                "twitterId": "kazuch0924",
                "twitchId": "",
                "tiktokId": "super_kazukura",
                "instaId": "kazuch0924",
                "discordUrl": "",
                "color": "#ff0000"
        },
        {
                "name": "たいたい",
                "id": "UCds-nvoKCcvixVXJ_54QcbQ",
                "twitterId": "taitaiMEN1997",
                "twitchId": "taitai19970904",
                "tiktokId": "",
                "instaId": "",
                "discordUrl": "",
                "color": "#00ccff"
        },
        {
                "name": "岐阜のこみちん",
                "id": "UCw4frqkotySLjJ_CFZR5-7w",
                "twitterId": "komichin0704",
                "twitchId": "",
                "tiktokId": "",
                "instaId": "",
                "discordUrl": "",
                "color": "#ffcc00"
        },
        {
                "name": "ナナホシナナ",
                "id": "UCncsOsnMBAAaYb6WidBYIDw",
                "twitterId": "nanahoshinana77",
                "twitchId": "nanahoshinana77",
                "tiktokId": "",
                "instaId": "",
                "discordUrl": "",
                "color": "#ff33ff"
        },
        {
                "name": "月成るくす",
                "id": "UCP9rcDSyTRtnu8EsG2CmLMg",
                "twitterId": "Tsukinari_Lux_",
                "twitchId": "",
                "tiktokId": "",
                "instaId": "tsukinarilux",
                "discordUrl": "",
                "color": "#ffffcc"
        },
        {
                "name": "メッス",
                "id": "UCkJeBcOPRBs5bri5B3sFgVg",
                "twitterId": "messu_009",
                "twitchId": "",
                "tiktokId": "",
                "instaId": "",
                "discordUrl": "",
                "color": "#ffffff"
        },
        {
                "name": "よいよい",
                "id": "UCzk-vAIbo3iVBGTNaJQS2qQ",
                "twitterId": "yoiy0i",
                "twitchId": "",
                "tiktokId": "",
                "instaId": "",
                "discordUrl": "",
                "color": "#ccff00"
        },
        {
                "name": "うえまさ",
                "id": "UCIBDdDXnViOgN5tCpfX7NOA",
                "twitterId": "uema5aCh",
                "twitchId": "",
                "tiktokId": "",
                "instaId": "uema5a",
                "discordUrl": "",
                "color": "#9900ff"
        },
        {
                "name": "久那式リン",
                "id": "UCPs7s2VlkwVWWpjcyjviINA",
                "twitterId": "Kunashiki_Lin_",
                "twitchId": "",
                "tiktokId": "",
                "instaId": "",
                "discordUrl": "",
                "color": "#ffffff"
        },
        {
                "name": "犬野はる",
                "id": "UCVB16vOi24WElLNbbmOFFsA",
                "twitterId": "VT_InunoHaru",
                "twitchId": "",
                "tiktokId": "",
                "instaId": "",
                "discordUrl": "",
                "color": "#ccffcc"
        },
        {
                "name": "珍珠花こまり",
                "id": "UCSLCZ5uhCYUMQ9TG9Cs1ERQ",
                "twitterId": "komari_yuki",
                "twitchId": "",
                "tiktokId": "",
                "instaId": "",
                "discordUrl": "",
                "color": "#ffffff"
        },
        {
                "name": "ぽこにゃん",
                "id": "UCO06KZjWOe6b1tXrgzzakZA",
                "twitterId": "",
                "tiktokId": "",
                "instaId": "",
                "discordUrl": "",
                "color": "#00ff00"
        },
        {
                "name": "KtR（こーたろー）",
                "id": "UCuJVrV6spfu9QUP6Wr4fugA",
                "twitterId": "HAOKtR",
                "twitchId": "",
                "tiktokId": "",
                "instaId": "",
                "discordUrl": "",
                "color": "#3399ff"
        },
        {
                "name": "ゆりも",
                "id": "UCrfGCEk3MPYap72t0TX_sdQ",
                "twitterId": "yurimotosuzu",
                "twitchId": "yurimotosuzu",
                "tiktokId": "yurimotosuzu",
                "instaId": "yurimotosuzu",
                "discordUrl": "",
                "color": "#a6d3c4"
        }
]
};
