# IMAGINE — public website

This repository holds **only the approved public files** of [enterimagine.com](https://enterimagine.com).
The site's source lives in a separate private repository.

- `public/` — exactly the files that are served, nothing else.
- `release-manifest.json` — path, size and SHA-256 of every file, plus the private source commit it was built from.
- `.github/workflows/deploy.yml` — verifies `public/` against the manifest, **waits for the owner's approval**, deploys to Azure Static Web Apps, then checks the live site byte-for-byte.

Every change here is produced by the release process; do not edit files by hand.

© 2026 EnterImagine Media · EnterImagine.media@gmail.com
