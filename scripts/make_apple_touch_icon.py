"""Genera apple-touch-icon.png (180x180) con il logo "V" su sfondo blu.

Render in oversampling 4x e successivo resize a Lanczos per ottenere
bordi e tratti antialiased puliti (PIL non offre anti-aliasing nativo
sulle primitive). Esegui: `python scripts/make_apple_touch_icon.py`.
"""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw


FINAL_SIZE = 180
OVERSAMPLE = 4
RENDER_SIZE = FINAL_SIZE * OVERSAMPLE

BG_BLUE = "#1976d2"
WHITE = (255, 255, 255, 255)
DASH_WHITE = (255, 255, 255, int(round(255 * 0.6)))


def render_icon() -> Image.Image:
    img = Image.new("RGBA", (RENDER_SIZE, RENDER_SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Le coordinate sono espresse nel viewBox 64x64 del logo originale.
    scale = RENDER_SIZE / 64.0

    def s(v: float) -> float:
        return v * scale

    radius = int(round(14 * scale))
    draw.rounded_rectangle(
        (0, 0, RENDER_SIZE - 1, RENDER_SIZE - 1),
        radius=radius,
        fill=BG_BLUE,
    )

    sw_v = int(round(4.5 * scale))
    sw_c = int(round(2.8 * scale))

    # V principale: due tratti dal vertice (32,52) ai due angoli alti.
    draw.line([(s(32), s(52)), (s(10), s(12))], fill=WHITE, width=sw_v)
    draw.line([(s(32), s(52)), (s(54), s(12))], fill=WHITE, width=sw_v)

    # Linea verticale tratteggiata (stroke-dasharray 3 4, opacity 0.6).
    y = 52.0
    y_end = 12.0
    while y > y_end:
        seg_end = max(y - 3.0, y_end)
        draw.line([(s(32), s(y)), (s(32), s(seg_end))], fill=DASH_WHITE, width=sw_c)
        y = seg_end - 4.0

    # Punto di impatto al vertice.
    r = 5.5
    draw.ellipse(
        (s(32 - r), s(52 - r), s(32 + r), s(52 + r)),
        fill=WHITE,
    )

    return img.resize((FINAL_SIZE, FINAL_SIZE), Image.LANCZOS)


def main() -> None:
    out_path = Path(__file__).resolve().parent.parent / "apple-touch-icon.png"
    icon = render_icon()
    icon.save(out_path, format="PNG", optimize=True)
    print(f"Wrote {out_path} ({icon.size[0]}x{icon.size[1]})")


if __name__ == "__main__":
    main()
