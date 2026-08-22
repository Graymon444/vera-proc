"""
VERA Model Validation — Evaluator
===================================
Measures how well the Isolation Forest ML model aligns with the rule engine.

Method:
  - Run both rule engine and ML model on all existing submissions
  - Compute R² between rule_score and ml_score
  - R² close to 1.0 = ML learns the same patterns as explicit rules
  - R² < 0.6 = model is not well-calibrated to the rule engine

This is NOT a ground-truth accuracy metric (we have no labeled fraud data).
It measures internal consistency between the two scoring components.
"""
from __future__ import annotations
import numpy as np
from sqlalchemy.orm import Session
from backend.db import models as db_models
from backend.risk_engine.ml_model import get_model, extract_features


def compute_r2(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    """Standard R² (coefficient of determination)."""
    ss_res = np.sum((y_true - y_pred) ** 2)
    ss_tot = np.sum((y_true - np.mean(y_true)) ** 2)
    if ss_tot == 0:
        return 1.0
    return float(1 - ss_res / ss_tot)


def evaluate_model(db: Session) -> dict:
    """
    Evaluate ML vs rule alignment across all analyzed submissions.
    Returns a dict with R², sample count, and interpretation.
    """
    rows = (
        db.query(db_models.Submission, db_models.RiskAnalysis)
        .join(db_models.RiskAnalysis)
        .all()
    )

    if len(rows) < 5:
        return {
            "status": "insufficient_data",
            "message": "Need at least 5 analyzed submissions to evaluate model.",
            "sample_count": len(rows),
            "r2_score": None,
            "interpretation": None,
            "ml_trained": False,
        }

    model = get_model()
    if not model._fitted:
        return {
            "status": "model_not_trained",
            "message": "Isolation Forest has not been trained yet. Need 10+ submissions.",
            "sample_count": len(rows),
            "r2_score": None,
            "interpretation": None,
            "ml_trained": False,
        }

    rule_scores = []
    ml_scores = []

    for sub, analysis in rows:
        if analysis.rule_score is None:
            continue
        features = extract_features(
            sub.unit_price, sub.reference_price,
            sub.requested_amount, sub.budget_available, sub.quantity,
        )
        ml_score = model.normalized_score(features)
        rule_scores.append(analysis.rule_score)
        ml_scores.append(ml_score)

    if len(rule_scores) < 5:
        return {
            "status": "insufficient_data",
            "message": "Not enough scored submissions.",
            "sample_count": len(rule_scores),
            "r2_score": None,
            "interpretation": None,
            "ml_trained": True,
        }

    y_rule = np.array(rule_scores)
    y_ml = np.array(ml_scores)
    r2 = compute_r2(y_rule, y_ml)
    r2_rounded = round(r2, 4)

    if r2 >= 0.80:
        level = "Strong"
        interpretation = (
            f"R² = {r2_rounded} — Strong alignment. "
            "The ML model detects largely the same patterns as the rule engine. "
            "Both components are reinforcing each other."
        )
    elif r2 >= 0.60:
        level = "Moderate"
        interpretation = (
            f"R² = {r2_rounded} — Moderate alignment. "
            "The ML model captures most rule-based patterns but also detects "
            "additional anomalies not covered by explicit rules."
        )
    elif r2 >= 0.40:
        level = "Weak"
        interpretation = (
            f"R² = {r2_rounded} — Weak alignment. "
            "ML and rule engine are finding different patterns. "
            "Consider reviewing feature selection or rule thresholds."
        )
    else:
        level = "Poor"
        interpretation = (
            f"R² = {r2_rounded} — Poor alignment. "
            "ML model is not learning what the rules already catch. "
            "Model may need retraining with more representative data."
        )

    return {
        "status": "ok",
        "message": "Model evaluation completed successfully.",
        "sample_count": len(rule_scores),
        "r2_score": r2_rounded,
        "alignment_level": level,
        "interpretation": interpretation,
        "ml_trained": True,
        "rule_score_mean": round(float(np.mean(y_rule)), 2),
        "ml_score_mean": round(float(np.mean(y_ml)), 2),
        "rule_score_std": round(float(np.std(y_rule)), 2),
        "ml_score_std": round(float(np.std(y_ml)), 2),
        "note": (
            "R² measures internal consistency between ML and rule engine, "
            "not ground-truth fraud detection accuracy. "
            "No labeled fraud data is used in this prototype."
        ),
    }
