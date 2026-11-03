# IMAGINE Kids – test site (branch `kids-test`)

Test build of IMAGINE Kids for family testing on laptop, phone and tablet.
Deployed by `.github/workflows/kids-test.yml` to a separate preview environment of the Azure Static Web App;
enterimagine.com itself is not changed. Every deploy waits for the owner's approval in GitHub.

- No accounts, cookies, analytics or third-party content; fonts are self-hosted (SIL OFL, see `app/lib/fonts`).
- Pages are marked `noindex` and robots.txt disallows crawling.
- `app/lib/morphdom.min.js` is MIT-licensed (see `app/lib/morphdom-LICENSE.txt`).
