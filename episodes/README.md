# IMAGINE Kids: daily episodes

The scheduled task "IMAGINE Kids daily episodes" follows this file. Each run makes one new episode for each world in today's group, and the two groups alternate:

- Group A: `pixel` (AI & Data), `qubi` (Quantum), `bloom` (Biotech), `robo` (Robotics), `energy` (Energy)
- Group B: `space` (Space), `mobility` (Smart Mobility), `cities` (Smart Cities), `innovation` (Innovation)

So every world gets a new episode every 2 days. `python3 episodes/tools/epi.py next` says which group is due and lists the titles made so far, so topics never repeat.

## Where things live (branch `kids-test`)

- `episodes/drafts/<id>.json`: the episode being made. The id is `<world>-<yyyymmdd>`, e.g. `qubi-20261106`.
- `episodes/done/<id>.json`: published drafts. They keep the Flow prompts.
- `app/episodes/library.json`: what the site shows. The Episodes page loads it and adds the episodes after the built-in one of each world.
- `app/episodes/<id>/s1.webp … s6.webp`: pictures. `en-1.webm … nl-6.webm`: voices.
- `voices/jobs.json`, `voices/only.txt`: voice lines. A push to `voices/**` starts the `kids-voices` workflow, which needs the owner's approval. After the run, the clips are on the branch `kids-voices-out` (folder `clips/`, files `<id>-<lang>-<n>.webm`).

Pushing `app/**` starts `kids-test`, which also needs approval. The live site is the branch `kids`, workflow `kids-live`, which needs approval too. For live, copy `app/episodes/` from `kids-test` into `app/episodes/` on `kids` and push. Change nothing else on `kids`.

## Rules for the content

- Ages 8 to 12, in English, French and Dutch. Use simple sentences and real, correct science. The tone is warm, curious and funny.
- Each episode has 6 scenes. In scene 1, Whyzz asks a question about everyday life. In scenes 2 to 5, the guide explains with a playful comparison, and one scene includes a "Did you know?" surprise fact. Whyzz makes one silly guess or joke. Scene 6 wraps up and ends with a question to the viewer ("What would you…?").
- Each scene line has at most 2 sentences and about 220 characters per language.
- The speakers are Whyzz plus the world's guide (the `guide` field). No other speakers: there are no voices for them.
- The quiz has 5 questions with 3 answers each. Only one answer is right, and the right answer is not always in the same place. Each question checks something said in the scenes.
- The game is one of:
  - `order`: 4 to 6 items, written in the correct order. The page shuffles them.
  - `pick`: 5 to 8 items, plus `good` (0-based numbers of the right ones).
  - `match`: 3 to 5 pairs, with `left[i]` belonging to `right[i]`. The page shuffles them.
- Vary the game type across the day's episodes.
- No real people's names, no brands, no companies, no web links, no advertising. Never mention NIO or IonQ. Nothing scary; dangers are explained calmly.
- US English, and no comma before "and". The owner reviews the FR and NL texts himself, so write natural French (France/Belgium) and Dutch (Netherlands/Flanders). Use "tu" and "je".

## Characters (always use these exact descriptions in the picture prompts)

- Whyzz: "Whyzz, a curious kid with a backwards grey-and-red cap and a red-and-navy jacket with a pink question-mark badge"
- Pixel: "Pixel, a cheerful 10-year-old girl with curly dark hair in two puffs, orange aviator goggles on her head, an orange-and-teal explorer jacket with a round glowing orange badge"
- Qubi: "Qubi, a friendly 10-year-old boy with swept brown hair and a blue-and-yellow tech jacket with a glowing atom badge"
- Bloom: "Bloom, a friendly 10-year-old boy with brown hair and round glasses, wearing a green explorer jacket with a glowing green DNA badge"
- Sunny: "Sunny, a confident 10-year-old girl with long dark braids, wearing a purple-and-silver suit with a glowing yellow lightning-bolt badge"

Each prompt ends with: `. 3D animated cartoon style, bright cheerful colors, soft cinematic lighting, child-friendly, wide 16:9 scene, no text, no letters, no words`

Put the characters who speak in the scene into its picture. Describe a clear, fun, concrete scene (setting, action, expressions). Never ask for text in the picture.

## Topic ideas (pick new ones; titles_so_far shows what was done)

- pixel (AI & Data): how a phone understands your voice, how maps find the fastest way, can a computer paint, why passwords must be secret, how apps guess what you like, spotting fake photos, how translation apps work
- qubi (Quantum): the coldest fridge in the world for qubits, superposition with a spinning coin, entanglement as "magic twin socks", how lasers work, atoms as tiny building blocks, quantum sensors finding things underground
- bloom (Biotech): how vaccines train your body like a fire drill, why bread rises (yeast), glowing jellyfish, yogurt bacteria helpers, DNA in a strawberry, how bees help plants, plants that clean water
- robo (Robotics): how a robot vacuum maps a room, robot arms building cars, rovers on Mars, robots that walk like dogs, a robot hand gently grabbing an egg, underwater robots, robots helping doctors
- energy (Energy): how solar panels turn light into electricity, wind turbines, batteries, water power, saving energy at home, heat pumps, where the electricity in the socket comes from
- space (Space): why the Moon changes shape, how rockets reach space, life on a space station, satellites and the weather, a trip to Mars, what a black hole is, why stars twinkle
- mobility (Smart Mobility): floating maglev trains, how planes fly, self-driving cars, delivery drones, hydrogen buses, bike-friendly cities, how a train knows when to stop
- cities (Smart Cities): smart streetlights, recycling sorting machines, vertical farms, trees that cool hot streets, smart traffic lights, a city that saves water, quiet roads
- innovation (Innovation): inventions made by accident, ideas copied from nature (burrs and hook-and-loop strips), kid inventors, 3D printing, testing and failing, teamwork, building a marble run

## Draft format (`episodes/drafts/<id>.json`)

```json
{
 "id": "qubi-20261106", "world": "qubi", "guide": "Qubi",
 "title": {"en": "...", "fr": "...", "nl": "..."},
 "scenes": [{"speaker": "Whyzz", "en": "...", "fr": "...", "nl": "...", "img": "short English description"}],
 "prompts": ["full Flow prompt for scene 1", "... 6 in total"],
 "quiz": [{"q": {"en": "...", "fr": "...", "nl": "..."}, "o": {"en": ["a", "b", "c"], "fr": [...], "nl": [...]}, "ok": 1}],
 "game": {"type": "pick", "title": {...}, "intro": {...}, "done": {...}, "items": {"en": [...], "fr": [...], "nl": [...]}, "good": [0, 2, 3]}
}
```

`python3 episodes/tools/epi.py check <id>` validates a draft. Fix every error it reports.

## Pictures in Google Flow (the browser pane on the owner's computer)

1. Open the project https://flow.google.com/project/36de4440-072d-4e9e-b969-5b934fc4a6df. Check the settings at the bottom of the prompt box: Nano Banana 2.1, Image, 16:9, x1.
2. For each prompt, focus the last `[contenteditable=true]`. With JavaScript, run `document.execCommand('selectAll')`, then `document.execCommand('delete')`, then `document.execCommand('insertText', false, prompt)`. Then press the Return key with the computer tool (clicking the send button does not submit). Wait about 1 second between prompts.
3. The newest picture is on top. When all are done, scroll the project's scroll container and collect `img` elements with `naturalWidth > 300`, sorted by position. The newest N pictures, reversed, are the prompts in the order you sent them.
4. Download each one in the page: run `fetch(src)` and turn the response into a blob. Create an `<a download>` link on a blob URL, then `click()`. The browser pane saves the file as `<uuid>.tmp` in `C:\Users\Adil\Downloads`. Note each blob's size.
5. List `C:\Users\Adil\Downloads` with the device tools. Stage the `.tmp` files whose sizes match, then map them to scenes by size. Convert them with `epi.py images <id> f1 … f6`.

Look at every picture before using it (for example on a contact sheet). If a character looks wrong or text appears in a picture, change the prompt and make that picture again.

## Release

Push to `kids-test` and then to `kids`. Both deploys wait for the owner's approval in GitHub. Never approve anything yourself.

## Daily Instagram Reel

After the day's episodes are live, one Reel announces them on Instagram (@enterimagine). The owner asked for this to be posted automatically.

1. Wait until the `kids-live` run for that day's push has finished with success (check it with the GitHub tools). The cloud workspace cannot open kids.enterimagine.com itself.
2. Make the Reel: `python3 episodes/tools/reel.py <yyyymmdd> <out_dir>`. It uses the day's episodes in `app/episodes/library.json`: an intro card, each episode's first picture and English title with Whyzz's opening question as sound, and an end card with the site address. It also writes the cover (`.jpg`) and the caption (`.txt`, English first, then short French and Dutch lines). Look at a few frames (for example `ffmpeg -ss 1`, `-ss 6`, the last second) to check that no text runs off the screen.
3. Host the files on the `social-assets` branch: copy `kids-<yyyymmdd>.mp4`, `.jpg` and `.txt` into `kids/<yyyymmdd>/`, commit and push. Public address: `https://raw.githubusercontent.com/enterimagine/enterimagine-site/social-assets/kids/<yyyymmdd>/<file>`.
4. Duplicate check: if `kids/<yyyymmdd>/posted.json` exists on `social-assets`, the Reel is already out; do not post again.
5. Post with Windsor: connector `instagram`, account `17841411993397601`, action `create_video_post`, with `video_url`, `cover_url`, `share_to_feed: true` and `caption` = the `.txt` text. Then write `kids/<yyyymmdd>/posted.json` (time and the result) on `social-assets` and push. Never retry a post that may already have gone out; report the error instead.
6. If the live deploy is not approved yet, do not post. A later run posts the waiting Reel once its episodes are live.
