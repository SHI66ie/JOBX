# JOMP app (`joblink`)

Next.js app for [jomponline.com](https://jomponline.com).

## Local

```bash
cp .env.example .env.local
npm install
npm run dev
```

## Deploy

Production is **Netlify only**. Deploy from the repository root. The root `netlify.toml` sets `base = "joblink"` and uses `@netlify/plugin-nextjs`.

Set `NEXT_PUBLIC_SITE_URL=https://jomponline.com` in the Netlify environment. Do not point this app at a Vercel or `*.netlify.app` hostname.
