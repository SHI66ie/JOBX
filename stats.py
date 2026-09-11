from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session as DBSession

from database import get_db
import models
import schemas

router = APIRouter(prefix="/api/stats", tags=["stats"])


@router.get("/employment", response_model=schemas.EmploymentStatsOut)
def employment_stats(db: DBSession = Depends(get_db)):
    total = db.query(models.User).filter(models.User.role == "applicant").count()
    employed = (
        db.query(models.User)
        .filter(models.User.role == "applicant", models.User.is_employed == True)  # noqa: E712
        .count()
    )
    unemployed = total - employed

    if total == 0:
        return schemas.EmploymentStatsOut(
            total_applicants=0, employed=0, unemployed=0, employed_pct=0, unemployed_pct=0
        )

    employed_pct = round(employed / total * 100)
    unemployed_pct = 100 - employed_pct
    return schemas.EmploymentStatsOut(
        total_applicants=total,
        employed=employed,
        unemployed=unemployed,
        employed_pct=employed_pct,
        unemployed_pct=unemployed_pct,
    )
