# 💛 Some Bonds Stay Golden

An original, cinematic birthday website with a warm yellow-and-cream theme, romantic memories, 3D-style visuals, and interactive celebrations.

**Homepage:** `index.html` (the original scrolling experience).
**Live domain:** https://little-universe.sushithjhenkar.workers.dev/

## Included in the current `main` branch

- Animated yellow floral hero and soundtrack panel with official SoundCloud embed.
- Personal four-question birthday quiz, with celebratory feedback and optional private reflection.
- Smooth, scroll-controlled 3D memory timeline with 12 placeholder cards.
- Three video chapter placeholders, ready for protected media.
- Procedurally rendered rotating three-tier cake with candles.
- **Cut-the-cake interaction:** slice, candle transition, animated knife, confetti and reset.
- **Yellow flower bouquet:** pick five of seven blooms, watch the 3D-styled bouquet form, then present it.
- Final peaceful birthday note and an encrypted-secret-ready gift-card reveal.

## Important: No playable game

The character, avatar, joystick, movement/navigation game, and Golden Garden micro-world have been **fully retired from `main`**. The old `world.html`, `world.js`, `world.css`, `avatar.css` and `classic.html` were deleted. The requested experience is the original scroll-based website. Only the 3D memory timeline and celebratory interactions are retained.

## Privacy

**Do not upload photos, Google Drive file IDs, a passphrase, or a gift card code to this public repository.** The current site uses generic placeholder images. The private media gateway is separately staged in a protected-feature branch and needs Cloudflare secrets and Google Drive service-account access before it can be deployed.

SoundCloud audio playback on iOS and other browsers is subject to user-gesture autoplay restrictions; the music panel provides a user control.

## Deployment

Cloudflare's hosted worker/domain needs to serve the current `main/index.html` plus all CSS and JS files, including `celebration.css` and `celebration.js`.

**Pushing GitHub code does not prove Cloudflare deployed it.** In Cloudflare Workers & Pages, check the connected repository, production branch (`main`), build settings and latest Build History. An old live Worker deployment may keep showing the retired game until Cloudflare successfully deploys the new files.

Latest implementation is static HTML/CSS/JS; no personal media and no private access credentials are bundled in the public assets.
