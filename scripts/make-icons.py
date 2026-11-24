# ==========================================================
# ブックマークアイコン（HOME / クラ の2行）をテーマの色で作るスクリプト
#
# 色は shared/themes/icons.json で決める。テーマごとに
#   img/themes/icons/<テーマ名>/favicon.ico・icon.png・apple-touch-icon.png
# を作る（過去のテーマのアイコンも残る）。
#
# 使い方（PowerShell）：
#   python scripts\make-icons.py                       … 全テーマのアイコンを作る
#   python scripts\make-icons.py --use default         … 作ったうえで「いつもの緑」を img/ に入れる（サイトに出る）
#   python scripts\make-icons.py --use 2026-winter-deep-freeze
#
# 必要なもの：Python と Pillow（pip install pillow）、Windows の「BIZ UDゴシック」フォント
# ==========================================================
import argparse
import json
import shutil
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
COLORS = ROOT / "shared" / "themes" / "icons.json"
OUT = ROOT / "img" / "themes" / "icons"
FONT = Path("C:/Windows/Fonts/BIZ-UDGothicB.ttc")

S = 512  # 大きく描いてから縮める


def line_image(text, color):
    """1行分の文字を、余白なしの透明な画像にする"""
    font = ImageFont.truetype(str(FONT), 400)
    box = ImageDraw.Draw(Image.new("L", (1, 1))).textbbox((0, 0), text, font=font)
    w, h = box[2] - box[0], box[3] - box[1]
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    ImageDraw.Draw(im).text((-box[0], -box[1]), text, font=font, fill=color)
    return im


def fit(im, max_w, max_h):
    """横幅いっぱいを目指しつつ、高さを超えない大きさにする（多少の横長・縦長は許す）"""
    scale = min(max_w / im.width, max_h / im.height)
    w = round(im.width * scale)
    h = round(im.height * scale)
    # 小さいサイズでも読めるよう、横幅を目一杯まで伸ばす（最大 1.25 倍まで）
    w = min(max_w, round(w * 1.25))
    return im.resize((w, h), Image.LANCZOS)


def make_master(c):
    im = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle((0, 0, S - 1, S - 1), radius=S // 7, fill=c["bg"])
    pad = S * 0.08
    gap = S * 0.06
    max_w = int(S - pad * 2)
    max_h = int((S - pad * 2 - gap) / 2)
    top = fit(line_image("HOME", c["top"]), max_w, max_h)
    bottom = fit(line_image("クラ", c["bottom"]), max_w, max_h)
    total = top.height + gap + bottom.height
    y = (S - total) / 2
    im.alpha_composite(top, (round((S - top.width) / 2), round(y)))
    im.alpha_composite(bottom, (round((S - bottom.width) / 2), round(y + top.height + gap)))
    return im


def build(name, c):
    out = OUT / name
    out.mkdir(parents=True, exist_ok=True)
    master = make_master(c)
    master.resize((192, 192), Image.LANCZOS).save(out / "icon.png")
    # iPhone のホーム画面は角を自動で丸めるので、四角い背景で塗りつぶした版にする
    apple = Image.new("RGBA", (S, S), c["bg"])
    apple.alpha_composite(master)
    apple.convert("RGB").resize((180, 180), Image.LANCZOS).save(out / "apple-touch-icon.png")
    master.save(out / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)])
    print(f"{name}: {out.relative_to(ROOT)}")
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--use", help="作ったあと img/ に入れてサイトに出すテーマ名")
    args = ap.parse_args()
    themes = {k: v for k, v in json.loads(COLORS.read_text(encoding="utf-8")).items() if not k.startswith("_")}
    for name, c in themes.items():
        build(name, c)
    if args.use:
        if args.use not in themes:
            raise SystemExit(f"icons.json に {args.use} がありません")
        for f in ("favicon.ico", "icon.png", "apple-touch-icon.png"):
            shutil.copyfile(OUT / args.use / f, ROOT / "img" / f)
        print(f"img/ のアイコンを {args.use} にしました")


if __name__ == "__main__":
    main()
