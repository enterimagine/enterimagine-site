"""IMAGINE Kids daily episodes: helper for the scheduled episode task.

Run from the repository root on the kids-test branch.

  python3 episodes/tools/epi.py next              which worlds to make today (prints JSON)
  python3 episodes/tools/epi.py check  <id>       validate episodes/drafts/<id>.json
  python3 episodes/tools/epi.py jobs   <id> ...   add the voice lines of these drafts to voices/jobs.json
                                                  and write voices/only.txt (push to start kids-voices)
  python3 episodes/tools/epi.py images <id> <jpg1> ... <jpg6>
                                                  convert the 6 Flow pictures to app/episodes/<id>/s1..s6.webp
  python3 episodes/tools/epi.py publish <id> [clips_dir]
                                                  copy the voices (if given and complete), add the episode to
                                                  app/episodes/library.json, move the draft to episodes/done/
  python3 episodes/tools/epi.py voices <id> <clips_dir>
                                                  add voices later to an episode that was published without them
"""
import json, os, re, shutil, sys, datetime

ROOT = os.getcwd()
DRAFTS = os.path.join(ROOT, 'episodes', 'drafts')
DONE = os.path.join(ROOT, 'episodes', 'done')
APP = os.path.join(ROOT, 'app', 'episodes')
LIB = os.path.join(APP, 'library.json')
LANGS = ['en', 'fr', 'nl']

WORLDS = {
    'pixel':      {'guide': 'Pixel', 'name': {'en': 'AI & Data', 'fr': 'IA et données', 'nl': 'AI en data'}},
    'qubi':       {'guide': 'Qubi',  'name': {'en': 'Quantum', 'fr': 'Quantique', 'nl': 'Quantum'}},
    'bloom':      {'guide': 'Bloom', 'name': {'en': 'Biotech', 'fr': 'Biotech', 'nl': 'Biotech'}},
    'robo':       {'guide': 'Pixel', 'name': {'en': 'Robotics', 'fr': 'Robotique', 'nl': 'Robotica'}},
    'energy':     {'guide': 'Sunny', 'name': {'en': 'Energy', 'fr': 'Énergie', 'nl': 'Energie'}},
    'space':      {'guide': 'Qubi',  'name': {'en': 'Space', 'fr': 'Espace', 'nl': 'Ruimte'}},
    'mobility':   {'guide': 'Sunny', 'name': {'en': 'Smart Mobility', 'fr': 'Mobilité', 'nl': 'Slimme mobiliteit'}},
    'cities':     {'guide': 'Pixel', 'name': {'en': 'Smart Cities', 'fr': 'Villes intelligentes', 'nl': 'Slimme steden'}},
    'innovation': {'guide': 'Whyzz', 'name': {'en': 'Innovation', 'fr': 'Innovation', 'nl': 'Innovatie'}},
}
GROUPS = {'A': ['pixel', 'qubi', 'bloom', 'robo', 'energy'], 'B': ['space', 'mobility', 'cities', 'innovation']}
# Azure voice and pitch per character and language (same as the existing episodes).
VOICE = {
    'Whyzz': {'en': ('en-US-AndrewNeural', '+12%'), 'fr': ('fr-BE-GerardNeural', '+12%'), 'nl': ('nl-BE-ArnaudNeural', '+12%')},
    'Qubi':  {'en': ('en-US-BrianNeural', '+10%'), 'fr': ('fr-FR-HenriNeural', '+10%'), 'nl': ('nl-NL-MaartenNeural', '+10%')},
    'Pixel': {'en': ('en-US-AnaNeural', '+0%'), 'fr': ('fr-FR-EloiseNeural', '+0%'), 'nl': ('nl-NL-FennaNeural', '+8%')},
    'Sunny': {'en': ('en-US-AvaNeural', '+0%'), 'fr': ('fr-BE-CharlineNeural', '+0%'), 'nl': ('nl-BE-DenaNeural', '+0%')},
    'Bloom': {'en': ('en-US-ChristopherNeural', '+12%'), 'fr': ('fr-FR-AlainNeural', '+12%'), 'nl': ('nl-NL-MaartenNeural', '+18%')},
}

def load_lib():
    if os.path.exists(LIB):
        return json.load(open(LIB, encoding='utf-8'))
    return {'episodes': []}

def save_lib(lib):
    os.makedirs(APP, exist_ok=True)
    json.dump(lib, open(LIB, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    open(LIB, 'a').write('\n')

def die(msg):
    sys.exit('ERROR: ' + msg)

def tri(o, where, maxlen=None):
    if not isinstance(o, dict) or any(not isinstance(o.get(l), str) or not o[l].strip() for l in LANGS):
        die(f'{where}: needs non-empty en, fr and nl text')
    if maxlen:
        for l in LANGS:
            if len(o[l]) > maxlen: die(f'{where}.{l}: longer than {maxlen} characters')

def trilist(o, where, n=None):
    if not isinstance(o, dict): die(f'{where}: needs en, fr and nl lists')
    lens = set()
    for l in LANGS:
        v = o.get(l)
        if not isinstance(v, list) or not v or any(not isinstance(x, str) or not x.strip() for x in v): die(f'{where}.{l}: needs a list of texts')
        lens.add(len(v))
    if len(lens) != 1: die(f'{where}: en, fr and nl lists must have the same length')
    if n and lens.pop() not in (n if isinstance(n, (list, tuple, range)) else [n]): die(f'{where}: wrong number of items')

def check(d):
    for k in ['id', 'world', 'guide', 'title', 'scenes', 'quiz', 'game', 'prompts']:
        if k not in d: die('missing field ' + k)
    if not re.fullmatch(r'[a-z]+-\d{8}', d['id']): die('id must look like <world>-<yyyymmdd>, e.g. qubi-20261106')
    if d['world'] not in WORLDS or not d['id'].startswith(d['world'] + '-'): die('unknown world or id does not start with the world')
    if d['guide'] != WORLDS[d['world']]['guide']: die('guide must be ' + WORLDS[d['world']]['guide'])
    tri(d['title'], 'title', 90)
    sc = d['scenes']
    if len(sc) != 6: die('need exactly 6 scenes')
    for i, s in enumerate(sc):
        if s.get('speaker') not in VOICE: die(f'scene {i+1}: speaker must be one of ' + ', '.join(VOICE))
        tri({l: s.get(l) for l in LANGS}, f'scene {i+1}', 260)
        if not isinstance(s.get('img'), str) or not s['img'].strip(): die(f'scene {i+1}: needs img (short English picture description)')
    if len(d['prompts']) != 6 or any(not isinstance(p, str) or len(p) < 60 for p in d['prompts']): die('need 6 full Flow prompts')
    q = d['quiz']
    if len(q) != 5: die('need exactly 5 quiz questions')
    for i, x in enumerate(q):
        tri(x.get('q'), f'quiz {i+1}.q', 140); trilist(x.get('o'), f'quiz {i+1}.o', 3)
        if x.get('ok') not in (0, 1, 2): die(f'quiz {i+1}: ok must be 0, 1 or 2')
    oks = [x['ok'] for x in q]
    if len(set(oks)) == 1: die('quiz: the right answer must not always be in the same place')
    g = d['game']; t = g.get('type')
    for k in ['title', 'intro', 'done']: tri(g.get(k), 'game.' + k)
    if t == 'order': trilist(g.get('items'), 'game.items', range(4, 7))
    elif t == 'pick':
        trilist(g.get('items'), 'game.items', range(5, 9))
        n = len(g['items']['en']); good = g.get('good')
        if not isinstance(good, list) or not good or any(not isinstance(i, int) or i < 0 or i >= n for i in good) or len(good) == n: die('game.good: list of the right item numbers (0-based), not all items')
    elif t == 'match':
        trilist(g.get('left'), 'game.left', range(3, 6)); trilist(g.get('right'), 'game.right', range(3, 6))
        if len(g['left']['en']) != len(g['right']['en']): die('game.left and game.right must be equally long (pairs by position)')
    else: die('game.type must be order, pick or match')
    blob = json.dumps(d, ensure_ascii=False)
    for bad in ['NIO', 'IonQ', 'http://', 'https://', '<', '>']:
        if bad in blob: die('text must not contain ' + bad)
    return True

def draft(i):
    p = os.path.join(DRAFTS, i + '.json')
    if not os.path.exists(p): die('no draft ' + p)
    return json.load(open(p, encoding='utf-8'))

def cmd_next():
    lib = load_lib(); today = datetime.date.today().strftime('%Y%m%d')
    per = {w: 0 for w in WORLDS}
    for e in lib['episodes']: per[e['world']] = per.get(e['world'], 0) + 1
    made_today = [e['id'] for e in lib['episodes'] if e['id'].endswith('-' + today)]
    drafts = sorted(f[:-5] for f in os.listdir(DRAFTS) if f.endswith('.json')) if os.path.isdir(DRAFTS) else []
    a = sum(per[w] for w in GROUPS['A']) / len(GROUPS['A']); b = sum(per[w] for w in GROUPS['B']) / len(GROUPS['B'])
    grp = 'A' if a <= b else 'B'
    titles = {w: [e['title']['en'] for e in lib['episodes'] if e['world'] == w] for w in WORLDS}
    no_voice = [e['id'] for e in lib['episodes'] if not e.get('voice')]
    print(json.dumps({'today': today, 'group': grp, 'worlds': GROUPS[grp], 'ids': [f'{w}-{today}' for w in GROUPS[grp]],
                      'already_published_today': made_today, 'open_drafts': drafts, 'published_without_voices': no_voice,
                      'episodes_per_world': per, 'titles_so_far': titles}, ensure_ascii=False, indent=1))

def cmd_check(i):
    check(draft(i)); print('ok', i)

def cmd_jobs(ids):
    jf = os.path.join(ROOT, 'voices', 'jobs.json'); jobs = json.load(open(jf, encoding='utf-8'))
    byid = {j['id']: j for j in jobs}; only = []
    for i in ids:
        d = draft(i); check(d)
        for n, s in enumerate(d['scenes'], 1):
            for l in LANGS:
                v, p = VOICE[s['speaker']][l]; jid = f'{i}-{l}-{n}'
                byid[jid] = {'id': jid, 'voice': v, 'pitch': p, 'text': s[l]}; only.append(jid)
    json.dump(list(byid.values()), open(jf, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    open(os.path.join(ROOT, 'voices', 'only.txt'), 'w').write('\n'.join(only) + '\n')
    print('voice jobs:', len(only))

def cmd_images(i, files):
    from PIL import Image
    if len(files) != 6: die('give 6 pictures, scene 1 to 6')
    out = os.path.join(APP, i); os.makedirs(out, exist_ok=True)
    for n, f in enumerate(files, 1):
        im = Image.open(f).convert('RGB')
        w, h = im.size; th = round(w * 714 / 1280)
        if h > th: top = (h - th) // 2; im = im.crop((0, top, w, top + th))
        im.resize((1280, 714), Image.LANCZOS).save(os.path.join(out, f's{n}.webp'), 'WEBP', quality=80)
    print('pictures ok', out)

def copy_voices(i, clips):
    out = os.path.join(APP, i); n_ok = 0
    for n in range(1, 7):
        for l in LANGS:
            src = os.path.join(clips, f'{i}-{l}-{n}.webm')
            if os.path.exists(src) and os.path.getsize(src) > 2000:
                shutil.copy(src, os.path.join(out, f'{l}-{n}.webm')); n_ok += 1
    return n_ok == 18

def cmd_publish(i, clips=None):
    d = draft(i); check(d)
    out = os.path.join(APP, i)
    for n in range(1, 7):
        if not os.path.exists(os.path.join(out, f's{n}.webp')): die(f'picture s{n}.webp missing in {out}')
    voice = bool(clips) and copy_voices(i, clips)
    e = {k: d[k] for k in ['id', 'world', 'guide', 'title', 'scenes', 'quiz', 'game']}
    e['worldName'] = WORLDS[d['world']]['name']
    e['adult'] = d.get('adult') or {'en': f"For grown-ups: the {WORLDS[d['world']]['name']['en']} world in the IMAGINE Scientific Universe",
                                     'fr': f"Pour les adultes : le monde {WORLDS[d['world']]['name']['fr']} dans l’IMAGINE Scientific Universe",
                                     'nl': f"Voor volwassenen: de wereld {WORLDS[d['world']]['name']['nl']} in het IMAGINE Scientific Universe"}
    e['added'] = datetime.date.today().isoformat(); e['voice'] = voice
    lib = load_lib(); lib['episodes'] = [x for x in lib['episodes'] if x['id'] != i] + [e]; save_lib(lib)
    os.makedirs(DONE, exist_ok=True); shutil.move(os.path.join(DRAFTS, i + '.json'), os.path.join(DONE, i + '.json'))
    print('published', i, 'voices' if voice else 'WITHOUT voices')

def cmd_voices(i, clips):
    lib = load_lib(); e = next((x for x in lib['episodes'] if x['id'] == i), None)
    if not e: die('not in library: ' + i)
    if not copy_voices(i, clips): die('not all 18 clips found for ' + i)
    e['voice'] = True; save_lib(lib); print('voices added', i)

if __name__ == '__main__':
    a = sys.argv[1:]
    if not a: print(__doc__); sys.exit(0)
    c = a[0]
    if c == 'next': cmd_next()
    elif c == 'check': [cmd_check(i) for i in a[1:]]
    elif c == 'jobs': cmd_jobs(a[1:])
    elif c == 'images': cmd_images(a[1], a[2:])
    elif c == 'publish': cmd_publish(a[1], a[2] if len(a) > 2 else None)
    elif c == 'voices': cmd_voices(a[1], a[2])
    else: print(__doc__); sys.exit(1)
