# JOMP

Connecting Talent. Creating Opportunities.

The live product is the Next.js app in [`joblink/`](./joblink), backed by **Supabase** for auth and Postgres.

## Run locally

```bash
cd joblink
cp .env.example .env.local   # then fill in your Supabase keys
npm install
npm run dev
```

Open http://localhost:3000.

Required env vars:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`)
- `NEXT_PUBLIC_SITE_URL` (the branded public URL, for example `https://jomponline.com`)

## Deploy

**Production:** Netlify. Root `netlify.toml` builds `joblink` with the Netlify Next.js plugin. Keep Netlify as the only connected deployment provider for this repository.

### Public URL

The public product URL is `https://jomponline.com`. Configure that custom domain in Netlify and set `NEXT_PUBLIC_SITE_URL` to the same `https://` URL. The settings page is available at:

`https://jomponline.com/employer/settings`

Do not use a deployment-provider hostname as the public URL. The custom domain must be attached in the Netlify project dashboard; application code cannot rename or remove an existing hosting project by itself.

## What was removed

The old FastAPI + SQLite HTML prototype and the unused `next-app/` copy are gone. Brand assets stay in `brand/` and `joblink/public/brand/`.
