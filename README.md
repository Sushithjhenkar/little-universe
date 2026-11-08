# ✦ A Little Universe Called You

An animated, mobile-first birthday experience deployed through Cloudflare. This repository contains **presentation code and generic placeholders only**. Personal photos and private memories are **not** included.

## Live website
https://little-universe.sushithjhenkar.workers.dev/

## What's included
- Cinematic hero with lightweight CSS 3D planet and orbit effects
- Ambient starfield and responsive, scroll-scrubbed 3D memory helix
- Photo gallery placeholders and secure-media-ready portrait background
- Animated, mobile-friendly video film reels with an accessible playback dialog
- Interactive birthday wishes, confetti and subtle visual depth effects
- Optional user-initiated official YouTube music player for **Neene Yendigu** from *Love Mocktail*
- Reduced-motion support, lazy loaded media and transform-based UI animation

## Music and copyright
The song is NOT downloaded, re-hosted or placed in the repository. The music button opens an embedded **official YouTube video** after a deliberate click. If embedding is blocked or a browser prevents autoplay, the panel links to the official video:
https://www.youtube.com/watch?v=9b1DrKv3MXo

## Private media: future phase
The static site contains an optional, inactive media API hook. **Do not attach media publicly yet**.

After Cloudflare Worker authentication is implemented, update the `<body>` tag with:

```html
<body data-media-api="/api/private/memories">
```

Once a valid authenticated browser session exists, that endpoint can return data shaped like:

```json
{
  "hero": { "url": "/api/private/media/hero" },
  "photos": [
    { "url": "/api/private/media/photo-1", "alt": "Memory", "caption": "A favorite moment" }
  ],
  "timeline": [
    { "url": "/api/private/media/timeline-1", "title": "A favorite moment", "caption": "Some days are worth replaying." }
  ],
  "videos": [
    { "url": "/api/private/media/video-1", "poster": "/api/private/media/poster-1", "title": "A little adventure" }
  ]
}
```

The frontend reads this only when configured, adds a full-page portrait backdrop, loads photo cards and timeline images, and enables video playback on card taps. It does not ship any Drive folder IDs, tokens, filenames or personal images.

## Access gate before photos / videos

**A private GitHub repository is NOT a password-protected website.** The current published URL is public.

Implement a Cloudflare Worker gate **before delivering** the HTML, JS, photos, video or media manifest. Suggested flow:
1. Request a magical word/passphrase on an entry page. A date alone is easily guessed—use a stronger phrase or combine it with something secret.
2. Verify it on the Worker using a hashed secret in Cloudflare environment secrets, not in browser JS or GitHub.
3. Rate-limit failed attempts, avoid revealing which part was correct, and set a short-lived, signed `HttpOnly; Secure; SameSite=Lax` session cookie.
4. Require a valid session at **every** private media/API route; no unauthenticated redirects to direct Google Drive file links.
5. Connect Drive via server-side OAuth or an explicitly shared folder, with refresh tokens stored only in Worker secrets. Serve videos with support for byte-range requests and consider a protected media cache for performance.
6. Apply `Cache-Control: private, no-store` to private JSON and sensitive responses. Check redirects, thumbnails, and cache paths for leakage.

Never publish an access answer, credential, bearer token, or Google Drive refresh token in the repository. The user supplies access and selects the actual secret later.

## Local preview
Open `index.html` in a browser or run:

```bash
python -m http.server 8000
```

The project has no build step or npm dependencies.

## Cloudflare deployment
If your Cloudflare project is connected to the `main` branch, pushing to `main` should trigger deployment. Verify the status from Cloudflare and refresh the public URL.

## Performance
Animation is mostly CSS 3D/transforms plus a scroll-driven requestAnimationFrame loop. Reduced-motion preferences are respected. Video files only load on click, and the YouTube iframe is created **only** if someone opens the player. Aim for modern AVIF/WebP posters and appropriately resized images when adding Drive media.
