#!/usr/bin/env python3
"""Colour the iDevice icons in the ATE blue.

Copies the Material Symbols SVG icons of eXeLearning's Zen style and swaps
their single colour for the primary colour of the ATE documents (#3F4D88).

    python3 scripts/color_icons.py /path/to/exelearning/public/files/perm/themes/base/zen/icons
"""
from pathlib import Path
import shutil
import sys

SOURCE_COLOUR = "#d40055"
ATE_BLUE = "#3F4D88"

source = Path(sys.argv[1])
target = Path(__file__).resolve().parents[1] / "theme/icons"
icons = sorted(source.glob("*.svg"))
for icon in icons:
    svg = icon.read_text()
    assert SOURCE_COLOUR in svg, f"{icon.name} does not use {SOURCE_COLOUR}"
    (target / icon.name).write_text(svg.replace(SOURCE_COLOUR, ATE_BLUE))
shutil.copy2(source / "LICENSE.txt", target / "LICENSE.txt")
print(f"Coloured {len(icons)} icons into {target}")
