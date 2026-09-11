"""ORM models: users, sessions, jobs, applications, reviews."""
import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship

from database import Base


def now():
    return datetime.datetime.utcnow()


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    role = Column(String, nullable=False)  # 'applicant' or 'employer'
    name = Column(String, nullable=False)  # full name (applicant) or company name (employer)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    country = Column(String, nullable=False)
    is_employed = Column(Boolean, default=False)  # meaningful for applicants only
    created_at = Column(DateTime, default=now)

    jobs = relationship("Job", back_populates="employer", foreign_keys="Job.employer_id")
    applications = relationship(
        "Application", back_populates="applicant", foreign_keys="Application.applicant_id"
    )


class Session(Base):
    __tablename__ = "sessions"

    token = Column(String, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=now)
    expires_at = Column(DateTime, nullable=False)

    user = relationship("User")


class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    employer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    category = Column(String, nullable=False)
    job_type = Column(String, nullable=False)
    budget = Column(String, nullable=False)
    location = Column(String, nullable=False)
    description = Column(Text, default="")
    status = Column(String, default="active")  # 'active' or 'closed'
    created_at = Column(DateTime, default=now)

    employer = relationship("User", back_populates="jobs", foreign_keys=[employer_id])
    applications = relationship("Application", back_populates="job")


class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    applicant_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String, default="pending")  # pending / accepted / rejected
    created_at = Column(DateTime, default=now)

    job = relationship("Job", back_populates="applications")
    applicant = relationship(
        "User", back_populates="applications", foreign_keys=[applicant_id]
    )


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    applicant_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    employer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=True)
    rating = Column(Integer, nullable=False)
    comment = Column(Text, default="")
    created_at = Column(DateTime, default=now)

    applicant = relationship("User", foreign_keys=[applicant_id])
    employer = relationship("User", foreign_keys=[employer_id])
