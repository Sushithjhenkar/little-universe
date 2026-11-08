# A Little Universe Called You ✨

A cinematic, animated, mobile-first birthday experience.

## Preview
This is a static website. Open `index.html` locally or run `python -m http.server 8000` to preview.

## Features
Animated starfield, cinematic hero, scroll reveals, photo-gallery placeholders, story timeline, interactive star wishes and confetti celebration. Reduced-motion responsive support.

## Deployment with Cloudflare Pages
1. Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git.
2. Select **Sushithjhenkar/little-universe** and branch **main**.
3. Framework preset: **None** (static HTML).
4. Build command: **leave blank**. Build output directory: **/** (repository root) or the dashboard's root option.
5. Deploy. Cloudflare provides a `*.pages.dev` URL and can redeploy on future commits.

Do not upload personal photos until access control is configured for the deployed site. Cloudflare Access can restrict the website; a private GitHub repo alone does not restrict visitors to a published site. Google Drive OAuth credentials and refresh tokens must never be in this repository or browser-side JavaScript.

The sound UI is a placeholder (no audio plays). The gallery intentionally contains no personal photographs yet.