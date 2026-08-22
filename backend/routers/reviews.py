from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.db.database import get_db
from backend.db import models as db_models
from backend.models.schemas import ReviewCreate, ReviewOut

router = APIRouter(prefix="/api/reviews", tags=["reviews"])


def _log_event(db: Session, submission_id: int, event_type: str, data: dict, actor: str = "reviewer"):
    log = db_models.AuditLog(
        submission_id=submission_id,
        event_type=event_type,
        event_data=data,
        actor=actor,
    )
    db.add(log)
    db.commit()


@router.post("/{submission_id}", response_model=ReviewOut, status_code=201)
def submit_review(
    submission_id: int,
    payload: ReviewCreate,
    db: Session = Depends(get_db),
):
    """Submit a reviewer decision for a submission. Replaces any previous review."""
    submission = db.query(db_models.Submission).filter(
        db_models.Submission.id == submission_id
    ).first()
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")

    # Remove existing review if re-reviewing
    existing = db.query(db_models.Review).filter(
        db_models.Review.submission_id == submission_id
    ).first()
    if existing:
        db.delete(existing)
        db.flush()

    analysis_id = submission.analysis.id if submission.analysis else None

    review = db_models.Review(
        submission_id=submission_id,
        analysis_id=analysis_id,
        decision=payload.decision,
        reviewer_note=payload.reviewer_note,
    )
    db.add(review)
    db.commit()
    db.refresh(review)

    _log_event(db, submission_id, "reviewed", {
        "decision": payload.decision,
        "note": payload.reviewer_note or "",
    })

    return review


@router.get("/{submission_id}", response_model=ReviewOut)
def get_review(submission_id: int, db: Session = Depends(get_db)):
    review = db.query(db_models.Review).filter(
        db_models.Review.submission_id == submission_id
    ).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    return review
