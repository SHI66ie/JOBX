# JOMP (formerly JOBX / Joblink)

A modern job board platform built with Next.js, TypeScript, and Supabase.

**JOMP** — Job Opportunities Meets Preparation

## Features

- Marketing landing page
- Job seeker and company dashboards
- Authentication (login / signup with role selection)
- Admin panel
- Responsive UI

## Getting Started

The main application lives in the **`joblink/`** directory.

```bash
cd joblink
npm install
# Set up .env.local with your Supabase keys
npm run dev
```

## Tech Stack

- Next.js 16
- TypeScript
- Tailwind CSS
- Supabase
- Shadcn/UI

## Deployment (Vercel)

**Important:** Set the Vercel project **Root Directory** to `joblink`.

1. Go to Project Settings → General → Root Directory
2. Set it to `joblink`
3. Redeploy

The production URL should then resolve correctly instead of showing `DEPLOYMENT_NOT_FOUND`.

> Domain left unchanged as requested.

## Project Structure

```
JOBX/
├── joblink/          ← main Next.js app (use this)
│   ├── src/app/      ← routes (landing, login, signup, dashboards…)
│   └── ...
└── next-app/         ← legacy / unused scaffold (safe to ignore)
```

## License

MIT
