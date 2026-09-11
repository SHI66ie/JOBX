import os

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from database import engine, Base
import models  # noqa: F401  (ensures models are registered before create_all)
from routers import auth, jobs, applicant, employer, stats

Base.metadata.create_all(bind=engine)

app = FastAPI(title="JOMP API", version="1.0.0")

app.include_router(auth.router)
app.include_router(jobs.router)
app.include_router(applicant.router)
app.include_router(employer.router)
app.include_router(stats.router)

STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")

# CSS/JS/images referenced by the pages, if any are split out later
app.mount("/assets", StaticFiles(directory=STATIC_DIR), name="assets")


def _serve(filename: str) -> FileResponse:
    return FileResponse(os.path.join(STATIC_DIR, filename))


@app.get("/")
def serve_landing():
    return _serve("index.html")


@app.get("/register")
def serve_register():
    return _serve("register.html")


@app.get("/login")
def serve_login():
    return _serve("login.html")


@app.get("/dashboard/applicant")
def serve_applicant_dashboard():
    return _serve("applicant-dashboard.html")


@app.get("/dashboard/employer")
def serve_employer_dashboard():
    return _serve("employer-dashboard.html")
