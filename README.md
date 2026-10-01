# JOMP

Connecting Talent. Creating Opportunities.

Live site: **https://jomponline.com**

The product is the Next.js app in [`joblink/`](./joblink), backed by **Supabase** for auth and Postgres. Hosting is **Netlify only**.

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
- `NEXT_PUBLIC_SITE_URL=https://jomponline.com`
- `OPENAI_API_KEY` (Optional for production OpenAI GPT-4o / GPT-4o-mini; smart fallbacks operate when unset)
- `OPENAI_MODEL=gpt-4o-mini` (Optional, defaults to `gpt-4o-mini`)

## AI Features

- **Employer**: AI Job Description Drafter & Enhancer, AI Candidate Screening & Match Scoring (0-100% breakdown, pros & areas to probe), AI Interview Question Generator.
- **Job Seeker**: AI Profile & Bio Polish with smart skill extractor, AI Tailored Application Pitch & Fit Breakdown.


## Deploy

Use the root `netlify.toml`. It builds `joblink` with the Netlify Next.js plugin.

1. Connect this GitHub repo to one Netlify site.
2. Add the custom domain `jomponline.com` (and `www`) in Netlify Domain management.
3. Set `NEXT_PUBLIC_SITE_URL=https://jomponline.com` in Netlify env and redeploy.
4. Disconnect any Vercel project from this repo so it cannot reclaim the domain.

Employer settings: https://jomponline.com/employer/settings

## What was removed

The FastAPI prototype, the unused `next-app/` copy, and Vercel hosting leftovers (`vercel.svg`, `.vercel` ignore rules, provider-hostname docs) are gone. Brand assets stay in `brand/` and `joblink/public/brand/`.
