"""IMAGINE Kids: make the daily Instagram Reel for the episodes added on one day.

Run from the repository root on the kids-test branch, after `epi.py publish`.

  python3 episodes/tools/reel.py <yyyymmdd> <out_dir>

Writes <out_dir>/kids-<yyyymmdd>.mp4 (1080x1920, H.264/AAC, about 30-50 s), kids-<yyyymmdd>.jpg
(cover) and kids-<yyyymmdd>.txt (the Instagram caption). The files are not part of the site:
they go to the social-assets branch (see episodes/README.md). Needs ffmpeg, Pillow, fontTools and brotli.
"""
import io, json, os, subprocess, sys, textwrap
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = os.getcwd()
APP = os.path.join(ROOT, 'app', 'episodes')
FONTS = os.path.join(ROOT, 'app', 'lib', 'fonts')
W, H, FPS = 1080, 1920, 30
NAVY = (8, 18, 38)
YELLOW = (255, 216, 76)
ACCENT = {'energy': '#ffb84c', 'space': '#8fb2ff', 'mobility': '#ffd84c', 'cities': '#3fd6c6', 'innovation': '#ff8ad8',
          'bloom': '#7ee08a', 'robo': '#ff9a4c', 'pixel': '#4cc3ff', 'qubi': '#b98cff'}
SITE = 'kids.enterimagine.com'


def font(name, size):
    """Load a site web font (woff2) as a Pillow font; fall back to DejaVu."""
    try:
        try:
            import brotli  # noqa: F401
        except ImportError:
            subprocess.run([sys.executable, '-m', 'pip', 'install', '-q', '--break-system-packages', 'brotli'], check=True)
        from fontTools.ttLib import TTFont
        f = TTFont(os.path.join(FONTS, name)); f.flavor = None
        b = io.BytesIO(); f.save(b); b.seek(0)
        return ImageFont.truetype(b, size)
    except Exception:
        return ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', size)


def hexrgb(h):
    return tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))


def dur(path):
    r = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path], capture_output=True, text=True)
    try: return float(r.stdout.strip())
    except ValueError:  # webm clips often have no duration in the header: decode and count
        pcm = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-f', 's16le', '-ac', '1', '-ar', '16000', '-'], capture_output=True).stdout
        return len(pcm) / 32000


def centered(d, y, text, f, fill, maxw=W - 140, gap=10):
    lines = []
    for para in text.split('\n'):
        words, cur = para.split(), ''
        for w in words:
            t = (cur + ' ' + w).strip()
            if d.textlength(t, font=f) <= maxw: cur = t
            else: lines.append(cur); cur = w
        lines.append(cur)
    for ln in lines:
        bb = d.textbbox((0, 0), ln, font=f)
        d.text(((W - (bb[2] - bb[0])) / 2 - bb[0], y), ln, font=f, fill=fill)
        y += (bb[3] - bb[1]) + gap + f.size * 0.25
    return y


def bg_from(img):
    b = img.resize((int(H * img.width / img.height), H)).crop((0, 0, W, H)) if img.width / img.height > W / H else img.resize((W, int(W * img.height / img.width)))
    b = b.crop(((b.width - W) // 2, (b.height - H) // 2, (b.width - W) // 2 + W, (b.height - H) // 2 + H)).filter(ImageFilter.GaussianBlur(40))
    return Image.blend(b, Image.new('RGB', (W, H), NAVY), 0.55)


def rounded(img, r=42):
    m = Image.new('L', img.size, 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, img.width, img.height), r, fill=255)
    return img, m


def main(day, OUT):
    lib = json.load(open(os.path.join(APP, 'library.json'), encoding='utf-8'))['episodes']
    eps = [e for e in lib if e['id'].endswith('-' + day)]
    if not eps: sys.exit('ERROR: no published episodes for ' + day)
    os.makedirs(OUT, exist_ok=True)
    fTitle, fBig, fMid, fSmall = font('baloo-2-latin-800-normal.woff2', 76), font('baloo-2-latin-800-normal.woff2', 110), font('nunito-latin-800-normal.woff2', 46), font('nunito-latin-700-normal.woff2', 38)

    segs = []  # (kind, seconds, data)
    segs.append(('intro', 2.8, None))
    for e in eps:
        clip = os.path.join(APP, e['id'], 'en-1.webm')
        has = e.get('voice') and os.path.exists(clip)
        segs.append(('ep', (dur(clip) + 0.8) if has else 4.5, (e, clip if has else None)))
    segs.append(('outro', 3.4, None))

    pics = {e['id']: Image.open(os.path.join(APP, e['id'], 's1.webp')).convert('RGB') for e in eps}
    first = pics[eps[0]['id']]

    # Static layers per segment; the moving part is a slow zoom of the picture.
    def intro_frame():
        im = bg_from(first); d = ImageDraw.Draw(im)
        y = 640
        bb = d.textbbox((0, 0), 'IMAGINE KIDS', font=fBig); x = (W - (bb[2] - bb[0])) / 2 - bb[0]
        d.text((x, y), 'IMAGINE ', font=fBig, fill='white'); d.text((x + d.textlength('IMAGINE ', font=fBig), y), 'KIDS', font=fBig, fill=YELLOW)
        y = centered(d, y + 170, f"{len(eps)} new episode{'s' if len(eps) > 1 else ''} today!", fTitle, 'white')
        centered(d, y + 30, 'Science stories for ages 8 to 12', fMid, (201, 214, 242))
        return im

    def outro_frame():
        im = bg_from(pics[eps[-1]['id']]); d = ImageDraw.Draw(im)
        y = centered(d, 640, 'Watch the stories, take the quiz and play the game', fTitle, 'white')
        y = centered(d, y + 40, 'Free · English · Français · Nederlands', fMid, (201, 214, 242))
        d.rounded_rectangle((120, y + 60, W - 120, y + 190), 65, fill=YELLOW)
        centered(d, y + 82, SITE, fMid, (26, 19, 0))
        return im

    def ep_layers(e, k, n):
        pic = pics[e['id']]; base = bg_from(pic); d = ImageDraw.Draw(base)
        acc = hexrgb(ACCENT.get(e['world'], '#ffd84c'))
        label = f"{e['worldName']['en']} · {k} / {n}".upper()
        tw = d.textlength(label, font=fSmall)
        d.rounded_rectangle(((W - tw) / 2 - 34, 300, (W + tw) / 2 + 34, 372), 36, fill=acc)
        d.text(((W - tw) / 2, 310), label, font=fSmall, fill=(11, 21, 48))
        y = centered(d, 1050, e['title']['en'], fTitle, 'white')
        centered(d, y + 20, 'New episode with quiz and game', fSmall, (201, 214, 242))
        return base, pic

    frames_spec = []
    n = len(eps)
    for kind, secs, data in segs:
        if kind == 'intro': frames_spec.append(('static', intro_frame(), int(secs * FPS)))
        elif kind == 'outro': frames_spec.append(('static', outro_frame(), int(secs * FPS)))
        else:
            k = eps.index(data[0]) + 1
            base, pic = ep_layers(data[0], k, n); frames_spec.append(('zoom', (base, pic), int(secs * FPS)))

    mp4 = os.path.join(OUT, 'kids-' + day + '.mp4'); silent = os.path.join(OUT, 'kids-' + day + '.v.mp4')
    p = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                          '-c:v', 'libx264', '-preset', 'medium', '-crf', '23', '-pix_fmt', 'yuv420p', silent], stdin=subprocess.PIPE)
    PW = W - 100; PH = round(PW * 9 / 16); PY = 430
    cover = None
    for kind, data, nf in frames_spec:
        for i in range(nf):
            if kind == 'static':
                fr = data
            else:
                base, pic = data; z = 1.0 + 0.08 * i / max(1, nf - 1)
                cw, ch = pic.width / z, pic.height / z
                crop = pic.crop(((pic.width - cw) / 2, (pic.height - ch) / 2, (pic.width + cw) / 2, (pic.height + ch) / 2)).resize((PW, PH))
                fr = base.copy(); img, m = rounded(crop); fr.paste(img, (50, PY), m)
                if cover is None and i == nf // 2: cover = fr.copy()
            p.stdin.write(fr.tobytes())
    p.stdin.close(); p.wait()
    if p.returncode: sys.exit('ERROR: ffmpeg video failed')

    # Audio: silence for the intro, Whyzz's opening question for each episode, silence for the outro.
    parts, filt = [], []
    for kind, secs, data in segs:
        if kind == 'ep' and data[1]:
            parts += ['-i', data[1]]
            filt.append(f'[{len(filt)}:a]aresample=48000,aformat=channel_layouts=stereo,apad=pad_dur=0.8,atrim=0:{secs:.3f}[a{len(filt)}]')
        else:
            parts += ['-f', 'lavfi', '-t', f'{secs:.3f}', '-i', 'anullsrc=r=48000:cl=stereo']
            filt.append(f'[{len(filt)}:a]anull[a{len(filt)}]')
    cat = ''.join(f'[a{i}]' for i in range(len(filt))) + f'concat=n={len(filt)}:v=0:a=1[aout]'
    r = subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', silent] + parts +
                       ['-filter_complex', ';'.join(f.replace(f'[{i}:a]', f'[{i + 1}:a]') for i, f in enumerate(filt)) + ';' + cat,
                        '-map', '0:v', '-map', '[aout]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '128k', '-shortest', '-movflags', '+faststart', mp4])
    os.remove(silent)
    if r.returncode: sys.exit('ERROR: ffmpeg audio failed')
    (cover or intro_frame()).save(os.path.join(OUT, 'kids-' + day + '.jpg'), 'JPEG', quality=88)

    lines = [f"{len(eps)} new IMAGINE Kids episode{'s' if len(eps) > 1 else ''} just landed! Short science stories for ages 8 to 12, each with a quiz and a game.", '']
    lines += [f"{e['worldName']['en']}: {e['title']['en']}" for e in eps]
    lines += ['', f'Watch free in English, French and Dutch at {SITE} (link in bio).', '',
              f"FR · Nouveaux épisodes : {' · '.join(e['title']['fr'] for e in eps)}", '',
              f"NL · Nieuwe afleveringen: {' · '.join(e['title']['nl'] for e in eps)}", '',
              '#scienceforkids #STEM #kidslearning #curiouskids #IMAGINEKids']
    open(os.path.join(OUT, 'kids-' + day + '.txt'), 'w', encoding='utf-8').write('\n'.join(lines) + '\n')
    print('reel ok', mp4, f'{dur(mp4):.1f}s', f'{os.path.getsize(mp4) / 1e6:.1f} MB')


if __name__ == '__main__':
    if len(sys.argv) != 3: print(__doc__); sys.exit(0)
    main(sys.argv[1], os.path.abspath(sys.argv[2]))
