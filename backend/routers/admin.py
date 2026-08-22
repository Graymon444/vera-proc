"""
Admin endpoints — for demo/development use only.
Not intended for production deployment.
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from backend.db.database import get_db
from backend.db import models as db_models
from backend.risk_engine.scorer import analyze_submission
from backend.data_generators.gov_procurement_generator import generate_dataset

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.post("/seed-procurement-data")
def seed_gov_procurement_data(
    count: int = Query(default=60, ge=10, le=150),
    risk_distribution: str = Query(default="realistic"),
    clear: bool = Query(default=False),
    db: Session = Depends(get_db),
):
    """
    Seed the database with synthetic Indonesian government procurement records.

    ⚠ ALL GENERATED DATA IS SYNTHETIC AND FICTIONAL.
    Records are clearly labeled with is_synthetic=True and [SYNTHETIC-ID] prefix.
    Risk distribution: ~30% Low / ~50% Medium / ~20% High.
    """
    if clear:
        db.query(db_models.AuditLog).delete()
        db.query(db_models.Review).delete()
        db.query(db_models.RiskAnalysis).delete()
        db.query(db_models.Submission).delete()
        db.commit()

    records = generate_dataset(count=count)

    created = 0
    risk_counts = {"Low": 0, "Medium": 0, "High": 0}

    for record in records:
        sub = db_models.Submission(**record, is_synthetic=True)
        db.add(sub)
        db.commit()
        db.refresh(sub)

        analysis = analyze_submission(sub, db)
        risk_counts[analysis.risk_level] = risk_counts.get(analysis.risk_level, 0) + 1

        log = db_models.AuditLog(
            submission_id=sub.id,
            event_type="submitted",
            event_data={"title": sub.title, "source": "gov_procurement_generator"},
            actor="system",
        )
        db.add(log)
        db.commit()
        created += 1

    return {
        "message": f"Successfully seeded {created} synthetic Indonesia gov procurement records.",
        "is_synthetic": True,
        "count": created,
        "risk_distribution": risk_counts,
        "disclaimer": (
            "All records are fictional and generated for prototype demonstration only. "
            "Ministry codes, vendor names, and NPWP numbers are not real. "
            "Do not use as evidence of any actual procurement activity."
        ),
    }
