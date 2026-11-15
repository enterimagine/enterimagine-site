#!/usr/bin/env python3
"""IMAGINE Instagram weekly report: tag each Instagram post of the week with its
technology domain and format, and write one JSON file of rows for the dashboard.

Usage:
  python3 ig_weekly.py WEEK_START WEEK_END MEDIA_JSON PACKAGES_DIR OUT_JSON

WEEK_START / WEEK_END: YYYY-MM-DD (inclusive, publish dates as Windsor reports them).
MEDIA_JSON: a Windsor get_data answer for connector instagram with the fields
  date, timestamp, media_id, media_permalink, media_caption, media_views, media_reach,
  media_like_count, media_comments_count, media_saved, media_shares,
  media_reel_avg_watch_time, media_reel_skip_rate
PACKAGES_DIR: folder with the daily YYYY-MM-DD_package.json files (posts[].domain,
  posts[].description) used to look up each post's domain.
"""
import json, re, sys, glob, os, statistics

week_start, week_end, media_path, pkg_dir, out_path = sys.argv[1:6]

raw = json.load(open(media_path))
rows = raw["data"] if isinstance(raw, dict) else raw


def norm(s):
    return re.sub(r"\W+", "", (s or "").lower())[:60]


# caption (normalized start) -> domain, from the daily packages
lookup = {}
for f in sorted(glob.glob(os.path.join(pkg_dir, "*_package.json"))):
    try:
        pk = json.load(open(f))
    except Exception:
        continue
    for p in pk.get("posts", []):
        if p.get("description"):
            lookup[norm(p["description"])] = p.get("domain")


def domain_of(caption):
    c = norm(caption)
    if c in lookup:
        return lookup[c]
    for k, v in lookup.items():
        if k[:30] == c[:30]:
            return v
    if "IMAGINE Kids" in (caption or ""):
        return "IMAGINE Kids"
    return "Other"


def num(x):
    try:
        return float(x)
    except (TypeError, ValueError):
        return 0.0


def hook(caption):
    first = (caption or "").strip().split("\n")[0]
    first = re.sub(r"^\[\w+\]\s*", "", first)
    first = re.sub(r"[\U0001F000-\U0001FFFF☀-➿️]", "", first).strip()
    return first if len(first) <= 90 else first[:87].rstrip() + "..."


def hook_type(h):
    hl = h.lower()
    if hl.startswith(("what if", "imagine")):
        return "What if / Imagine"
    if "?" in h:
        return "Question"
    return "Statement"


out = []
for r in rows:
    d = (r.get("date") or "")[:10]
    if not (week_start <= d <= week_end):
        continue
    cap = r.get("media_caption") or ""
    m = re.match(r"\[(\w+)\]", cap)
    likes, comments = num(r.get("media_like_count")), num(r.get("media_comments_count"))
    saves, shares = num(r.get("media_saved")), num(r.get("media_shares"))
    views, reach = num(r.get("media_views")), num(r.get("media_reach"))
    inter = likes + comments + saves + shares
    skip = r.get("media_reel_skip_rate")
    watch = r.get("media_reel_avg_watch_time")
    out.append({
        "media_id": str(r.get("media_id")),
        "date": d,
        "posted_at": r.get("timestamp"),
        "domain": domain_of(cap),
        "format": m.group(1) if m else ("KIDS" if "IMAGINE Kids" in cap else "OTHER"),
        "hook": hook(cap),
        "hook_type": hook_type(hook(cap)) if m else "Not tagged",
        "hook_has_number": bool(re.search(r"\d", hook(cap))),
        "hook_says_you": bool(re.search(r"\byou(r)?\b", hook(cap), re.I)),
        "hook_words": len(hook(cap).split()),
        "permalink": r.get("media_permalink"),
        "views": int(views),
        "reach": int(reach),
        "likes": int(likes),
        "comments": int(comments),
        "saves": int(saves),
        "shares": int(shares),
        "interactions": int(inter),
        "saves_shares": int(saves + shares),
        "saves_shares_per_1k_reach": round((saves + shares) / reach * 1000, 1) if reach else 0.0,
        "engagement_rate_pct": round(inter / reach * 100, 2) if reach else 0.0,
        "avg_watch_s": round(num(watch) / 1000, 1) if watch is not None else None,
        "skip_rate_pct": round(num(skip) * 100, 1) if skip is not None else None,
        "week_start": week_start,
        "week_end": week_end,
    })

out.sort(key=lambda x: (x["date"], x["posted_at"] or ""))
code = open(os.path.abspath(__file__)).read()
json.dump({
    "rows": out,
    "meta": [
        {"label": "ig_weekly.py", "value": code, "type": "code", "lang": "python"},
        {"label": "Input", "value": "Windsor.ai Instagram media for @enterimagine, %s to %s; domains from the daily packages" % (week_start, week_end)},
        {"label": "Interactions", "value": "likes + comments + saves + shares"},
    ],
}, open(out_path, "w"), indent=1)
print(len(out), "posts", sum(1 for x in out if x["domain"] in ("Other",)), "untagged")
