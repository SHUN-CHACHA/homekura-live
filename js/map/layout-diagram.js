// ==========================================================
// 📋 配置図コンポーネント
// window.MapApp.layoutDiagram として公開します。
// 区画（js/data/MAP_plots.js）とメンバー（js/data/MAP_member.js）から、白地に色付きの枠と配信者名だけを描いた
// 「配置図」を SVG で作ります。地図の選択肢で「配置図」を選ぶと、地図画像の代わりにこれを表示します。
// メンバーが入っていないエリアには、エリア番号を表示します。
// ==========================================================
(function () {
    window.MapApp = window.MapApp || {};

    const SVG_NS = 'http://www.w3.org/2000/svg';
    const FRAME_COLORS = {
        red: '#de1923',
        orange: '#fb8418',
        blue: '#05a7fb',
        yellow: '#f0c800'
    };
    const PLOT_INSET = 0.75;   // 枠線の太さ（1.5ブロック）の半分だけ内側に描き、線の外側を区画の端（48×48ブロック）にぴったり合わせる。隣り合う赤・オレンジの枠はくっつく
    const TEXT_PADDING = 3;    // 枠の内側の余白（ブロック数）
    const MAX_FONT_SIZE = 9;   // 名前の文字の大きさの上限（ブロック数）
    const MIN_ONE_LINE = 7.5;  // これより小さくなる長い名前は2行に分ける
    // 自動では区切り位置がうまく決まらない名前だけ、2行に分ける位置をここで指定する
    const NAME_BREAKS = {
        'ナナホシナナ': ['ナナホシ', 'ナナ']
    };

    const SIZE_UNIT = 128; // 配置図の範囲は128ブロックの倍数（画像にした時に縦横のピクセル数が128の倍数になるように）

    // 配置図の範囲を [[X, Z], [X, Z]] で返す。白い外周線を囲む範囲を、上下左右に均等に広げて128ブロックの倍数にする
    // （今は外周線 560×560 ブロック → 640×640 ブロック）
    function getBounds() {
        const xs = plotOutline.map(([x]) => x);
        const zs = plotOutline.map(([, z]) => z);
        const pad = (min, max) => {
            const extra = Math.ceil((max - min) / SIZE_UNIT) * SIZE_UNIT - (max - min);
            return [min - Math.floor(extra / 2), max + Math.ceil(extra / 2)];
        };
        const [minX, maxX] = pad(Math.min(...xs), Math.max(...xs));
        const [minZ, maxZ] = pad(Math.min(...zs), Math.max(...zs));
        return [[minX, minZ], [maxX, maxZ]];
    }

    // 文字列の幅のおおよその見積もり（全角＝1文字分、半角＝0.6文字分）
    function textWidth(text) {
        return Array.from(text).reduce((sum, ch) => sum + (/[\x20-\x7e]/.test(ch) ? 0.6 : 1), 0);
    }

    // 文字の種類（漢字・ひらがな・カタカナ・その他）
    function charType(ch) {
        if (/[一-鿿々]/.test(ch)) return 'kanji';
        if (/[぀-ゟ]/.test(ch)) return 'hira';
        if (/[゠-ヿー]/.test(ch)) return 'kata';
        return 'other';
    }

    // 長い名前を2行に分ける（「（」があればその前で、なければ真ん中に近い文字の種類が変わるところで、
    // それもなければ前半が短くなる真ん中で。例：さかい／さんだー、珍珠花／こまり）
    function splitName(name) {
        if (NAME_BREAKS[name]) return NAME_BREAKS[name];
        const paren = name.search(/[（(]/);
        if (paren > 0) return [name.slice(0, paren), name.slice(paren)];
        const chars = Array.from(name);
        const half = Math.floor(chars.length / 2);
        let at = half;
        for (let d = 0; d <= 1; d++) {
            const found = [half - d, half + d].find((i) => i >= 2 && i <= chars.length - 2 && charType(chars[i - 1]) !== charType(chars[i]));
            if (found) { at = found; break; }
        }
        return [chars.slice(0, at).join(''), chars.slice(at).join('')];
    }

    // 枠の幅に収まるよう、名前を1行または2行にして文字の大きさ（行ごと）を決める
    // 「KtR（こーたろー）」のように読みがなを（）で付けた名前は、名前の行は大きく、（）の行は横幅に収まる大きさにする
    function fitLines(names, innerWidth) {
        const fit = (line) => Math.min(MAX_FONT_SIZE, innerWidth / textWidth(line));
        let lines = names;
        let size = Math.min(...lines.map(fit));
        if (names.length === 1 && size < MIN_ONE_LINE && Array.from(names[0]).length > 3) {
            const split = splitName(names[0]);
            if (/^[（(]/.test(split[1])) return { lines: split, sizes: split.map(fit) };
            const splitSize = Math.min(...split.map(fit));
            if (splitSize > size) {
                lines = split;
                size = splitSize;
            }
        }
        return { lines, sizes: lines.map(() => size) };
    }

    function el(name, attrs, parent) {
        const node = document.createElementNS(SVG_NS, name);
        Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
        if (parent) parent.appendChild(node);
        return node;
    }

    // エリア番号（数字）から、そのエリアに入っているメンバーの行を探す
    function findMember(areaNo) {
        return memberData.find((m) => {
            const match = String(m.area || '').trim().match(/^(?:エリア)?\s*(\d+)$/);
            return match && Number(match[1]) === areaNo && m.name && m.name.trim() !== '';
        });
    }

    function buildSvg() {
        const [[minX, minZ], [maxX, maxZ]] = getBounds();
        const svg = el('svg', {
            xmlns: SVG_NS,
            viewBox: `${minX} ${minZ} ${maxX - minX} ${maxZ - minZ}`,
            'font-family': "'Hiragino Sans', 'Noto Sans JP', 'Yu Gothic', 'Meiryo', sans-serif"
        });

        // 外周（区画全体の土台）
        el('polygon', {
            points: plotOutline.map(([x, z]) => `${x},${z}`).join(' '),
            fill: '#f3f5ef',
            stroke: '#9a9a9a',
            'stroke-width': 1.2
        }, svg);

        plotData.forEach((plot) => {
            const x = plot.x + PLOT_INSET;
            const z = plot.z + PLOT_INSET;
            const w = plot.w - PLOT_INSET * 2;
            const h = plot.h - PLOT_INSET * 2;
            const color = FRAME_COLORS[plot.color] || '#9a9a9a';
            el('rect', { x, y: z, width: w, height: h, fill: '#ffffff', stroke: color, 'stroke-width': 1.5 }, svg);

            // 名前を書くのは顔アイコンを置けるエリア（エリア番号のある区画）だけ
            if (!plot.area) return;
            const member = findMember(plot.area);
            const centerX = x + w / 2;
            const centerZ = z + h / 2;

            if (!member) {
                // 空いているエリアはエリア番号を表示する
                const text = el('text', {
                    x: centerX, y: centerZ, 'text-anchor': 'middle', 'dominant-baseline': 'central',
                    'font-size': 12, 'font-weight': 'bold', fill: color, opacity: 0.8
                }, svg);
                text.textContent = String(plot.area);
                return;
            }

            const names = [member.name, member.name2, member.name3].filter((n) => n && n.trim() !== '');
            const { lines, sizes } = fitLines(names, w - TEXT_PADDING * 2);
            // 行ごとの高さ（文字の大きさ×1.25）を積み上げて、全体が枠の上下の真ん中に来るように並べる
            const heights = sizes.map((s) => s * 1.25);
            let top = centerZ - heights.reduce((a, c) => a + c, 0) / 2;
            lines.forEach((line, i) => {
                const lineZ = top + heights[i] / 2;
                top += heights[i];
                const text = el('text', {
                    x: centerX, y: lineZ, 'text-anchor': 'middle', 'dominant-baseline': 'central',
                    'font-size': sizes[i].toFixed(2), 'font-weight': 'bold', fill: '#2a2a2a'
                }, svg);
                text.textContent = line;
            });
        });

        return svg;
    }

    // 地図に重ねる配置図のレイヤーを作る（呼ぶたびに最新のメンバーで描き直す）
    function createOverlay() {
        const bounds = window.MapApp.mapConfig.toLeafletBounds(getBounds());
        return L.svgOverlay(buildSvg(), bounds, { interactive: false, className: 'layout-diagram' });
    }

    window.MapApp.layoutDiagram = { getBounds, buildSvg, createOverlay };
})();
