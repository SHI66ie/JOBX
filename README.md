# JOMP Backend

A FastAPI + SQLite backend for JOMP, wired up to the existing landing page,
register/login flows, and both dashboards. Sessions are server-side (a random
token cookie backed by a `sessions` table), not client-side JWTs — logging
out or expiring a session just deletes the row.

## Stack

- **FastAPI** — API + serves the frontend HTML directly (same-origin, so
  session cookies work with zero CORS configuration)
- **SQLite** via **SQLAlchemy** — single file, `jomp.db`, created automatically
- **Sessions** — random token in an httponly cookie, looked up against a
  `sessions` table on every request
- **Passwords** — hashed with PBKDF2-HMAC-SHA256 (Python's stdlib `hashlib`,
  no extra native dependencies like bcrypt required)

## Setup

```bash
cd jomp-backend
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python seed.py                   # creates jomp.db with demo data
uvicorn main:app --reload
```

Then open **http://localhost:8000**.

## Demo accounts

Created by `seed.py`:

| Role      | Email                  | Password      |
|-----------|------------------------|----------------|
| Applicant | applicant@demo.jomp    | password123    |
| Employer  | employer@demo.jomp     | password123    |

The applicant (Jordan Ade) has a few applications and reviews already on
file; the employer (Nova Studio Ltd.) has a few job posts with applications
waiting to be accepted/rejected, so both dashboards have real data to show
immediately.

## Routes

Pages (serve the frontend):

- `GET /` — landing page
- `GET /register` — registration flow
- `GET /login` — login flow
- `GET /dashboard/applicant` — applicant dashboard
- `GET /dashboard/employer` — employer dashboard

API (all under `/api`):

| Method | Path                              | Notes                                   |
|--------|------------------------------------|------------------------------------------|
| POST   | `/api/auth/register`              | body: role, name, email, country, password |
| POST   | `/api/auth/login`                 | body: role, email, password              |
| POST   | `/api/auth/logout`                | clears the session                       |
| GET    | `/api/auth/me`                    | current logged-in user                   |
| GET    | `/api/jobs?status=active`          | public job board                         |
| POST   | `/api/jobs/{id}/apply`            | applicant only                           |
| GET    | `/api/applicant/dashboard`        | applicant only — stat card numbers       |
| GET    | `/api/applicant/applications`     | applicant only                           |
| GET    | `/api/applicant/reviews`          | applicant only                           |
| GET    | `/api/employer/dashboard`         | employer only — stat card numbers        |
| POST   | `/api/employer/jobs`              | employer only — create a job posting     |
| GET    | `/api/employer/jobs`              | employer only — this employer's postings |
| PATCH  | `/api/employer/jobs/{id}`         | employer only — open/close a posting     |
| GET    | `/api/employer/applications`      | employer only — optional `?status=`      |
| PATCH  | `/api/employer/applications/{id}` | employer only — accept/reject            |
| POST   | `/api/employer/reviews`           | employer only — review a hired applicant |
| GET    | `/api/stats/employment`           | public — powers the employed/unemployed chart |

Interactive API docs (Swagger UI) are auto-generated at **`/docs`**.

## How the pieces fit together

- **`models.py`** — `User` (role is `applicant` or `employer`), `Session`,
  `Job`, `Application`, `Review`.
- **`auth.py`** — password hashing + the `get_current_user` /
  `require_role("applicant"|"employer")` dependencies used to protect routes.
- **`routers/`** — one file per resource area.
- **`static/`** — the five HTML pages; their `<script>` blocks now call the
  API with `fetch(..., { credentials: 'same-origin' })` instead of using
  hardcoded mock data. Job applying, accepting/rejecting, and posting a job
  are all live.
- When an employer accepts an application, that applicant's `is_employed`
  flag flips to `true`, which is what the "Employed vs Unemployed
  Applicants" chart on both dashboards reads from (`/api/stats/employment`).

## Notes / next steps for production

- `SESSION_COOKIE` is set with `httponly` + `samesite=lax` but not `secure`
  (fine for local HTTP; set `secure=True` in `auth.py` once you're serving
  over HTTPS).
- CORS isn't configured because the API and frontend are served from the
  same FastAPI app. If you split the frontend onto its own domain later,
  you'll need `CORSMiddleware` with `allow_credentials=True` and an explicit
  origin.
- There's no rate limiting or email verification — add those before this
  goes anywhere near real user data.
- SQLite is great for development; swap `database.py`'s connection string
  for Postgres when you're ready to run this for real (the SQLAlchemy models
  don't need to change).
