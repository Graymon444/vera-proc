"""
SQLAlchemy ORM models for VERA.
All 'is_synthetic' flagged records are demo/test data — NOT real procurement data.
"""
import datetime
from sqlalchemy import (
    Column, Integer, Float, String, Text, Boolean,
    DateTime, ForeignKey, JSON
)
from sqlalchemy.orm import relationship
from backend.db.database import Base


class Submission(Base):
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)
    requested_amount = Column(Float, nullable=False)
    quantity = Column(Float, nullable=False)
    unit_price = Column(Float, nullable=False)
    vendor_name = Column(String(255), nullable=False)
    budget_available = Column(Float, nullable=False)
    reference_price = Column(Float, nullable=False)
    procurement_date = Column(String(20), nullable=False)   # ISO date string
    description = Column(Text, nullable=True)
    supporting_info = Column(Text, nullable=True)
    submitted_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Clearly marks demo/test records — never present synthetic data as real
    is_synthetic = Column(Boolean, default=False)

    # Relationships
    analysis = relationship("RiskAnalysis", back_populates="submission", uselist=False)
    review = relationship("Review", back_populates="submission", uselist=False)
    audit_events = relationship("AuditLog", back_populates="submission")


class RiskAnalysis(Base):
    __tablename__ = "risk_analyses"

    id = Column(Integer, primary_key=True, index=True)
    submission_id = Column(Integer, ForeignKey("submissions.id"), nullable=False, unique=True)

    risk_score = Column(Float, nullable=False)          # 0–100 normalized
    risk_level = Column(String(20), nullable=False)     # Low / Medium / High
    if_raw_score = Column(Float, nullable=True)         # Isolation Forest raw anomaly score
    rule_score = Column(Float, nullable=True)           # Rule-based sub-score (0–100)
    rule_flags = Column(JSON, default=list)             # List of triggered rule dicts
    explanation = Column(Text, nullable=True)           # Human-readable explanation
    analyzed_at = Column(DateTime, default=datetime.datetime.utcnow)

    submission = relationship("Submission", back_populates="analysis")


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    submission_id = Column(Integer, ForeignKey("submissions.id"), nullable=False, unique=True)
    analysis_id = Column(Integer, ForeignKey("risk_analyses.id"), nullable=True)

    # Decision options — final decision belongs to the human reviewer
    decision = Column(String(50), nullable=False)       # Verified | Needs Further Review | Dismissed
    reviewer_note = Column(Text, nullable=True)
    reviewed_at = Column(DateTime, default=datetime.datetime.utcnow)

    submission = relationship("Submission", back_populates="review")


class AuditLog(Base):
    __tablename__ = "audit_log"

    id = Column(Integer, primary_key=True, index=True)
    submission_id = Column(Integer, ForeignKey("submissions.id"), nullable=True)
    event_type = Column(String(50), nullable=False)     # submitted | analyzed | reviewed
    event_data = Column(JSON, default=dict)
    actor = Column(String(100), nullable=True)          # system | reviewer name
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    submission = relationship("Submission", back_populates="audit_events")
