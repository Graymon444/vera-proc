"""
Rule-based risk indicator engine for VERA.

Each rule produces a RiskFlag dict when triggered.
Rules are intentionally simple and explainable.

IMPORTANT: Thresholds are PROTOTYPE ASSUMPTIONS — see config.py.
Do NOT treat these as official procurement compliance rules.
"""
from __future__ import annotations
import math
import statistics
from typing import Optional
from backend.config import (
    PRICE_DEVIATION_MEDIUM_PCT,
    PRICE_DEVIATION_HIGH_PCT,
    BUDGET_UTILIZATION_MEDIUM_PCT,
    BUDGET_UTILIZATION_HIGH_PCT,
    QUANTITY_ZSCORE_THRESHOLD,
    AMOUNT_ZSCORE_THRESHOLD,
)


def _severity(value: float, medium: float, high: float) -> str:
    if value >= high:
        return "high"
    if value >= medium:
        return "medium"
    return "low"


def check_price_deviation(
    unit_price: float,
    reference_price: float,
) -> Optional[dict]:
    """Flag if unit price deviates significantly from reference price."""
    if reference_price <= 0:
        return None
    deviation_pct = ((unit_price - reference_price) / reference_price) * 100

    if abs(deviation_pct) < PRICE_DEVIATION_MEDIUM_PCT:
        return None

    direction = "above" if deviation_pct > 0 else "below"
    severity = _severity(
        abs(deviation_pct),
        PRICE_DEVIATION_MEDIUM_PCT,
        PRICE_DEVIATION_HIGH_PCT,
    )
    return {
        "indicator_type": "price_deviation",
        "label": f"Unit price is {abs(deviation_pct):.1f}% {direction} the reference price",
        "value": unit_price,
        "threshold": reference_price,
        "deviation_pct": round(deviation_pct, 2),
        "severity": severity,
    }


def check_budget_utilization(
    requested_amount: float,
    budget_available: float,
) -> Optional[dict]:
    """Flag if requested amount consumes an unusually high share of budget."""
    if budget_available <= 0:
        return None
    utilization_pct = (requested_amount / budget_available) * 100

    if utilization_pct < BUDGET_UTILIZATION_MEDIUM_PCT:
        return None

    severity = _severity(
        utilization_pct,
        BUDGET_UTILIZATION_MEDIUM_PCT,
        BUDGET_UTILIZATION_HIGH_PCT,
    )
    return {
        "indicator_type": "budget_utilization",
        "label": f"Requested amount uses {utilization_pct:.1f}% of the available budget",
        "value": requested_amount,
        "threshold": budget_available,
        "deviation_pct": round(utilization_pct, 2),
        "severity": severity,
    }


def check_amount_consistency(
    requested_amount: float,
    quantity: float,
    unit_price: float,
) -> Optional[dict]:
    """Flag if requested_amount is inconsistent with quantity × unit_price."""
    expected = quantity * unit_price
    if expected <= 0:
        return None
    deviation_pct = ((requested_amount - expected) / expected) * 100

    if abs(deviation_pct) < 5.0:   # allow small rounding differences
        return None

    direction = "higher" if deviation_pct > 0 else "lower"
    return {
        "indicator_type": "amount_inconsistency",
        "label": (
            f"Requested amount is {abs(deviation_pct):.1f}% {direction} "
            f"than quantity × unit price ({expected:,.2f})"
        ),
        "value": requested_amount,
        "threshold": expected,
        "deviation_pct": round(deviation_pct, 2),
        "severity": "medium" if abs(deviation_pct) < 20 else "high",
    }


def check_quantity_anomaly(
    quantity: float,
    historical_quantities: list[float],
) -> Optional[dict]:
    """Flag if quantity is a statistical outlier vs historical data."""
    if len(historical_quantities) < 5:
        return None
    mean = statistics.mean(historical_quantities)
    stdev = statistics.stdev(historical_quantities)
    if stdev == 0:
        return None

    z = (quantity - mean) / stdev
    if abs(z) < QUANTITY_ZSCORE_THRESHOLD:
        return None

    direction = "higher" if z > 0 else "lower"
    return {
        "indicator_type": "quantity_anomaly",
        "label": (
            f"Requested quantity is statistically unusual "
            f"({direction} than expected, z-score: {z:.2f})"
        ),
        "value": quantity,
        "threshold": mean,
        "deviation_pct": round(abs(z), 2),   # reusing field for z-score
        "severity": "high" if abs(z) > 3 else "medium",
    }


def check_amount_anomaly(
    requested_amount: float,
    historical_amounts: list[float],
) -> Optional[dict]:
    """Flag if requested amount is a statistical outlier vs historical data."""
    if len(historical_amounts) < 5:
        return None
    mean = statistics.mean(historical_amounts)
    stdev = statistics.stdev(historical_amounts)
    if stdev == 0:
        return None

    z = (requested_amount - mean) / stdev
    if abs(z) < AMOUNT_ZSCORE_THRESHOLD:
        return None

    direction = "higher" if z > 0 else "lower"
    return {
        "indicator_type": "amount_anomaly",
        "label": (
            f"Requested amount is statistically unusual "
            f"({direction} than typical for this category, z-score: {z:.2f})"
        ),
        "value": requested_amount,
        "threshold": mean,
        "deviation_pct": round(abs(z), 2),
        "severity": "high" if abs(z) > 3 else "medium",
    }


def compute_rule_score(flags: list[dict]) -> float:
    """
    Convert triggered rule flags into a 0–100 rule score.
    Each severity level contributes weighted points.
    Multiple flags compound — reflects real-world co-occurrence of signals.
    Capped at 100.
    """
    severity_weights = {"high": 40, "medium": 25, "low": 10}
    base = sum(severity_weights.get(f.get("severity", "low"), 0) for f in flags)

    # Co-occurrence bonus: multiple flags together are more suspicious
    if len(flags) >= 3:
        base = base * 1.25
    elif len(flags) == 2:
        base = base * 1.10

    return min(base, 100.0)


def run_all_rules(
    unit_price: float,
    reference_price: float,
    requested_amount: float,
    budget_available: float,
    quantity: float,
    historical_quantities: list[float],
    historical_amounts: list[float],
) -> tuple[list[dict], float]:
    """
    Run all rule checks. Returns (flags, rule_score).
    """
    checks = [
        check_price_deviation(unit_price, reference_price),
        check_budget_utilization(requested_amount, budget_available),
        check_amount_consistency(requested_amount, quantity, unit_price),
        check_quantity_anomaly(quantity, historical_quantities),
        check_amount_anomaly(requested_amount, historical_amounts),
    ]
    flags = [c for c in checks if c is not None]
    score = compute_rule_score(flags)
    return flags, score
