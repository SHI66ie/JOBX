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

## Database updates

If posting returns `PGRST204` for `jobs.company_id`, run
[`supabase/migrations/20260929_job_posting_columns.sql`](supabase/migrations/20260929_job_posting_columns.sql)
in the connected project's Supabase SQL Editor, then retry posting. This adds the
missing job columns, links older jobs to their employer's company when unambiguous,
and reloads the API schema cache. It preserves existing jobs and access policies.
The verification query should return all six columns.

If posting returns `23514` for `jobs_status_check` or `jobs_job_type_check`, run
[`supabase/migrations/20260930_job_posting_constraints.sql`](supabase/migrations/20260930_job_posting_constraints.sql).
This allows the form's published status and temporary job type while preserving legacy active jobs.
