from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from backend.db.database import get_db
from backend.db import models as db_models
from backend.models.schemas import AuditLogOut

router = APIRouter(prefix="/api/audit", tags=["audit"])


@router.get("", response_model=list[AuditLogOut])
def get_audit_log(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
):
    """Return audit log entries, most recent first."""
    logs = (
        db.query(db_models.AuditLog)
        .order_by(db_models.AuditLog.timestamp.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return logs
