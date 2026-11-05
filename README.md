# IMAGINE Kids — live site

This branch is the live IMAGINE Kids site at https://kids.enterimagine.com.

- `app/` is the built site (no build step on deploy).
- `api/` holds the privacy-friendly visit counter (Azure Functions).
- `.github/workflows/kids-live.yml` deploys on every push to this branch after the owner approves it in the production environment.

Changes are made and checked on the `kids-test` branch first.
