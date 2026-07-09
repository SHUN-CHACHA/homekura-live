// ==========================================================
// 📦 必要ファイル一式をZIPにまとめてダウンロードするコンポーネント
// window.MapApp.downloadZip として公開します。
// サーバー上（同じフォルダ）にある最新のファイルを取得してZIP化します。
// ※ file:// で直接開いた場合はブラウザの制限で失敗します（GitHub Pagesなど
//    サーバー経由で開いている場合のみ動作します）
// ==========================================================
(function () {
    window.MapApp = window.MapApp || {};

    // 必須ファイル（1つでも取得に失敗したらZIP作成自体を中止する）
    const REQUIRED_DOWNLOAD_FILES = [
        'minecraft_map.html',
        'background_image_guide.html',
        'js/memberlist.js',
        'js/color-customizer.js',
        'js/map-config.js',
        'js/map-grid.js',
        'js/member-list.js',
        'js/mobile-ui.js',
        'js/download-zip.js'
    ];

    // memberlist.js に登録されているアバター画像のファイル名一覧を集める（重複なし）
    function getAvatarFileList() {
        const files = new Set();
        const memberData = (window.MapApp.memberList && window.MapApp.memberList.memberData()) || [];
        memberData.forEach((m) => {
            if (m.icon) files.add(`avatars/${m.icon}`);
            if (m.icon2) files.add(`avatars/${m.icon2}`);
        });
        return Array.from(files);
    }

    // 画像類（map・avatars・装飾画像）：1つ見つからなくても他は続行し、ZIPには入れるだけ入れる
    function getOptionalDownloadFiles() {
        const mapImageList = (window.MapApp.mapConfig && window.MapApp.mapConfig.mapImageList) || [];
        return [
            ...mapImageList.map((entry) => entry.fileName),
            ...getAvatarFileList(),
            'img/compass.png'
        ];
    }

    async function downloadAllFiles() {
        const btn = document.getElementById('download-files-btn');
        const label = document.getElementById('download-files-label');
        const originalLabel = label.textContent;
        btn.disabled = true;
        label.textContent = '準備中...';

        try {
            const zip = new JSZip();

            // 必須ファイル：1つでも失敗したら中止
            await Promise.all(REQUIRED_DOWNLOAD_FILES.map(async (fileName) => {
                const res = await fetch(fileName, { cache: 'no-store' });
                if (!res.ok) throw new Error(`${fileName} の取得に失敗しました (HTTP ${res.status})`);
                const blob = await res.blob();
                zip.file(fileName, blob);
            }));

            // 画像類：見つからないものはスキップして続行（欠けていてもZIP自体は作る）
            const missingFiles = [];
            await Promise.all(getOptionalDownloadFiles().map(async (fileName) => {
                try {
                    const res = await fetch(fileName, { cache: 'no-store' });
                    if (!res.ok) throw new Error(`HTTP ${res.status}`);
                    const blob = await res.blob();
                    zip.file(fileName, blob);
                } catch (e) {
                    missingFiles.push(fileName);
                    console.warn(`${fileName} が見つからなかったためZIPに含めていません。`, e);
                }
            }));

            const zipBlob = await zip.generateAsync({ type: 'blob' });
            const url = URL.createObjectURL(zipBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'homekura_map_files.zip';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            if (missingFiles.length > 0) {
                alert(`ZIPを作成しましたが、以下のファイルは見つからなかったため含まれていません:\n\n${missingFiles.join('\n')}`);
            }
        } catch (err) {
            console.error(err);
            alert('ファイルの取得に失敗しました。\nGitHub Pagesなどサーバー経由で開いているか確認してください（ローカルでファイルをダブルクリックして開いている場合はブラウザの制限で失敗します）。\n\n詳細: ' + err.message);
        } finally {
            btn.disabled = false;
            label.textContent = originalLabel;
        }
    }

    function init() {
        document.getElementById('download-files-btn').addEventListener('click', downloadAllFiles);
    }

    window.MapApp.downloadZip = { init };
})();
