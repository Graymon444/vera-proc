"""
Isolation Forest wrapper for VERA anomaly detection.

Architecture note:
  This module is intentionally thin. The model can be swapped for any
  other sklearn-compatible estimator (e.g., LocalOutlierFactor, OneClassSVM)
  without changing the rest of the pipeline.

IMPORTANT:
  The Isolation Forest model here is trained on SYNTHETIC data for prototype
  demonstration only. Scores are indicative, not authoritative findings.
"""
from __future__ import annotations
import numpy as np
from sklearn.ensemble import IsolationForest
from backend.config import IF_N_ESTIMATORS, IF_CONTAMINATION, IF_RANDOM_STATE

# ─── Feature extraction ───────────────────────────────────────────────────────

def extract_features(
    unit_price: float,
    reference_price: float,
    requested_amount: float,
    budget_available: float,
    quantity: float,
) -> np.ndarray:
    """
    Build the feature vector for a single submission.
    Features are chosen for interpretability, not just predictive power.
    """
    price_ratio = unit_price / reference_price if reference_price > 0 else 1.0
    budget_ratio = requested_amount / budget_available if budget_available > 0 else 1.0
    log_amount = np.log1p(requested_amount)
    log_quantity = np.log1p(quantity)
    log_unit_price = np.log1p(unit_price)

    return np.array([[
        price_ratio,
        budget_ratio,
        log_amount,
        log_quantity,
        log_unit_price,
    ]])


# ─── Model wrapper ────────────────────────────────────────────────────────────

class VERAIsolationForest:
    """
    Thin wrapper around IsolationForest.
    Exposes fit() and score() with a normalized 0–100 output.
    """

    def __init__(self) -> None:
        self._model = IsolationForest(
            n_estimators=IF_N_ESTIMATORS,
            contamination=IF_CONTAMINATION,
            random_state=IF_RANDOM_STATE,
        )
        self._fitted = False

    def fit(self, X: np.ndarray) -> None:
        self._model.fit(X)
        self._fitted = True

    def raw_score(self, X: np.ndarray) -> float:
        """
        Returns the raw anomaly score from decision_function.
        More negative = more anomalous.
        """
        if not self._fitted:
            raise RuntimeError("Model not fitted yet.")
        return float(self._model.decision_function(X)[0])

    def normalized_score(self, X: np.ndarray) -> float:
        """
        Normalizes the Isolation Forest decision score to 0–100.
        Higher score = more anomalous (higher risk).

        decision_function returns values roughly in [-0.5, 0.5].
        We map [-0.5, 0.5] → [100, 0] and clip.
        """
        raw = self.raw_score(X)
        # Invert: negative raw score → high risk score
        normalized = (-raw + 0.5) * 100.0
        return float(np.clip(normalized, 0.0, 100.0))


# ─── Singleton instance ───────────────────────────────────────────────────────

_model_instance: VERAIsolationForest | None = None


def get_model() -> VERAIsolationForest:
    global _model_instance
    if _model_instance is None:
        _model_instance = VERAIsolationForest()
    return _model_instance


def train_model_on_data(records: list[dict]) -> VERAIsolationForest:
    """
    Train the model on a list of submission dicts.
    Each dict must have: unit_price, reference_price, requested_amount,
                         budget_available, quantity
    """
    model = get_model()
    X = np.vstack([
        extract_features(
            r["unit_price"], r["reference_price"],
            r["requested_amount"], r["budget_available"], r["quantity"]
        )
        for r in records
    ])
    model.fit(X)
    return model
