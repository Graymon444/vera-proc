"""
Risk scorer — combines ML score and rule score into a final 0–100 risk score.

Architecture is modular: swap ML model or rule engine independently.
"""
from __future__ import annotations
from sqlalchemy.orm import Session
from backend.config import (
    ML_SCORE_WEIGHT,
    RULE_SCORE_WEIGHT,
    RISK_THRESHOLD_LOW_MAX,
    RISK_THRESHOLD_HIGH_MIN,
)
from backend.db import models as db_models
from backend.risk_engine.rules import run_all_rules
from backend.risk_engine.ml_model import get_model, extract_features, train_model_on_data
from backend.risk_engine.explainer import generate_explanation


def _get_risk_level(score: float) -> str:
    """
    Map 0–100 score to Low / Medium / High.
    Thresholds are configurable — see config.py.
    """
    if score <= RISK_THRESHOLD_LOW_MAX:
        return "Low"
    if score < RISK_THRESHOLD_HIGH_MIN:
        return "Medium"
    return "High"


def _get_historical_context(
    db: Session,
    category: str,
) -> tuple[list[float], list[float]]:
    """Fetch historical quantities and amounts for the same category."""
    rows = (
        db.query(db_models.Submission.quantity, db_models.Submission.requested_amount)
        .filter(db_models.Submission.category == category)
        .all()
    )
    quantities = [r.quantity for r in rows]
    amounts = [r.requested_amount for r in rows]
    return quantities, amounts


def _ensure_model_trained(db: Session) -> None:
    """Train the Isolation Forest if it hasn't been trained yet."""
    model = get_model()
    if model._fitted:
        return

    rows = db.query(db_models.Submission).all()
    if len(rows) < 10:
        # Not enough data — model stays untrained; ML score = 50 (neutral)
        return

    records = [
        {
            "unit_price": r.unit_price,
            "reference_price": r.reference_price,
            "requested_amount": r.requested_amount,
            "budget_available": r.budget_available,
            "quantity": r.quantity,
        }
        for r in rows
    ]
    train_model_on_data(records)


def analyze_submission(
    submission: db_models.Submission,
    db: Session,
) -> db_models.RiskAnalysis:
    """
    Full analysis pipeline for one submission:
      1. Rule engine
      2. ML model (if trained)
      3. Combined score
      4. Explanation
      5. Persist RiskAnalysis record
    """
    _ensure_model_trained(db)

    # ── Step 1: Rule engine ──────────────────────────────────────────────────
    hist_quantities, hist_amounts = _get_historical_context(db, submission.category)
    flags, rule_score = run_all_rules(
        unit_price=submission.unit_price,
        reference_price=submission.reference_price,
        requested_amount=submission.requested_amount,
        budget_available=submission.budget_available,
        quantity=submission.quantity,
        historical_quantities=hist_quantities,
        historical_amounts=hist_amounts,
    )

    # ── Step 2: ML model ─────────────────────────────────────────────────────
    model = get_model()
    if model._fitted:
        features = extract_features(
            submission.unit_price,
            submission.reference_price,
            submission.requested_amount,
            submission.budget_available,
            submission.quantity,
        )
        ml_score = model.normalized_score(features)
        if_raw = model.raw_score(features)
    else:
        ml_score = 50.0   # neutral when insufficient training data
        if_raw = None

    # ── Step 3: Combined score ───────────────────────────────────────────────
    # When rules fire strongly, give them more weight — explicit evidence
    # should dominate over statistical anomaly detection.
    if rule_score >= 70:
        # Strong rule signal: rules dominate 70/30
        combined = 0.30 * ml_score + 0.70 * rule_score
    elif rule_score >= 40:
        # Moderate signal: balanced
        combined = 0.45 * ml_score + 0.55 * rule_score
    else:
        # Weak/no rule signal: ML has more say
        combined = 0.60 * ml_score + 0.40 * rule_score

    final_score = round(min(combined, 100.0), 1)
    risk_level = _get_risk_level(final_score)

    # ── Step 4: Explanation ──────────────────────────────────────────────────
    explanation = generate_explanation(risk_level, final_score, flags)

    # ── Step 5: Persist ──────────────────────────────────────────────────────
    # Remove existing analysis if re-analyzing
    existing = (
        db.query(db_models.RiskAnalysis)
        .filter(db_models.RiskAnalysis.submission_id == submission.id)
        .first()
    )
    if existing:
        db.delete(existing)
        db.flush()

    analysis = db_models.RiskAnalysis(
        submission_id=submission.id,
        risk_score=final_score,
        risk_level=risk_level,
        if_raw_score=if_raw,
        rule_score=round(rule_score, 1),
        rule_flags=flags,
        explanation=explanation,
    )
    db.add(analysis)
    db.commit()
    db.refresh(analysis)
    return analysis
