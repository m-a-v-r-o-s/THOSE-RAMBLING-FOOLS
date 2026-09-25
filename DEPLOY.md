# Deploying the Astro version to Railway

Same service, same volume, same variables. Railway builds `main` with Railpack.

## After merging, before pushing: check in Railway

1. **Start command.** `railway.json` sets it to `node server.mjs`. Running node
   directly (not `npm start`) saves roughly 70 MB of resident memory, since npm
   stays alive as a parent process. If the service has a custom start command
   in its settings, `railway.json` overrides it; clear the dashboard value to
   avoid confusion.
2. **PORT.** Railway injects `PORT`; `server.mjs` listens on `0.0.0.0:$PORT`.
   Nothing to set.
3. **NODE_OPTIONS.** Nothing in this app needs it. If it holds a heap cap such as
   `--max-old-space-size=...`, it can stay (anything 64 or higher is fine) or be
   removed. Optional: `--max-semi-space-size=2` trimmed about 5 MB of idle RSS
   locally.
4. **Volume.** Still mounted at `/data` with `GIGS_DATA_DIR=/data`. The JSON
   format of `gigs.json` and `posts.json` is unchanged, no migration.
5. **ADMIN_USER / ADMIN_PASSWORD.** Unchanged. Existing admin sessions stay
   valid (same cookie name and token formula).
6. **Node version.** `package.json` `engines.node` is `>=22.12.0` (Astro's minimum);
   Railpack picks it up. Railpack detects Astro with the node adapter and builds
   with `npm run build`.
7. **Renamed optional build-time env vars** (only if ever set):
   `NEXT_PUBLIC_SITE_URL` is now `SITE_URL`, `NEXT_PUBLIC_GA_MEASUREMENT_ID` is now
   `PUBLIC_GA_MEASUREMENT_ID`.

## Verify production after the deploy

```bash
H=https://www.thoseramblingfools.com
for p in / /our-story /upcoming-gigs /privacy /terms /robots.txt /sitemap.xml; do
  curl -s -o /dev/null -w "%{http_code} $p\n" $H$p; done
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" https://thoseramblingfools.com/our-story  # 308 to www, path kept
curl -s -o /dev/null -w "%{http_code}\n" $H/nope                                                   # 404
curl -s -o /dev/null -w "%{http_code}\n" $H/admin/api/gigs                                         # 401
curl -sI -r 0-99 $H/covers/album1.mp3 | head -1                                                    # 206
curl -sI $H/ | grep -i 'content-security-policy\|x-content-type-options'
```

Then in a browser: log in at `/admin`, add and delete a test gig, and play an
album then click Ramblings: the music should keep playing. In Railway metrics,
idle memory should settle around 100 MB (was ~420 MB).

## Rollback

Revert the merge commit on `main` and push (`git revert -m 1 <merge-sha> && git push`).
Railway redeploys the Next.js version; the volume data is compatible both ways.
The revert also removes `railway.json`, so the start command returns to Railpack's
default (`npm start`, which runs `next start`).
