# Private memories — staging plan

**Branch: `feature/private-memories-gate` (not the public production site).**

The existing public site continues to run using the `main` branch. Do not add actual photos, videos, a passphrase, or Google credentials to GitHub, including to this branch.

## What is ready

- A mobile-friendly **magical-word entry** served by a Cloudflare Worker.
- Signed `HttpOnly; Secure; SameSite=Lax` 8-hour session cookies.
- Worker checks authentication **before any static asset, manifest, photo, or video** request, via `assets.run_worker_first: true`.
- Private photo/video API with no public Google Drive IDs. The Worker allows only media keys listed in a secret manifest.
- Read-only Google Drive service-account access. Media is streamed server-side to authenticated visitors, with video byte-range requests preserved.
- Client-side site already supports background portraits, photo grids, a 3D timeline and video reels.
- No personal photos, video bytes, filenames, keys or passwords are present here.

## Important: ChatGPT Google Drive connection is not website OAuth

The Google Drive plugin lets us browse the folder and curate content inside ChatGPT. The Cloudflare site cannot silently reuse that authorization. To fetch photos/videos, a separate read-only **Google Cloud service account** must be created and its email granted Reader access to the *specific* Drive Memories folder. Enable the **Google Drive API** on that Google Cloud project.

Put the service account email, private key, access passphrase, cookie signing key and file selection manifest **only in Cloudflare encrypted secrets**. Use a strong secret phrase rather than a birthday alone.

### Required secrets

| Secret | Purpose |
| --- | --- |
| `ACCESS_PASSPHRASE` | The magical phrase checked on the server |
| `SESSION_SIGNING_KEY` | Long random server-only cookie signing key |
| `GOOGLE_SA_EMAIL` | Read-only Google service account email |
| `GOOGLE_SA_PRIVATE_KEY` | PEM service-account private key |
| `MEMORIES_MANIFEST` | JSON selecting approved media file IDs (example below) |

Never place any of these under `vars` in the Wrangler file, which would commit them to GitHub.

### Secret manifest schema (placeholder IDs only)

```json
{
  "files": {
    "hero": {"id": "REPLACE_WITH_DRIVE_FILE_ID", "mime": "image/jpeg"},
    "p01": {"id": "REPLACE_WITH_DRIVE_FILE_ID", "mime": "image/jpeg"},
    "poster1": {"id": "REPLACE_WITH_DRIVE_FILE_ID", "mime": "image/jpeg"},
    "v01": {"id": "REPLACE_WITH_DRIVE_FILE_ID", "mime": "video/mp4"}
  },
  "hero": {"key": "hero", "alt": "Birthday portrait"},
  "photos": [{"key": "p01", "caption": "A little moment"}],
  "timeline": [{"key": "p01", "title": "The first hello", "caption": "A beginning"}],
  "videos": [{"key": "v01", "posterKey": "poster1", "title": "A little adventure"}]
}
```

The frontend never receives the underlying Drive IDs. Files are fetched only from this allowlist and only after a valid session. The `MEMORIES_MANIFEST` secret stays on Cloudflare, not on GitHub.

## Local testing

1. `npm install`
2. `npm run build:private`
3. Configure local `.dev.vars` (never commit it) with temporary testing secrets.
4. `npm run dev:private`

For Cloudflare preview deployments, configure encrypted secrets in the appropriate Worker environment and run `npm run deploy:private`. The Wrangler config intentionally uses **little-universe-private-preview** and cannot overwrite the current live worker by name.

## Security checklist before sending to her

- Strong passphrase confirmed, no predictable date alone
- Turn on Cloudflare WAF/rate limiting (or Turnstile) for repeated failed `POST /unlock` attempts; **this code does not include distributed rate limiting**
- All pages, JS, CSS, thumbnails and video are protected by the Worker
- Cookies are Secure, HttpOnly, signed, short-lived
- Videos are streamed with Range support; don't choose multi-GB uploads until mobile playback is tested
- Block Google Drive 'anyone with link' permissions; verify inherited folder sharing
- Avoid public web-accessible backups, public raw Drive links and accidental logs containing tokens
- Test in private browsing: `/`, `/index.html`, `/script.js`, `/api/private/memories`, `/api/private/media/p01` all require login
- Use image/jpeg, PNG, WebP or AVIF and video/mp4; convert HEIC and MOV before integration
- This is a secret-link experience, not full identity verification. Someone who receives the passphrase can access the site.

## Deployment architecture

`scripts/build-private.mjs` copies existing public page assets to `dist` and enables its existing media API via the body attribute. `wrangler.private.jsonc` sets `assets.run_worker_first = true`, ensuring private page assets can't bypass the password gate. The Worker itself is `src/private-worker.js`.

The main site remains public and photo-free until the protected Worker is deployed and validated.
