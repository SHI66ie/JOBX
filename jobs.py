from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session as DBSession

from database import get_db
import models
import schemas
import auth as auth_utils

router = APIRouter(prefix="/api/jobs", tags=["jobs"])


@router.get("", response_model=list[schemas.JobOut])
def list_jobs(status: Optional[str] = "active", request: Request = None, db: DBSession = Depends(get_db)):
    """Public job board. If an applicant is logged in, flags jobs they already applied to."""
    q = db.query(models.Job)
    if status:
        q = q.filter(models.Job.status == status)
    jobs = q.order_by(models.Job.created_at.desc()).all()

    applicant_id = None
    token = request.cookies.get(auth_utils.SESSION_COOKIE_NAME) if request else None
    if token:
        db_session = db.query(models.Session).filter(models.Session.token == token).first()
        if db_session:
            applicant_id = db_session.user_id

    results = []
    for job in jobs:
        already_applied = False
        if applicant_id:
            already_applied = (
                db.query(models.Application)
                .filter(
                    models.Application.job_id == job.id,
                    models.Application.applicant_id == applicant_id,
                )
                .first()
                is not None
            )
        results.append(
            schemas.JobOut(
                id=job.id,
                title=job.title,
                category=job.category,
                job_type=job.job_type,
                budget=job.budget,
                location=job.location,
                description=job.description,
                status=job.status,
                employer_id=job.employer_id,
                employer_name=job.employer.name if job.employer else None,
                applicant_count=len(job.applications),
                already_applied=already_applied,
                created_at=job.created_at,
            )
        )
    return results


@router.post("/{job_id}/apply", response_model=schemas.ApplicationOut)
def apply_to_job(
    job_id: int,
    applicant: models.User = Depends(auth_utils.require_role("applicant")),
    db: DBSession = Depends(get_db),
):
    job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if not job or job.status != "active":
        raise HTTPException(status_code=404, detail="Job not available")

    existing = (
        db.query(models.Application)
        .filter(models.Application.job_id == job_id, models.Application.applicant_id == applicant.id)
        .first()
    )
    if existing:
        raise HTTPException(status_code=409, detail="You already applied to this job")

    application = models.Application(job_id=job_id, applicant_id=applicant.id, status="pending")
    db.add(application)
    db.commit()
    db.refresh(application)

    return schemas.ApplicationOut(
        id=application.id,
        job_id=job.id,
        job_title=job.title,
        employer_name=job.employer.name if job.employer else None,
        applicant_id=applicant.id,
        applicant_name=applicant.name,
        status=application.status,
        created_at=application.created_at,
    )
