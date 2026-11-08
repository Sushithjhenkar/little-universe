# ♡ Some Bonds Stay Golden

An animated, mobile-first birthday story with a sunshine-yellow design, memories, and a private launch plan. This repository contains **presentation code and generic placeholders only**. Personal photos and private memories are **not** included.

## Live website
https://little-universe.sushithjhenkar.workers.dev/

## What's included
- Cinematic hero with lightweight CSS 3D planet and orbit effects
- Ambient starfield and responsive, scroll-scrubbed 3D memory helix
- Personal four-question birthday quiz: meeting in college, first message, an optional private reflection, and a cheeky optional question
- Protected-media-ready portrait background; the actual private photos are not in GitHub
- Animated, mobile-friendly video film reels with an accessible playback dialog
- Warm friendship-and-relationship aesthetic, a gentle birthday letter, an animated gift envelope and confetti
- Continuous background soundtrack using the original SoundCloud upload of **Neene Yendigu** by Nihal Tauro, with click/tap-to-enable fallback and infinite repeat
- Reduced-motion support, lazy loaded media and transform-based UI animation

## Background song, browser autoplay and copyright

The music source is the original SoundCloud upload by Nihal Tauro:
https://soundcloud.com/nihaltauro/love-you-chinna

The site loads SoundCloud's official **audio-only widget** in the background on entry, tries to start playback, and uses SoundCloud's Widget API `FINISH` event to rewind and repeat the track. The visitor can pause/resume from the compact music panel. **Closing the music panel does not stop playback.**

Browsers (especially iOS Safari and Android Chrome) frequently prevent audible autoplay on a fresh page. If autoplay is blocked, the code tries playback during the visitor's **first tap anywhere** (including tapping the “Begin the journey” link), requiring no separate “play song” tap. A manual pause/resume control is provided if needed. A browser, SoundCloud, or the device can still interrupt playback; truly guaranteed sound on page load is not possible.

The copyrighted recording is not downloaded, copied, bundled, or re-hosted. The page retains a visible attribution link and an accessible expandable audio-only SoundCloud player.

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

## Sunshine birthday upgrade (November 2026)

- **Yellow / sunshine aesthetic:** cream, butter-yellow, honey-gold, and gentle blush accents replace the old space/stardust look. Mobile 3D memory timeline and SoundCloud music remain.
- **Personal memory quiz:** Q1 first met in 2019 at college; Q2 first chat was Happy Birthday / Thank You. Correct answers trigger a celebratory popup and floating flowers/hearts, while wrong options show a hint and allow retrying.
- **Q3:** optional on-page typed response (no skip button). It is **never read, collected, transmitted, or stored**. A fixed personal accountability/apology popup appears on Continue.
- **Q4:** both “Yes” and “Option A” are accepted as a joke. The discreet opt-out on this personal question remains.
- **Birthday cake:** a self-contained rotating three-tier CSS 3D cake with frosting, candles, swipe/drag rotation, a spin button, warm petals, off-screen performance pause, and reduced-motion support. No 3D CDN, audio asset, model asset, or raster cake image.
- **Gift:** the public preview uses a nonredeemable gift envelope; real Amazon.in gift code must be configured only in an encrypted secret on the authenticated Cloudflare Worker.
- **Privacy:** real memories are NOT published or included in GitHub. The secure-photo/video branch is staged but must be configured and reviewed before deployment.

### Still pending before the private birthday launch

1. Decide the final website name.
2. Choose a non-guessable magical-word entry phrase and configure the Cloudflare Worker credentials and rate limits.
3. Enable authenticated server-side media fetching for the selected Drive photos/videos; verify the Drive folder is restricted.
4. Purchase an eligible Amazon.in gift card and add its code only to the encrypted Cloudflare Worker secret, never the repo.
