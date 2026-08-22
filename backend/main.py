"""
VERA – Verification & Risk Assessment
FastAPI application entry point.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.config import APP_TITLE, APP_VERSION, APP_DESCRIPTION, CORS_ORIGINS
from backend.db.database import engine
from backend.db import models as db_models
from backend.routers import submissions, reviews, audit, dashboard, admin

# Create tables
db_models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=APP_TITLE,
    version=APP_VERSION,
    description=APP_DESCRIPTION,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(submissions.router)
app.include_router(reviews.router)
app.include_router(audit.router)
app.include_router(dashboard.router)
app.include_router(admin.router)


@app.get("/api/health")
def health_check():
    return {"status": "ok", "app": APP_TITLE, "version": APP_VERSION}


@app.post("/api/seed", status_code=200, tags=["dev"])
def seed_demo_data(clear: bool = False):
    """
    Populate the database with synthetic demo data.
    All seeded records are clearly marked is_synthetic=True.
    ⚠ This endpoint is for development/demo only.
    """
    from backend.db.database import SessionLocal
    from backend.seed_data import seed_database
    db = SessionLocal()
    try:
        count = seed_database(db, clear_existing=clear)
        return {"message": f"Seeded {count} synthetic records.", "is_synthetic": True}
    finally:
        db.close()
