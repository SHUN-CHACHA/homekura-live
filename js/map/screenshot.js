// ==========================================================
// 📷 スクリーンショット コンポーネント
// window.MapApp.screenshot として公開します。
// 「📷 スクリーンショットを保存」ボタンで、今画面に見えている地図（背景地図・配置図・格子線・区画の枠線・
// 顔アイコン・ネームタグ）を1枚の PNG 画像に描き直します。ボタン・スライダーなどの操作部分は写しません。
// 右上に撮った日付、右下にウォーターマーク（サイト名とアドレス）を入れます。
//
//   PC     ：画像をダウンロード（ファイル名は 拠点マップMMDD.png）し、同時にクリップボードにもコピーする（Ctrl+V で貼れる）
//   スマホ ：画像を画面に表示し、「共有・保存」で共有メニュー（写真に保存・X・Discord・LINE など）を開く。長押しでも保存できる
// ==========================================================
(function () {
    window.MapApp = window.MapApp || {};

    const SITE_NAME = 'homeクラ合衆国Season3';
    const SITE_URL = 'shun-chacha.github.io/homekura-live';
    const FONT_FAMILY = "'Hiragino Sans', 'Noto Sans JP', 'Yu Gothic', 'Meiryo', sans-serif";

    let mapContainer = null;
    let button = null;

    // スマホ（狭い画面、またはタッチ操作だけの端末）か
    function isMobile() {
        return window.matchMedia('(max-width: 767px)').matches || window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    }

    function isVisible(el) {
        if (!el || !el.isConnected) return false;
        for (let node = el; node && node !== mapContainer; node = node.parentElement) {
            const cs = getComputedStyle(node);
            if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) === 0) return false;
        }
        return true;
    }

    function loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    }

    function svgToImage(svg, width, height) {
        svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        svg.setAttribute('width', width);
        svg.setAttribute('height', height);
        svg.removeAttribute('style');
        const text = new XMLSerializer().serializeToString(svg);
        return loadImage(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(text)}`);
    }

    function roundRectPath(ctx, x, y, w, h, r) {
        const rr = Math.max(0, Math.min(r, w / 2, h / 2));
        ctx.beginPath();
        ctx.moveTo(x + rr, y);
        ctx.arcTo(x + w, y, x + w, y + h, rr);
        ctx.arcTo(x + w, y + h, x, y + h, rr);
        ctx.arcTo(x, y + h, x, y, rr);
        ctx.arcTo(x, y, x + w, y, rr);
        ctx.closePath();
    }

    // 地図の上の要素の位置を、画像の中の位置（地図の左上が 0, 0）に直す
    function relRect(el, base) {
        const r = el.getBoundingClientRect();
        return { x: r.left - base.left, y: r.top - base.top, w: r.width, h: r.height };
    }

    // ---------- 背景地図・配置図・格子線・区画の枠線 ----------
    async function drawPane(ctx, pane, base) {
        if (!pane || !isVisible(pane)) return;
        // 画面と同じ重なり順（z-index の小さいものから。同じなら並び順）で描く。例：背景地図(1)の上に格子線(200)
        const zOf = (el) => parseInt(getComputedStyle(el).zIndex, 10) || 0;
        const children = Array.from(pane.children)
            .map((el, i) => ({ el, i, z: zOf(el) }))
            .sort((a, b) => a.z - b.z || a.i - b.i)
            .map((c) => c.el);
        for (const el of children) {
            if (!isVisible(el)) continue;
            const r = relRect(el, base);
            if (r.w <= 0 || r.h <= 0) continue;

            if (el.tagName === 'IMG') {
                // 背景地図（ドット絵）はぼかさずに描く
                ctx.imageSmoothingEnabled = false;
                ctx.drawImage(el, r.x, r.y, r.w, r.h);
                ctx.imageSmoothingEnabled = true;
            } else if (el.tagName.toLowerCase() === 'svg') {
                const clone = el.cloneNode(true);
                // 「地図の表示項目」などで隠している線は写さない
                const origShapes = el.querySelectorAll('path, rect, text, polygon');
                const cloneShapes = clone.querySelectorAll('path, rect, text, polygon');
                origShapes.forEach((shape, i) => {
                    if (getComputedStyle(shape).display === 'none') cloneShapes[i].remove();
                });
                const img = await svgToImage(clone, r.w, r.h);
                ctx.drawImage(img, r.x, r.y, r.w, r.h);
            }
        }
    }

    // ---------- 顔アイコン ----------
    function drawMarkers(ctx, pane, base) {
        if (!pane || !isVisible(pane)) return;
        pane.querySelectorAll('img').forEach((img) => {
            if (!isVisible(img) || !img.complete || !img.naturalWidth) return;
            const r = relRect(img, base);
            const cs = getComputedStyle(img);
            const bw = parseFloat(cs.borderTopWidth) || 0;
            const radius = parseFloat(cs.borderTopLeftRadius) || 0;

            ctx.save();
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.shadowBlur = 5;
            ctx.shadowOffsetY = 2;
            roundRectPath(ctx, r.x, r.y, r.w, r.h, radius);
            ctx.fillStyle = cs.backgroundColor || '#26262b';
            ctx.fill();
            ctx.restore();

            ctx.save();
            roundRectPath(ctx, r.x + bw, r.y + bw, r.w - bw * 2, r.h - bw * 2, Math.max(0, radius - bw));
            ctx.clip();
            ctx.globalAlpha = Number(cs.opacity) || 1;
            ctx.imageSmoothingEnabled = false; // 顔のドット絵はくっきり
            ctx.drawImage(img, r.x + bw, r.y + bw, r.w - bw * 2, r.h - bw * 2);
            ctx.restore();

            if (bw > 0 && cs.borderTopColor !== 'rgba(0, 0, 0, 0)' && cs.borderTopColor !== 'transparent') {
                ctx.save();
                roundRectPath(ctx, r.x + bw / 2, r.y + bw / 2, r.w - bw, r.h - bw, radius);
                ctx.lineWidth = bw;
                ctx.strokeStyle = cs.borderTopColor;
                ctx.stroke();
                ctx.restore();
            }
        });
    }

    // ---------- ネームタグ（名前・座標） ----------
    function drawTooltips(ctx, pane, base) {
        if (!pane || !isVisible(pane)) return;
        pane.querySelectorAll('.leaflet-tooltip').forEach((tip) => {
            if (!isVisible(tip)) return;
            const lines = Array.from(tip.children).filter((c) => isVisible(c) && c.textContent.trim() !== '');
            if (!lines.length) return;
            const r = relRect(tip, base);
            const cs = getComputedStyle(tip);
            const radius = parseFloat(cs.borderTopLeftRadius) || 0;

            ctx.save();
            ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
            ctx.shadowBlur = 6;
            ctx.shadowOffsetY = 2;
            roundRectPath(ctx, r.x, r.y, r.w, r.h, radius);
            ctx.fillStyle = cs.backgroundColor;
            ctx.fill();
            ctx.restore();

            const bw = parseFloat(cs.borderTopWidth) || 0;
            if (bw > 0) {
                ctx.save();
                roundRectPath(ctx, r.x + bw / 2, r.y + bw / 2, r.w - bw, r.h - bw, radius);
                ctx.lineWidth = bw;
                ctx.strokeStyle = cs.borderTopColor;
                ctx.stroke();
                ctx.restore();
            }

            lines.forEach((line) => {
                const lr = relRect(line, base);
                const ls = getComputedStyle(line);
                ctx.save();
                ctx.font = `${ls.fontWeight} ${ls.fontSize} ${ls.fontFamily}`;
                ctx.fillStyle = ls.color;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(line.textContent.trim(), lr.x + lr.w / 2, lr.y + lr.h / 2);
                ctx.restore();
            });
        });
    }

    // ---------- 右上の日付・右下のウォーターマーク ----------
    function drawLabel(ctx, text, x, y, align, size, alpha) {
        ctx.save();
        ctx.font = `bold ${size}px ${FONT_FAMILY}`;
        const padX = size * 0.6;
        const h = size * 1.7;
        const w = ctx.measureText(text).width + padX * 2;
        const left = align === 'right' ? x - w : x;
        roundRectPath(ctx, left, y, w, h, h / 2);
        ctx.fillStyle = `rgba(20, 20, 23, ${0.6 * alpha})`;
        ctx.fill();
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, left + padX, y + h / 2);
        ctx.restore();
        return h;
    }

    function formatDate(d) {
        const p = (n) => String(n).padStart(2, '0');
        return `${d.getFullYear()}/${p(d.getMonth() + 1)}/${p(d.getDate())}`;
    }

    function fileName(d) {
        const p = (n) => String(n).padStart(2, '0');
        return `拠点マップ${p(d.getMonth() + 1)}${p(d.getDate())}.png`;
    }

    // 今見えている地図を canvas に描いて PNG の Blob にする
    async function capture(now) {
        const mapEl = document.getElementById('map');
        const base = mapEl.getBoundingClientRect();
        const width = Math.round(base.width);
        const height = Math.round(base.height);
        const scale = Math.min(3, Math.max(2, window.devicePixelRatio || 1)); // 画面より細かく描いてくっきりさせる

        const canvas = document.createElement('canvas');
        canvas.width = width * scale;
        canvas.height = height * scale;
        const ctx = canvas.getContext('2d');
        ctx.scale(scale, scale);

        ctx.fillStyle = getComputedStyle(mapEl).backgroundColor || '#141417';
        ctx.fillRect(0, 0, width, height);

        await drawPane(ctx, mapEl.querySelector('.leaflet-overlay-pane'), base);
        await drawPane(ctx, mapEl.querySelector('.leaflet-plotFrame-pane'), base);
        drawMarkers(ctx, mapEl.querySelector('.leaflet-marker-pane'), base);
        drawTooltips(ctx, mapEl.querySelector('.leaflet-tooltip-pane'), base);

        const margin = 10;
        drawLabel(ctx, formatDate(now), width - margin, margin, 'right', 13, 1);
        // ウォーターマーク：1行に収まらない狭い画面（スマホ）では、サイト名とアドレスを2行に分ける
        const wmSize = 11;
        const wmLine = wmSize * 1.7;
        const oneLine = `${SITE_NAME}  ${SITE_URL}`;
        ctx.font = `bold ${wmSize}px ${FONT_FAMILY}`;
        if (ctx.measureText(oneLine).width + wmSize * 1.2 <= width - margin * 2) {
            drawLabel(ctx, oneLine, width - margin, height - margin - wmLine, 'right', wmSize, 0.75);
        } else {
            drawLabel(ctx, SITE_URL, width - margin, height - margin - wmLine, 'right', wmSize, 0.75);
            drawLabel(ctx, SITE_NAME, width - margin, height - margin - wmLine * 2 - 3, 'right', wmSize, 0.75);
        }

        return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('画像を作れませんでした'))), 'image/png'));
    }

    // ---------- 知らせ（画面下に数秒だけ出す） ----------
    function toast(message) {
        const el = document.createElement('div');
        el.className = 'screenshot-toast';
        el.textContent = message;
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 3500);
    }

    // ---------- PC：ダウンロード＋クリップボードにコピー ----------
    async function saveForPc() {
        const now = new Date();
        const blobPromise = capture(now);
        // クリップボードへのコピーは、ボタンを押した流れの中で始める必要があるので、画像ができる前に予約しておく
        let copyPromise = Promise.reject(new Error('クリップボード非対応'));
        if (navigator.clipboard && window.ClipboardItem) {
            copyPromise = navigator.clipboard.write([new ClipboardItem({ 'image/png': blobPromise })]);
        }
        const blob = await blobPromise;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName(now);
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 10000);
        try {
            await copyPromise;
            toast('📷 画像を保存し、クリップボードにもコピーしました（X や Discord で Ctrl+V で貼れます）');
        } catch (e) {
            toast('📷 画像を保存しました');
        }
    }

    // ---------- スマホ：画像を表示して共有メニューへ ----------
    async function saveForMobile() {
        const now = new Date();
        const blob = await capture(now);
        const file = new File([blob], fileName(now), { type: 'image/png' });
        const url = URL.createObjectURL(blob);

        const overlay = document.createElement('div');
        overlay.className = 'screenshot-overlay';
        overlay.innerHTML = `
            <div class="screenshot-sheet">
                <img alt="拠点マップのスクリーンショット">
                <p class="screenshot-hint">画像を長押しでも保存できます</p>
                <div class="screenshot-actions">
                    <button type="button" class="screenshot-share">📤 共有・保存</button>
                    <button type="button" class="screenshot-close">閉じる</button>
                </div>
            </div>`;
        overlay.querySelector('img').src = url;
        const close = () => { overlay.remove(); URL.revokeObjectURL(url); };
        overlay.querySelector('.screenshot-close').addEventListener('click', close);
        overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

        const shareBtn = overlay.querySelector('.screenshot-share');
        const canShareFile = navigator.canShare && navigator.canShare({ files: [file] });
        if (canShareFile) {
            // 共有メニュー（写真に保存・X・Discord・LINE など）を開く
            shareBtn.addEventListener('click', () => {
                navigator.share({ files: [file], title: SITE_NAME }).catch(() => {});
            });
        } else {
            // 共有メニューが使えないブラウザでは、ダウンロードにする
            shareBtn.textContent = '💾 画像を保存';
            shareBtn.addEventListener('click', () => {
                const a = document.createElement('a');
                a.href = url;
                a.download = file.name;
                document.body.appendChild(a);
                a.click();
                a.remove();
            });
        }
        document.body.appendChild(overlay);
    }

    async function onClick() {
        if (button.disabled) return;
        button.disabled = true;
        const label = button.textContent;
        button.textContent = '📷 作成中…';
        try {
            if (isMobile()) await saveForMobile();
            else await saveForPc();
        } catch (e) {
            console.error('スクリーンショットの作成に失敗しました:', e);
            toast('スクリーンショットを作れませんでした');
        } finally {
            button.disabled = false;
            button.textContent = label;
        }
    }

    function init() {
        mapContainer = document.getElementById('map-container');
        button = document.getElementById('screenshot-btn');
        if (!mapContainer || !button) return;
        button.addEventListener('click', onClick);
    }

    window.MapApp.screenshot = { init, capture };
})();
