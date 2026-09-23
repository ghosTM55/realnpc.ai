"""Generate the committed web fonts without changing the original typefaces."""
from pathlib import Path
from fontTools import subset
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "src"
# Keep Latin for future copy, plus every supported character in the current UI.
codepoints = set(range(0x20, 0x250)) | set(range(0x2000, 0x2070))
for path in SOURCE.rglob("*"):
    if path.suffix in {".ts", ".tsx"}:
        codepoints.update(map(ord, path.read_text()))

for weight in ("Regular", "SemiBold", "Bold"):
    original = SOURCE / "fonts" / f"IoskeleyMonoNerdFont-{weight}.ttf"
    output = SOURCE / "fonts" / f"IoskeleyMono-{weight}.woff2"
    font = TTFont(original, recalcTimestamp=False)
    options = subset.Options()
    options.layout_features = ["*"]
    options.flavor = "woff2"
    subsetter = subset.Subsetter(options=options)
    subsetter.populate(unicodes=codepoints & font.getBestCmap().keys())
    subsetter.subset(font)
    font.flavor = "woff2"
    font.save(output)
    print(f"{output.relative_to(ROOT)}: {output.stat().st_size:,} bytes")
