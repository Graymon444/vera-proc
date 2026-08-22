from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.db.database import get_db
from backend.db import models as db_models
from backend.models.schemas import DashboardStats

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)):
    """Return aggregated statistics for the dashboard overview."""
    total = db.query(db_models.Submission).count()

    high = (
        db.query(db_models.RiskAnalysis)
        .filter(db_models.RiskAnalysis.risk_level == "High")
        .count()
    )
    medium = (
        db.query(db_models.RiskAnalysis)
        .filter(db_models.RiskAnalysis.risk_level == "Medium")
        .count()
    )
    low = (
        db.query(db_models.RiskAnalysis)
        .filter(db_models.RiskAnalysis.risk_level == "Low")
        .count()
    )

    reviewed = db.query(db_models.Review).count()
    pending = total - reviewed

    # Recent 10 analyses for the dashboard feed
    recent_rows = (
        db.query(db_models.Submission, db_models.RiskAnalysis)
        .join(db_models.RiskAnalysis, db_models.Submission.id == db_models.RiskAnalysis.submission_id)
        .order_by(db_models.RiskAnalysis.analyzed_at.desc())
        .limit(10)
        .all()
    )

    recent = [
        {
            "submission_id": s.id,
            "title": s.title,
            "category": s.category,
            "vendor_name": s.vendor_name,
            "risk_score": a.risk_score,
            "risk_level": a.risk_level,
            "analyzed_at": a.analyzed_at.isoformat(),
            "is_reviewed": s.review is not None,
            "is_synthetic": s.is_synthetic,
        }
        for s, a in recent_rows
    ]

    return DashboardStats(
        total_submissions=total,
        high_risk=high,
        medium_risk=medium,
        low_risk=low,
        pending_review=pending,
        reviewed=reviewed,
        recent_analyses=recent,
    )
