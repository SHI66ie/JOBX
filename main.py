import os

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from database import engine, Base
import models  # noqa: F401  (ensures models are registered before create_all)
from auth import router as auth_router
from jobs import router as jobs_router
from applicant import router as applicant_router
from employer import router as employer_router
from stats import router as stats_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="JOMP API", version="1.0.0")

app.include_router(auth_router)
app.include_router(jobs_router)
app.include_router(applicant_router)
app.include_router(employer_router)
app.include_router(stats_router)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = os.path.join(BASE_DIR, "static") if os.path.isdir(os.path.join(BASE_DIR, "static")) else BASE_DIR

if os.path.isdir(STATIC_DIR):
    app.mount("/assets", StaticFiles(directory=STATIC_DIR), name="assets")


def _serve(filename: str) -> FileResponse:
    path = os.path.join(STATIC_DIR, filename)
    if not os.path.isfile(path):
        path = os.path.join(BASE_DIR, filename)
    return FileResponse(path)


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
