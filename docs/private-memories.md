# Some Bonds Stay Golden — private birthday site setup

This is the **private deployment branch**: `feature/private-memories-gate`.

The live `main` branch remains a **public, photo-free preview**. Do not merge or switch the live site to this branch until the private Cloudflare Worker and Drive access have been configured and tested.

## How the photos stay private

1. **Google Drive source:** The original parent folder and individual sampled files were verified to be restricted to the owner. Do not turn on "Anyone with the link." Leave original photos/videos in Drive. The ChatGPT Drive connector is for curation only; the website cannot reuse that authorization.
2. **Cloudflare gate:** The Worker checks the secret phrase **on the server**. It is stored only as the encrypted Cloudflare secret `ACCESS_PASSPHRASE`; never in GitHub, web JavaScript, `index.html`, or a `.env` file committed to the repo.
3. **Brute-force mitigation:** A Cloudflare Worker rate-limit binding allows approximately **8 password attempts per IP per 60 seconds**. This is a practical safeguard, not a distributed strict limit.
4. **Browser session:** The Worker gives successful visitors a signed, random, 8-hour session cookie with `HttpOnly; Secure; SameSite=Lax`. Every static asset and private media/API request is checked because `assets.run_worker_first=true`.
5. **Media proxy:** The frontend receives temporary first-party routes such as `/api/private/media/t01` — **not original Drive URLs or Drive file IDs**. The Worker looks up file IDs in the secret `MEMORIES_MANIFEST`, fetches the file using a read-only Google service account, and streams it to the authenticated visitor. Video ranges are forwarded.
6. **Response hardening:** Private responses use `Cache-Control: private, no-store`, `noindex`, `nosniff`, a restrictive Content Security Policy, and no Drive redirect.
7. **Limits:** A visitor who knows the phrase can access the private site and save media displayed in their browser. This protects against casual/public access, but cannot prevent an invited visitor from copying pictures. A phrase containing recognizable names or a date is easier to guess than a random password; consider strengthening it before launch.

## Checklist to activate it on Cloudflare

### A. Deploy a *separate* private Worker

Do **not** overwrite the public preview first.

1. Install Node.js and run `npm install` in a local clone of the repository.
2. Check out `feature/private-memories-gate`.
3. Run `npm run build:private` to create `dist/`. The build includes all HTML, CSS, JS, cake and quiz but **no private media, secrets, or Drive IDs**.
4. Run `npm run deploy:private` from an authenticated Wrangler CLI. The config uses the distinct Worker name `little-universe-private-preview`, so it does not overwrite the existing live site.
5. Initially this Worker returns HTTP 503 because secrets have not been installed yet. That is intentional: **fail closed**.

### B. Configure Cloudflare encrypted Worker secrets

In the Cloudflare dashboard choose **Workers & Pages → little-universe-private-preview → Settings → Variables and Secrets → Add → Type: Secret**.

Add these secret *names*; do not paste the values into GitHub or this guide:

| Cloudflare encrypted secret | What to set |
| --- | --- |
| `ACCESS_PASSPHRASE` | The exact chosen private phrase (case-sensitive; not placed in GitHub). |
| `SESSION_SIGNING_KEY` | A separate cryptographically random 32-byte-or-longer value. |
| `GOOGLE_SA_EMAIL` | Read-only service-account email from your own Google Cloud project. |
| `GOOGLE_SA_PRIVATE_KEY` | Its PEM private key, exactly as generated; keep it private. |
| `MEMORIES_MANIFEST` | Paste the complete JSON from your **private** selection file supplied in ChatGPT, not this repo. |
| `BIRTHDAY_GIFT_CODE` | Optional, only **after purchasing** the genuine Amazon.in card. |

Use the **Save / Deploy** action after adding secrets. Rotate keys or the phrase if ever exposed.

### C. Give the Worker *separate* Google Drive permission

1. In [Google Cloud Console](https://console.cloud.google.com/), create/select a project and enable **Google Drive API**.
2. Create a service account with no project-wide Drive privileges. For this simple birthday site, generate a short-lived **test** key and store its PEM securely as the Cloudflare secret. Google recommends avoiding long-lived exported keys in production where possible; delete the key after the birthday or replace with a safer identity solution.
3. In Google Drive, open the selected birthday photo folder → Share → add **only the service account email** as **Viewer**. **Do not** enable Anyone with the link.
4. Use the private JSON manifest to map exactly `hero/background.jpg`, the twelve numbered images (in order), and the three user-named MP4 files. No Drive file IDs or filenames are embedded in website JavaScript.
5. One selected photo is HEIF: `07-SomewhereNew.HEIC`. The Worker can stream HEIF for compatible browsers (notably Safari). For broad device support, upload a browser-ready JPEG derivative privately and change just `files.t07.id` and `files.t07.mime` to the new JPEG in `MEMORIES_MANIFEST`. Keep the original unchanged.

### D. Verify in an incognito window **before sharing**

- `/`, `/index.html`, `/quiz.js`, `/cake.js` should show the private entrance when logged out.
- `/api/private/memories` and `/api/private/media/t01` should return **401** when logged out, not leak files.
- Incorrect passphrase should fail, repeated failures should eventually return 429.
- Correct passphrase should create a Secure, HttpOnly, signed session and display the entire yellow site.
- Verify all twelve timeline cards align with their numbered filenames, the background image renders, and all three videos work on mobile.
- Verify the private photo and video endpoints work **only after login**, with video seeking.
- Confirm no image or video URL points to a public Drive share link or to the public GitHub repository.
- Verify the gift reveal is still a placeholder until you separately set a purchased code.
- On mobile, test iOS Safari and another browser, including the HEIF/JPEG compatibility issue.

### E. Switch to production after testing

Once the private Worker is fully working, make it the URL you actually send, or attach a custom domain. Leave the existing public preview photo-free until then. Cloudflare Workers `workers.dev` names follow `<worker-name>.<account-subdomain>.workers.dev`. If you rename a Worker and use a Wrangler/GitHub build config, keep the configured Worker `name` synchronized.

## Troubleshooting

- **All photos empty:** You have not set `MEMORIES_MANIFEST`, the service-account email/private key, or the service account does not have Viewer access to the source folder.
- **Login HTTP 503:** Missing `ACCESS_PASSPHRASE` / `SESSION_SIGNING_KEY` or the `AUTH_RATE_LIMITER` binding.
- **HEIC photo missing on Windows/Android:** Convert the photo to JPG and update just the corresponding secret manifest entry.
- **Video doesn't play or seek:** Test MP4 encoding, the Drive proxy's byte-range responses, and device/network restrictions.
- **Cloudflare project unexpectedly changed name:** The dashboard Worker name and Wrangler config name may differ; align them before the next deploy.

This branch does not contain passwords, gift codes, personal media files, or a public manifest of Drive IDs.
