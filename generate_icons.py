#!/usr/bin/env python3
"""
Generate icon PNGs for the Seller Central Brand Switcher Chrome extension.
Resizes the source icon to 16x16, 48x48, and 128x128 pixels.

Usage:
    python3 generate_icons.py
"""
import sys
import os

try:
    from PIL import Image
except ImportError:
    print("Pillow not found. Installing...")
    os.system(f"{sys.executable} -m pip install Pillow")
    from PIL import Image

SOURCE = os.path.join(
    os.path.expanduser("~"),
    ".gemini/antigravity-ide/brain/d03369da-04ef-497e-9f4d-5eaec36af123/extension_icon_design_1786631846273.png"
)
OUT_DIR = os.path.join(os.path.dirname(__file__), "icons")

os.makedirs(OUT_DIR, exist_ok=True)

src = Image.open(SOURCE).convert("RGBA")

for size in [16, 48, 128]:
    resized = src.resize((size, size), Image.LANCZOS)
    out_path = os.path.join(OUT_DIR, f"icon-{size}.png")
    resized.save(out_path, "PNG")
    print(f"✅  Created {out_path} ({size}x{size}px)")

print("\nAll icons generated successfully.")
