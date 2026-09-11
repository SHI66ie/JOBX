"""Populate jomp.db with demo data so the dashboards aren't empty on first run.

Run once after installing requirements:
    python seed.py

Demo logins created:
    Employer  -> employer@demo.jomp   / password123
    Applicant -> applicant@demo.jomp  / password123
"""
import random

from database import SessionLocal, engine, Base
import models
from auth import hash_password

Base.metadata.create_all(bind=engine)
db = SessionLocal()


def get_or_create_user(role, name, email, country, password, is_employed=False):
    user = db.query(models.User).filter(models.User.email == email).first()
    if user:
        return user
    user = models.User(
        role=role,
        name=name,
        email=email,
        country=country,
        password_hash=hash_password(password),
        is_employed=is_employed,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def get_or_create_job(employer, title, category, job_type, budget, location, description, status="active"):
    job = (
        db.query(models.Job)
        .filter(models.Job.employer_id == employer.id, models.Job.title == title)
        .first()
    )
    if job:
        return job
    job = models.Job(
        employer_id=employer.id,
        title=title,
        category=category,
        job_type=job_type,
        budget=budget,
        location=location,
        description=description,
        status=status,
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    return job


def get_or_create_application(job, applicant, status="pending"):
    app_ = (
        db.query(models.Application)
        .filter(models.Application.job_id == job.id, models.Application.applicant_id == applicant.id)
        .first()
    )
    if app_:
        return app_
    app_ = models.Application(job_id=job.id, applicant_id=applicant.id, status=status)
    db.add(app_)
    db.commit()
    db.refresh(app_)
    if status == "accepted":
        applicant.is_employed = True
        db.commit()
    return app_


print("Seeding JOMP demo data...")

# --- Demo login accounts ---
nova = get_or_create_user("employer", "Nova Studio Ltd.", "employer@demo.jomp", "United Kingdom", "password123")
jordan = get_or_create_user("applicant", "Jordan Ade", "applicant@demo.jomp", "Nigeria", "password123")

# --- Supporting employers, for job variety on the browse page ---
brightfield = get_or_create_user("employer", "Brightfield Agency", "hello@brightfield.jomp", "United States", "password123")
halcyon = get_or_create_user("employer", "Halcyon Labs", "hello@halcyon.jomp", "Canada", "password123")
reef = get_or_create_user("employer", "Reef Commerce", "hello@reef.jomp", "Nigeria", "password123")
northwind = get_or_create_user("employer", "Northwind Media", "hello@northwind.jomp", "United Kingdom", "password123")
solace = get_or_create_user("employer", "Solace Health", "hello@solace.jomp", "United States", "password123")
kite = get_or_create_user("employer", "Kite Collective", "hello@kite.jomp", "Ghana", "password123")

# --- Nova Studio's own job postings (shown on the employer dashboard) ---
job_product_designer = get_or_create_job(
    nova, "Product Designer", "Design", "Contract", "$45/hr", "Remote",
    "Design product experiences across web and mobile.", "active",
)
job_frontend_nova = get_or_create_job(
    nova, "Frontend Engineer", "Engineering", "Full-time", "$40/hr", "Remote",
    "Build and maintain our customer-facing web app.", "active",
)
job_content_nova = get_or_create_job(
    nova, "Content Strategist", "Content", "Part-time", "$28/hr", "Remote",
    "Own our content calendar and voice.", "closed",
)

# --- Other employers' postings (shown on the applicant's browse-offers list) ---
job_uiux = get_or_create_job(
    brightfield, "UI/UX Contractor", "Design", "Contract", "$50/hr", "Remote",
    "Redesign key flows across our product.",
)
job_senior_pd = get_or_create_job(
    halcyon, "Senior Product Designer", "Design", "Contract", "$55/hr", "Remote",
    "Lead design on a new consumer app.",
)
job_frontend_reef = get_or_create_job(
    reef, "Frontend Engineer", "Engineering", "Full-time", "$40/hr", "Lagos",
    "Ship features for our e-commerce platform.",
)
job_content_northwind = get_or_create_job(
    northwind, "Content Strategist", "Content", "Part-time", "$28/hr", "Remote",
    "Plan and edit our editorial calendar.",
)
job_landing_solace = get_or_create_job(
    solace, "Landing Page Redesign", "Design", "Contract", "$35/hr", "Remote",
    "Redesign our marketing landing page.", "closed",
)
job_illustrations_kite = get_or_create_job(
    kite, "Mobile App Illustrations", "Design", "Freelance", "$30/hr", "Remote",
    "Create a set of onboarding illustrations.",
)

# --- Jordan's applications (shown on the applicant dashboard) ---
get_or_create_application(job_product_designer, jordan, "pending")
get_or_create_application(job_uiux, jordan, "accepted")
get_or_create_application(job_landing_solace, jordan, "rejected")
get_or_create_application(job_illustrations_kite, jordan, "pending")

# --- Reviews for Jordan ---
if not db.query(models.Review).filter(models.Review.applicant_id == jordan.id).first():
    db.add(models.Review(
        applicant_id=jordan.id, employer_id=brightfield.id, job_id=job_uiux.id, rating=5,
        comment="Delivered ahead of schedule and communicated clearly the whole way through.",
    ))
    db.add(models.Review(
        applicant_id=jordan.id, employer_id=kite.id, job_id=job_illustrations_kite.id, rating=4,
        comment="Great eye for detail -- would happily hire again for future projects.",
    ))
    db.commit()

# --- Filler applicants, so the employed/unemployed chart has a realistic spread ---
random.seed(7)
filler_applicants = []
for i in range(2, 26):
    email = f"applicant{i}@demo.jomp"
    is_employed = random.random() < 0.63
    user = get_or_create_user("applicant", f"Applicant {i}", email, "Nigeria", "password123", is_employed=is_employed)
    filler_applicants.append(user)

# --- Filler applications on Nova's active jobs, for realistic accept/reject counts ---
statuses = ["pending"] * 4 + ["accepted"] * 4 + ["rejected"] * 2
random.shuffle(statuses)
nova_jobs = [job_product_designer, job_frontend_nova]
for idx, applicant in enumerate(filler_applicants[:10]):
    job = nova_jobs[idx % len(nova_jobs)]
    status = statuses[idx % len(statuses)]
    get_or_create_application(job, applicant, status)

db.close()

print("Done. Demo accounts:")
print("  Employer  -> email: employer@demo.jomp  / password: password123")
print("  Applicant -> email: applicant@demo.jomp / password: password123")
