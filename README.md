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

**Primary:** Netlify. Root `netlify.toml` already builds `joblink`.

**Vercel (hibernating):** production deploys are skipped on purpose so you are not billed for a second live site. Preview deployments for branches still build, so you can open a PR or push a branch and use the Vercel preview URL to check it. Set the Vercel project Root Directory to `joblink` if it is not already.

### Public URL

The `vercel.app` address is a deployment hostname and can change between preview deployments. It is not the public product URL. In the production hosting project, add the custom domain `jomponline.com` (or the approved JOMP domain), configure its DNS records as Vercel requests, and set `NEXT_PUBLIC_SITE_URL` to that same `https://` URL. The settings page will then be available at:

`https://jomponline.com/employer/settings`

Keep the Vercel preview URL only for testing. The custom domain must be attached in the Vercel or Netlify project dashboard; application code cannot rename a hosting domain by itself.

## What was removed

The old FastAPI + SQLite HTML prototype and the unused `next-app/` copy are gone. Brand assets stay in `brand/` and `joblink/public/brand/`.
