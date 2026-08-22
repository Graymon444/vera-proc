"""
Pydantic schemas for request/response validation.
"""
from __future__ import annotations
import datetime
from typing import Any, Optional
from pydantic import BaseModel, Field, field_validator


# ─── Submission ───────────────────────────────────────────────────────────────

class SubmissionCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    category: str = Field(..., min_length=2, max_length=100)
    requested_amount: float = Field(..., gt=0)
    quantity: float = Field(..., gt=0)
    unit_price: float = Field(..., gt=0)
    vendor_name: str = Field(..., min_length=2, max_length=255)
    budget_available: float = Field(..., gt=0)
    reference_price: float = Field(..., gt=0)
    procurement_date: str = Field(..., description="ISO date string YYYY-MM-DD")
    description: Optional[str] = None
    supporting_info: Optional[str] = None

    @field_validator("procurement_date")
    @classmethod
    def validate_date(cls, v: str) -> str:
        datetime.date.fromisoformat(v)  # raises ValueError if invalid
        return v


class SubmissionOut(BaseModel):
    id: int
    title: str
    category: str
    requested_amount: float
    quantity: float
    unit_price: float
    vendor_name: str
    budget_available: float
    reference_price: float
    procurement_date: str
    description: Optional[str]
    supporting_info: Optional[str]
    submitted_at: datetime.datetime
    is_synthetic: bool

    model_config = {"from_attributes": True}


# ─── Risk Indicator (embedded in analysis) ────────────────────────────────────

class RiskFlag(BaseModel):
    indicator_type: str       # e.g. "price_deviation"
    label: str                # Human-readable short label
    value: float
    threshold: float
    deviation_pct: Optional[float] = None
    severity: str             # low | medium | high


# ─── Risk Analysis ────────────────────────────────────────────────────────────

class RiskAnalysisOut(BaseModel):
    id: int
    submission_id: int
    risk_score: float
    risk_level: str
    if_raw_score: Optional[float]
    rule_score: Optional[float]
    rule_flags: list[dict[str, Any]]
    explanation: Optional[str]
    analyzed_at: datetime.datetime

    model_config = {"from_attributes": True}


# ─── Review ───────────────────────────────────────────────────────────────────

class ReviewCreate(BaseModel):
    decision: str = Field(..., pattern="^(Verified|Needs Further Review|Dismissed)$")
    reviewer_note: Optional[str] = None


class ReviewOut(BaseModel):
    id: int
    submission_id: int
    analysis_id: Optional[int]
    decision: str
    reviewer_note: Optional[str]
    reviewed_at: datetime.datetime

    model_config = {"from_attributes": True}


# ─── Audit ────────────────────────────────────────────────────────────────────

class AuditLogOut(BaseModel):
    id: int
    submission_id: Optional[int]
    event_type: str
    event_data: dict[str, Any]
    actor: Optional[str]
    timestamp: datetime.datetime

    model_config = {"from_attributes": True}


# ─── Dashboard ────────────────────────────────────────────────────────────────

class DashboardStats(BaseModel):
    total_submissions: int
    high_risk: int
    medium_risk: int
    low_risk: int
    pending_review: int
    reviewed: int
    recent_analyses: list[dict[str, Any]]


# ─── Combined submission + analysis (for queue/detail views) ──────────────────

class SubmissionWithAnalysis(BaseModel):
    submission: SubmissionOut
    analysis: Optional[RiskAnalysisOut]
    review: Optional[ReviewOut]

    model_config = {"from_attributes": True}
