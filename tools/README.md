# IMAGINE daily Reels

`make_reels.py` turns a daily package from the Instagram Daily folder into 9:16 Reels:
the post image with a slow zoom, the package's slides and timing, and "Discovery" by Scott Buckley (CC BY 4.0) as music.

    python3 tools/make_reels.py 2026-11-06 "<folder with package, images and _music>" daily/2026-11-06 1 2 3 4 5 6 7 8 9

Needs Python with Pillow and ffmpeg. Fonts (Nunito, Baloo 2) are under the SIL Open Font License.

## Format v2 (from 2026-11-16)

A package Reel with `"format": "v2"` gets the new layout: slide 1 is the hook alone (no kicker, up to 3 big centered lines, visible from the first frame, about 2.5 s), the image moves from the first frame, there is no fade to black at the end (the Reel loops cleanly), and the cover is taken at 0.4 s. Slides 2-5 keep the standard layout; `kicker` is optional.
