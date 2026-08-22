from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from backend.db.database import get_db
from backend.db import models as db_models
from backend.models.schemas import SubmissionCreate, SubmissionOut, SubmissionWithAnalysis
from backend.risk_engine.scorer import analyze_submission
import datetime

router = APIRouter(prefix="/api/submissions", tags=["submissions"])


def _log_event(db: Session, submission_id: int, event_type: str, data: dict, actor: str = "system"):
    log = db_models.AuditLog(
        submission_id=submission_id,
        event_type=event_type,
        event_data=data,
        actor=actor,
    )
    db.add(log)
    db.commit()


@router.post("", response_model=SubmissionWithAnalysis, status_code=201)
def create_submission(payload: SubmissionCreate, db: Session = Depends(get_db)):
    """Create a new procurement submission and automatically run risk analysis."""
    submission = db_models.Submission(**payload.model_dump(), is_synthetic=False)
    db.add(submission)
    db.commit()
    db.refresh(submission)

    _log_event(db, submission.id, "submitted", {"title": submission.title}, "system")

    # Auto-trigger analysis
    analysis = analyze_submission(submission, db)
    _log_event(db, submission.id, "analyzed", {
        "risk_score": analysis.risk_score,
        "risk_level": analysis.risk_level,
        "flag_count": len(analysis.rule_flags or []),
    }, "system")

    db.refresh(submission)
    return SubmissionWithAnalysis(
        submission=SubmissionOut.model_validate(submission),
        analysis=analysis,
        review=submission.review,
    )


@router.get("", response_model=list[SubmissionWithAnalysis])
def list_submissions(
    risk_level: Optional[str] = Query(None, pattern="^(Low|Medium|High)$"),
    reviewed: Optional[bool] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
):
    """List submissions with optional filters. Sorted by risk score descending."""
    query = db.query(db_models.Submission)

    if risk_level:
        query = query.join(db_models.RiskAnalysis).filter(
            db_models.RiskAnalysis.risk_level == risk_level
        )
    if reviewed is not None:
        if reviewed:
            query = query.join(db_models.Review)
        else:
            query = query.outerjoin(db_models.Review).filter(db_models.Review.id == None)

    submissions = query.offset(skip).limit(limit).all()

    # Sort by risk score descending (high risk first)
    submissions.sort(
        key=lambda s: s.analysis.risk_score if s.analysis else 0,
        reverse=True
    )

    return [
        SubmissionWithAnalysis(
            submission=SubmissionOut.model_validate(s),
            analysis=s.analysis,
            review=s.review,
        )
        for s in submissions
    ]


@router.get("/{submission_id}", response_model=SubmissionWithAnalysis)
def get_submission(submission_id: int, db: Session = Depends(get_db)):
    submission = db.query(db_models.Submission).filter(
        db_models.Submission.id == submission_id
    ).first()
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    return SubmissionWithAnalysis(
        submission=SubmissionOut.model_validate(submission),
        analysis=submission.analysis,
        review=submission.review,
    )
