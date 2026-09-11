"""Pydantic schemas for request bodies and API responses."""
import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field


class RegisterIn(BaseModel):
    role: str = Field(pattern="^(applicant|employer)$")
    name: str = Field(min_length=2)
    email: EmailStr
    country: str = Field(min_length=2)
    password: str = Field(min_length=8)


class LoginIn(BaseModel):
    role: str = Field(pattern="^(applicant|employer)$")
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    role: str
    name: str
    email: str
    country: str
    is_employed: bool

    class Config:
        from_attributes = True


class JobCreate(BaseModel):
    title: str = Field(min_length=2)
    category: str
    job_type: str
    budget: str
    location: str
    description: str = ""


class JobUpdate(BaseModel):
    status: str = Field(pattern="^(active|closed)$")


class JobOut(BaseModel):
    id: int
    title: str
    category: str
    job_type: str
    budget: str
    location: str
    description: str
    status: str
    employer_id: int
    employer_name: Optional[str] = None
    applicant_count: Optional[int] = None
    already_applied: Optional[bool] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True


class ApplicationOut(BaseModel):
    id: int
    job_id: int
    job_title: Optional[str] = None
    employer_name: Optional[str] = None
    applicant_id: int
    applicant_name: Optional[str] = None
    status: str
    created_at: datetime.datetime

    class Config:
        from_attributes = True


class ApplicationStatusUpdate(BaseModel):
    status: str = Field(pattern="^(accepted|rejected)$")


class ReviewCreate(BaseModel):
    applicant_id: int
    job_id: Optional[int] = None
    rating: int = Field(ge=1, le=5)
    comment: str = ""


class ReviewOut(BaseModel):
    id: int
    employer_name: Optional[str] = None
    rating: int
    comment: str
    created_at: datetime.datetime

    class Config:
        from_attributes = True


class EmploymentStatsOut(BaseModel):
    total_applicants: int
    employed: int
    unemployed: int
    employed_pct: int
    unemployed_pct: int
