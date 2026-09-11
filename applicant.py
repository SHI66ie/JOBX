from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session as DBSession
from sqlalchemy import func

from database import get_db
import models
import schemas
import auth as auth_utils

router = APIRouter(prefix="/api/applicant", tags=["applicant"])


def require_applicant(user: models.User = Depends(auth_utils.require_role("applicant"))) -> models.User:
    return user


@router.get("/dashboard")
def dashboard(user: models.User = Depends(require_applicant), db: DBSession = Depends(get_db)):
    applications_count = (
        db.query(models.Application).filter(models.Application.applicant_id == user.id).count()
    )
    available_offers_count = db.query(models.Job).filter(models.Job.status == "active").count()
    past_jobs_count = (
        db.query(models.Application)
        .filter(models.Application.applicant_id == user.id, models.Application.status == "accepted")
        .count()
    )
    avg_rating, review_count = (
        db.query(func.avg(models.Review.rating), func.count(models.Review.id))
        .filter(models.Review.applicant_id == user.id)
        .first()
    )
    return {
        "name": user.name,
        "applications_count": applications_count,
        "available_offers_count": available_offers_count,
        "past_jobs_count": past_jobs_count,
        "avg_rating": round(avg_rating, 1) if avg_rating else 0,
        "review_count": review_count or 0,
    }


@router.get("/applications", response_model=list[schemas.ApplicationOut])
def my_applications(user: models.User = Depends(require_applicant), db: DBSession = Depends(get_db)):
    apps = (
        db.query(models.Application)
        .filter(models.Application.applicant_id == user.id)
        .order_by(models.Application.created_at.desc())
        .all()
    )
    return [
        schemas.ApplicationOut(
            id=a.id,
            job_id=a.job_id,
            job_title=a.job.title if a.job else None,
            employer_name=a.job.employer.name if a.job and a.job.employer else None,
            applicant_id=user.id,
            applicant_name=user.name,
            status=a.status,
            created_at=a.created_at,
        )
        for a in apps
    ]


@router.get("/reviews", response_model=list[schemas.ReviewOut])
def my_reviews(user: models.User = Depends(require_applicant), db: DBSession = Depends(get_db)):
    reviews = (
        db.query(models.Review)
        .filter(models.Review.applicant_id == user.id)
        .order_by(models.Review.created_at.desc())
        .all()
    )
    return [
        schemas.ReviewOut(
            id=r.id,
            employer_name=r.employer.name if r.employer else None,
            rating=r.rating,
            comment=r.comment,
            created_at=r.created_at,
        )
        for r in reviews
    ]
