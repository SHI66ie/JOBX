from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session as DBSession

from database import get_db
import models
import schemas
import auth as auth_utils

router = APIRouter(prefix="/api/employer", tags=["employer"])


def require_employer(user: models.User = Depends(auth_utils.require_role("employer"))) -> models.User:
    return user


@router.get("/dashboard")
def dashboard(user: models.User = Depends(require_employer), db: DBSession = Depends(get_db)):
    job_ids = [j.id for j in db.query(models.Job.id).filter(models.Job.employer_id == user.id).all()]

    active_job_posts = (
        db.query(models.Job)
        .filter(models.Job.employer_id == user.id, models.Job.status == "active")
        .count()
    )

    applications_to_review = accepted_count = rejected_count = 0
    if job_ids:
        applications_to_review = (
            db.query(models.Application)
            .filter(models.Application.job_id.in_(job_ids), models.Application.status == "pending")
            .count()
        )
        accepted_count = (
            db.query(models.Application)
            .filter(models.Application.job_id.in_(job_ids), models.Application.status == "accepted")
            .count()
        )
        rejected_count = (
            db.query(models.Application)
            .filter(models.Application.job_id.in_(job_ids), models.Application.status == "rejected")
            .count()
        )

    return {
        "name": user.name,
        "active_job_posts": active_job_posts,
        "applications_to_review": applications_to_review,
        "accepted_count": accepted_count,
        "rejected_count": rejected_count,
    }


@router.post("/jobs", response_model=schemas.JobOut)
def create_job(
    payload: schemas.JobCreate,
    user: models.User = Depends(require_employer),
    db: DBSession = Depends(get_db),
):
    job = models.Job(
        employer_id=user.id,
        title=payload.title,
        category=payload.category,
        job_type=payload.job_type,
        budget=payload.budget,
        location=payload.location,
        description=payload.description,
        status="active",
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    return schemas.JobOut(
        id=job.id,
        title=job.title,
        category=job.category,
        job_type=job.job_type,
        budget=job.budget,
        location=job.location,
        description=job.description,
        status=job.status,
        employer_id=job.employer_id,
        employer_name=user.name,
        applicant_count=0,
        already_applied=False,
        created_at=job.created_at,
    )


@router.get("/jobs", response_model=list[schemas.JobOut])
def my_jobs(user: models.User = Depends(require_employer), db: DBSession = Depends(get_db)):
    jobs = (
        db.query(models.Job)
        .filter(models.Job.employer_id == user.id)
        .order_by(models.Job.created_at.desc())
        .all()
    )
    return [
        schemas.JobOut(
            id=j.id,
            title=j.title,
            category=j.category,
            job_type=j.job_type,
            budget=j.budget,
            location=j.location,
            description=j.description,
            status=j.status,
            employer_id=j.employer_id,
            employer_name=user.name,
            applicant_count=len(j.applications),
            already_applied=None,
            created_at=j.created_at,
        )
        for j in jobs
    ]


@router.patch("/jobs/{job_id}", response_model=schemas.JobOut)
def update_job(
    job_id: int,
    payload: schemas.JobUpdate,
    user: models.User = Depends(require_employer),
    db: DBSession = Depends(get_db),
):
    job = db.query(models.Job).filter(models.Job.id == job_id, models.Job.employer_id == user.id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    job.status = payload.status
    db.commit()
    db.refresh(job)
    return schemas.JobOut(
        id=job.id,
        title=job.title,
        category=job.category,
        job_type=job.job_type,
        budget=job.budget,
        location=job.location,
        description=job.description,
        status=job.status,
        employer_id=job.employer_id,
        employer_name=user.name,
        applicant_count=len(job.applications),
        already_applied=None,
        created_at=job.created_at,
    )


@router.get("/applications", response_model=list[schemas.ApplicationOut])
def applications_to_review(
    status: Optional[str] = None,
    user: models.User = Depends(require_employer),
    db: DBSession = Depends(get_db),
):
    job_ids = [j.id for j in db.query(models.Job.id).filter(models.Job.employer_id == user.id).all()]
    if not job_ids:
        return []

    q = db.query(models.Application).filter(models.Application.job_id.in_(job_ids))
    if status:
        q = q.filter(models.Application.status == status)
    apps = q.order_by(models.Application.created_at.desc()).all()

    return [
        schemas.ApplicationOut(
            id=a.id,
            job_id=a.job_id,
            job_title=a.job.title if a.job else None,
            employer_name=user.name,
            applicant_id=a.applicant_id,
            applicant_name=a.applicant.name if a.applicant else None,
            status=a.status,
            created_at=a.created_at,
        )
        for a in apps
    ]


@router.patch("/applications/{application_id}", response_model=schemas.ApplicationOut)
def update_application(
    application_id: int,
    payload: schemas.ApplicationStatusUpdate,
    user: models.User = Depends(require_employer),
    db: DBSession = Depends(get_db),
):
    application = (
        db.query(models.Application)
        .join(models.Job)
        .filter(models.Application.id == application_id, models.Job.employer_id == user.id)
        .first()
    )
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    application.status = payload.status
    if payload.status == "accepted":
        application.applicant.is_employed = True
    db.commit()
    db.refresh(application)

    return schemas.ApplicationOut(
        id=application.id,
        job_id=application.job_id,
        job_title=application.job.title,
        employer_name=user.name,
        applicant_id=application.applicant_id,
        applicant_name=application.applicant.name,
        status=application.status,
        created_at=application.created_at,
    )


@router.post("/reviews", response_model=schemas.ReviewOut)
def leave_review(
    payload: schemas.ReviewCreate,
    user: models.User = Depends(require_employer),
    db: DBSession = Depends(get_db),
):
    has_accepted = (
        db.query(models.Application)
        .join(models.Job)
        .filter(
            models.Job.employer_id == user.id,
            models.Application.applicant_id == payload.applicant_id,
            models.Application.status == "accepted",
        )
        .first()
    )
    if not has_accepted:
        raise HTTPException(status_code=400, detail="You can only review applicants you've hired")

    review = models.Review(
        applicant_id=payload.applicant_id,
        employer_id=user.id,
        job_id=payload.job_id,
        rating=payload.rating,
        comment=payload.comment,
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return schemas.ReviewOut(
        id=review.id,
        employer_name=user.name,
        rating=review.rating,
        comment=review.comment,
        created_at=review.created_at,
    )
