"""YouTube Shorts thumbnails (1080x1920) in the IMAGINE style.
Usage: python3 yt_thumbs.py <DATE> <folder with DATE_package.json and DATE_postN.png> <out folder> [post numbers...]
Writes <out>/<DATE>_post<n>_yt_thumb.jpg : the post image full-bleed, IMAGINE wordmark, maturity tag,
domain label and the hook in big capitals with cyan and amber highlight lines over a dark lower gradient."""
import json, os, sys
from PIL import Image, ImageDraw, ImageFont
F = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fonts', 'nunito-latin-800-normal.ttf')
T = lambda s: ImageFont.truetype(F, s)
NAVY = (6, 14, 30); WHITE = (242, 246, 255); CYAN = (102, 224, 255); AMBER = (255, 190, 92); MUTED = (176, 194, 226)
DATE, SRC, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
os.makedirs(OUT, exist_ok=True)
pk = json.load(open(os.path.join(SRC, f'{DATE}_package.json')))
want = [int(x) for x in sys.argv[4:]] or [p['n'] for p in pk['posts']]

def split_lines(d, words, maxw, size):
    lines, cur = [], ''
    for w in words:
        t = (cur + ' ' + w).strip()
        if d.textlength(t, font=T(size)) <= maxw: cur = t
        else: lines.append(cur); cur = w
    lines.append(cur); return [l for l in lines if l]

for p in pk['posts']:
    if p['n'] not in want: continue
    im = Image.open(os.path.join(SRC, p.get('image_file') or f"{DATE}_post{p['n']}.png")).convert('RGB')
    w, h = im.size; s = 1920 / h; im = im.resize((int(w * s), 1920), Image.LANCZOS)
    x0 = (im.width - 1080) // 2; im = im.crop((x0, 0, x0 + 1080, 1920)).convert('RGBA')
    ov = Image.new('RGBA', im.size); od = ImageDraw.Draw(ov)
    for y in range(900, 1920): od.line([(0, y), (1080, y)], fill=(*NAVY, min(235, int(235 * (y - 900) / 700))))
    im = Image.alpha_composite(im, ov); d = ImageDraw.Draw(im)
    d.text((64, 70), 'I M A G I N E', font=T(44), fill=WHITE)
    tag = '[' + p.get('reel', {}).get('tag', p.get('type', 'TODAY')) + ']'; f = T(34); tw = d.textlength(tag, font=f)
    d.rounded_rectangle((1016 - tw - 36, 66, 1016, 128), 31, fill=CYAN); d.text((1016 - tw - 18, 74), tag, font=f, fill=NAVY)
    hook = p['hook'].rstrip('.').upper(); words = hook.split()
    size = 150
    while True:
        lines = split_lines(d, words, 952, size)
        if (len(lines) <= 4 and max(d.textlength(l, font=T(size)) for l in lines) <= 952) or size <= 84: break
        size -= 6
    cols = [WHITE] * len(lines)
    if len(lines) >= 2: cols[-1] = AMBER
    if len(lines) >= 3: cols[1] = CYAN
    elif len(lines) == 2: cols[0] = CYAN
    lh = int(size * 1.02); y = 1880 - len(lines) * lh - 90
    d.text((64, y - 70), p.get('domain', '').upper(), font=T(40), fill=MUTED)
    for l, c in zip(lines, cols):
        d.text((68, y + 6), l, font=T(size), fill=(0, 0, 0, 170)); d.text((64, y), l, font=T(size), fill=c); y += lh
    out = os.path.join(OUT, f"{DATE}_post{p['n']}_yt_thumb.jpg"); im.convert('RGB').save(out, quality=90)
    print(out, os.path.getsize(out))
