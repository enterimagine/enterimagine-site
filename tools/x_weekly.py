#!/usr/bin/env python3
"""IMAGINE X weekly report: turn the posts read from the @EnterImagine profile
into one JSON file of rows for the dashboard (report week and the week before).

Usage:
  python3 x_weekly.py WEEK_START WEEK_END SCRAPE_JSON PACKAGES_DIR OUT_JSON

SCRAPE_JSON: {"followers", "following", "rows": [{id, time, text, photo, card,
  views, likes, reposts, replies, bookmarks}]} as read from x.com/EnterImagine.
PACKAGES_DIR: folder with the daily YYYY-MM-DD_package.json files (optional
  matches: posts[].domain, posts[].x_text, posts[].hook).
"""
import json, re, sys, glob, os
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo

week_start, week_end, scrape_path, pkg_dir, out_path = sys.argv[1:6]
BXL = ZoneInfo("Europe/Brussels")
ROT = ["AI & Data", "Quantum Computing", "Energy", "Smart Mobility", "Smart Cities",
       "Biotech", "Robotics", "Space", "Innovation"]

sc = json.load(open(scrape_path))
d0 = datetime.fromisoformat(week_start).date()
prev_start = (d0 - timedelta(days=7)).isoformat()
prev_end = (d0 - timedelta(days=1)).isoformat()


def norm(s):
    return re.sub(r"\W+", "", (s or "").lower())[:50]


# package lookup: x_text start -> (domain, hook)
lookup = {}
for f in glob.glob(os.path.join(pkg_dir, "*_package.json")):
    try:
        pk = json.load(open(f))
    except Exception:
        continue
    for p in pk.get("posts", []):
        if p.get("x_text"):
            lookup[norm(p["x_text"])] = p.get("domain")

rows = []
for r in sc["rows"]:
    t = datetime.fromisoformat(r["time"].replace("Z", "+00:00"))
    lt = t.astimezone(BXL)
    r = dict(r, _t=t, date=lt.date().isoformat(), hour=lt.hour)
    txt = r.get("text") or ""
    r["is_reply"] = bool(re.match(r"^(Context|Update|Source)\b", txt))
    m = re.match(r"^\[(\w+)\]", txt)
    r["tag"] = m.group(1) if m else None
    rows.append(r)

own_reply_times = [r["_t"] for r in rows if r["is_reply"]]
main = [r for r in rows if not r["is_reply"]]

# rotation domain for the old 9-a-day format (posts ordered by time within the day)
by_day = {}
for r in main:
    if r["tag"]:
        by_day.setdefault(r["date"], []).append(r)
for day, rs in by_day.items():
    rs.sort(key=lambda x: x["_t"])
    n = (datetime.fromisoformat(day) - datetime(2026, 1, 1)).days
    for i, r in enumerate(rs):
        r["_rot"] = ROT[(3 * n + i // 3) % 9] if len(rs) <= 9 else None

out = []
for r in main:
    d = r["date"]
    if prev_start <= d <= prev_end:
        wk = "previous"
    elif week_start <= d <= week_end:
        wk = "current"
    else:
        continue
    txt = r["text"]
    thread = any(timedelta(0) < (rt - r["_t"]) < timedelta(seconds=15) for rt in own_reply_times)
    replies = max(0, int(r["replies"]) - (1 if thread else 0))  # don't count our own source/context reply
    body = re.sub(r"^\[\w+\]\s*", "", txt)
    first = re.split(r"(?<=[.?!])\s", body)[0]
    if r["tag"] is None:
        kind = "Episode promo" if re.search(r"episode", txt, re.I) else "Other"
        domain = kind
    else:
        kind = "Daily post"
        domain = lookup.get(norm(txt)) or r.get("_rot") or "Other"
    has_link = bool(re.search(r"https?://|\b\w+\.(com|org|gov|edu|io|net)\b", txt))
    if r.get("photo") and not has_link:
        fmt = "Image, link in reply"
    elif has_link:
        fmt = "Link in post"
    else:
        fmt = "Text only"
    inter = int(r["likes"]) + int(r["reposts"]) + replies + int(r["bookmarks"])
    views = int(r["views"])
    out.append({
        "id": r["id"], "url": "https://x.com/EnterImagine/status/" + r["id"],
        "date": d, "hour": r["hour"], "week": wk, "week_start": week_start, "week_end": week_end,
        "kind": kind, "domain": domain, "tag": r["tag"] or "", "format": fmt,
        "hook": first[:100], "hook_type": ("What if / Imagine" if re.match(r"(what if|imagine|picture)", first, re.I)
                                           else "Question" if "?" in first else "Statement"),
        "views": views, "likes": int(r["likes"]), "reposts": int(r["reposts"]),
        "replies": replies, "bookmarks": int(r["bookmarks"]), "interactions": inter,
        "interactions_per_1k_views": round(inter / views * 1000, 1) if views else 0.0,
    })

out.sort(key=lambda x: (x["date"], x["hour"]))
code = open(os.path.abspath(__file__)).read()
json.dump({"rows": out, "meta": [
    {"label": "x_weekly.py", "value": code, "type": "code", "lang": "python"},
    {"label": "Input", "value": "Posts read from x.com/EnterImagine (own posts, not reposts) on %s; followers %s" % (sc.get("scraped_at", "?"), sc.get("followers"))},
    {"label": "Interactions", "value": "likes + reposts + replies (not counting our own source/context reply) + bookmarks"},
]}, open(out_path, "w"), indent=1)
print(len(out), "rows;", sum(1 for x in out if x["week"] == "current"), "this week")
