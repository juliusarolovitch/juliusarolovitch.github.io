"""Compiles the TikZ figures listed in figures/figures.txt to SVGs that follow the light and dark palettes."""

import colorsys
import re
import subprocess
import sys
import tempfile
from pathlib import Path

PALETTE = {
    "fg": ("#1a1d21", "#e8ebee"),
    "muted": ("#646a72", "#959ca5"),
    "accent": ("#0d9488", "#2dd4bf"),
    "red": ("#e05a47", "#e05a47"),
    "black": ("#000000", "#e8ebee"),
    "blue": ("#4f7cc4", "#86a9e6"),
    "purple": ("#a855a8", "#d08ad0"),
    "yellow": ("#c99a1e", "#e3c25a"),
    "orange": ("#dd8235", "#f0a764"),
}
XCOLOR = {
    "blue": "blue",
    "purple": "purple",
    "yellow": "yellow",
    "orange": "orange",
    "green": "accent",
    "red": "red",
    "gray": "muted",
}
SCALE = 1.25
SURFACE = ("#ffffff", "#1a1d20")
SHADOW = "#000000"


def rgb(hex_color):
    return [int(hex_color[i : i + 2], 16) / 255 for i in (1, 3, 5)]


def to_hex(c):
    return "#" + "".join(f"{round(max(0, min(1, v)) * 255):02x}" for v in c)


def mix(a, b, w):
    return [w * x + (1 - w) * y for x, y in zip(a, b)]


def dark_value(c):
    """Finds the palette base and mix that produced a light color, and rebuilds it from the dark palette."""
    if all(abs(v - 1) < 0.004 for v in c):
        return SURFACE[1]
    if all(abs(v - 0.5) < 0.004 for v in c):
        return SHADOW
    best = None
    for name, (light, dark) in PALETTE.items():
        base = rgb(light)
        for toward, target in (("white", [1, 1, 1]), ("black", [0, 0, 0])):
            den = sum((b - t) ** 2 for b, t in zip(base, target))
            if den == 0:
                continue
            w = sum((v - t) * (b - t) for v, b, t in zip(c, base, target)) / den
            w = max(0.0, min(1.0, w))
            err = max(abs(v - x) for v, x in zip(c, mix(base, target, w)))
            if best is None or (round(err, 3), -w) < (round(best[0], 3), -best[3]):
                best = (err, name, toward, w)
    err, name, toward, w = best
    if err > 0.02:
        h, lum, sat = colorsys.rgb_to_hls(*c)
        return to_hex(colorsys.hls_to_rgb(h, 0.1 + 0.8 * (1 - lum), sat * 0.85))
    other = rgb(SURFACE[1]) if toward == "white" else [1, 1, 1]
    return to_hex(mix(rgb(PALETTE[name][1]), other, w))


def convert(tex, out):
    with tempfile.TemporaryDirectory() as tmp:
        source = Path(tmp) / tex.name
        defs = "".join(
            f"\\definecolor{{{name}}}{{HTML}}{{{PALETTE[role][0][1:]}}}"
            for name, role in XCOLOR.items()
        )
        source.write_text(
            tex.read_text().replace("\\begin{document}", defs + "\\begin{document}", 1)
        )
        subprocess.run(["tectonic", "--outdir", tmp, str(source)], check=True, capture_output=True)
        pdf = Path(tmp) / (tex.stem + ".pdf")
        svg_path = Path(tmp) / "out.svg"
        subprocess.run(["pdftocairo", "-svg", str(pdf), str(svg_path)], check=True)
        svg = svg_path.read_text()

    classes = {}

    def repl(m):
        attr, r, g, b = m.group(1), *(float(v) / 100 for v in m.groups()[1:])
        light = to_hex([r, g, b])
        key = (attr, light)
        if key not in classes:
            classes[key] = f"{attr[0]}{len(classes)}"
        return f'class="{classes[key]}"'

    svg = re.sub(r'(fill|stroke)="rgb\(([\d.]+)%, ([\d.]+)%, ([\d.]+)%\)"', repl, svg)
    svg = re.sub(r'(<[^>]*?)class="([^"]+)"([^>]*?)class="([^"]+)"', r'\1class="\2 \4"\3', svg)
    prop = {"f": "fill", "s": "stroke"}
    light_rules = "".join(f".{c}{{{prop[c[0]]}:{hexv}}}" for (_, hexv), c in classes.items())
    dark_rules = "".join(
        f".{c}{{{prop[c[0]]}:{dark_value(rgb(hexv))}}}" for (_, hexv), c in classes.items()
    )
    svg = re.sub(
        r'(width|height)="([\d.]+)pt"',
        lambda m: f'{m.group(1)}="{float(m.group(2)) * SCALE:.2f}pt"',
        svg,
        count=2,
    )
    style = f"<style>{light_rules}@media (prefers-color-scheme: dark){{{dark_rules}}}</style>"
    out.write_text(re.sub(r"(<svg[^>]*>)", r"\1" + style, svg, count=1))
    dark = out.with_name(out.stem + ".dark.svg")
    dark.write_text(re.sub(r"(<svg[^>]*>)", r"\1" + f"<style>{dark_rules}</style>", svg, count=1))


if __name__ == "__main__":
    root = Path(__file__).resolve().parent.parent
    pairs = [
        line.split()
        for line in (root / "figures" / "figures.txt").read_text().splitlines()
        if line.strip()
    ]
    for tex_path, out_path in pairs:
        if len(sys.argv) > 1 and not any(arg in tex_path for arg in sys.argv[1:]):
            continue
        convert(root / "figures" / tex_path, root / out_path)
        print(out_path)
