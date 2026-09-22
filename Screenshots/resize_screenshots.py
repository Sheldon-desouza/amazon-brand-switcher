from PIL import Image, ImageDraw
import os
import glob

TARGET_W, TARGET_H = 1280, 800
SCREENSHOTS_DIR = "/Users/sheldon/Rufusly/amazon-client-switcher/Screenshots"
OUTPUT_DIR = "/Users/sheldon/Rufusly/amazon-client-switcher/Screenshots/resized"

os.makedirs(OUTPUT_DIR, exist_ok=True)

# Amazon-style gradient: dark teal to dark navy
TOP_COLOR = (15, 43, 55)      # dark teal (Amazon Seller Central header colour)
BOTTOM_COLOR = (20, 30, 48)   # dark navy

def make_gradient_bg(w, h):
    img = Image.new("RGB", (w, h))
    draw = ImageDraw.Draw(img)
    for y in range(h):
        r = int(TOP_COLOR[0] + (BOTTOM_COLOR[0] - TOP_COLOR[0]) * y / h)
        g = int(TOP_COLOR[1] + (BOTTOM_COLOR[1] - TOP_COLOR[1]) * y / h)
        b = int(TOP_COLOR[2] + (BOTTOM_COLOR[2] - TOP_COLOR[2]) * y / h)
        draw.line([(0, y), (w, y)], fill=(r, g, b))
    return img

files = sorted(glob.glob(os.path.join(SCREENSHOTS_DIR, "*.png")))
# Exclude already-resized files
files = [f for f in files if "resized" not in f]

for i, filepath in enumerate(files, 1):
    src = Image.open(filepath).convert("RGB")
    sw, sh = src.size

    # Scale screenshot so it fits inside the canvas with generous padding
    PADDING = 60
    max_w = TARGET_W - PADDING * 2
    max_h = TARGET_H - PADDING * 2

    scale = min(max_w / sw, max_h / sh)
    new_w = int(sw * scale)
    new_h = int(sh * scale)

    src_resized = src.resize((new_w, new_h), Image.LANCZOS)

    # Create gradient background
    bg = make_gradient_bg(TARGET_W, TARGET_H)

    # Add subtle rounded-rectangle shadow behind the screenshot
    shadow_offset = 8
    shadow_x = (TARGET_W - new_w) // 2 + shadow_offset
    shadow_y = (TARGET_H - new_h) // 2 + shadow_offset
    shadow = Image.new("RGB", (new_w, new_h), (5, 15, 25))
    bg.paste(shadow, (shadow_x, shadow_y))

    # Paste screenshot centred
    paste_x = (TARGET_W - new_w) // 2
    paste_y = (TARGET_H - new_h) // 2
    bg.paste(src_resized, (paste_x, paste_y))

    # Save as 24-bit PNG (no alpha)
    out_name = f"screenshot-{i:02d}.png"
    out_path = os.path.join(OUTPUT_DIR, out_name)
    bg.save(out_path, "PNG", optimize=False)
    print(f"Saved {out_name}  ({TARGET_W}x{TARGET_H})  <- {os.path.basename(filepath)}")

print(f"\nDone. {len(files)} screenshots saved to {OUTPUT_DIR}")
