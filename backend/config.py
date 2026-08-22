"""
VERA Configuration
==================
All thresholds here are PROTOTYPE ASSUMPTIONS for demonstration purposes.
They are NOT official government procurement thresholds or regulatory requirements.
Adjust these values based on actual domain requirements before any real deployment.
"""

# ─── Risk Score Thresholds (configurable) ─────────────────────────────────────
# NOTE: These ranges are illustrative only. Not based on any official standard.
RISK_THRESHOLD_LOW_MAX = 39       # 0–39  = Low Risk
RISK_THRESHOLD_MEDIUM_MAX = 69    # 40–69 = Medium Risk
RISK_THRESHOLD_HIGH_MIN = 70      # 70–100 = High Risk

# ─── Rule Engine Thresholds (configurable) ────────────────────────────────────
PRICE_DEVIATION_MEDIUM_PCT = 15.0   # % above reference price → medium flag
PRICE_DEVIATION_HIGH_PCT = 30.0     # % above reference price → high flag

BUDGET_UTILIZATION_MEDIUM_PCT = 80.0  # % of available budget → medium flag
BUDGET_UTILIZATION_HIGH_PCT = 95.0    # % of available budget → high flag

QUANTITY_ZSCORE_THRESHOLD = 2.0       # z-score threshold for quantity anomaly
AMOUNT_ZSCORE_THRESHOLD = 2.0         # z-score threshold for amount anomaly

# ─── Scoring Weights (configurable) ───────────────────────────────────────────
ML_SCORE_WEIGHT = 0.5          # Weight of Isolation Forest score
RULE_SCORE_WEIGHT = 0.5        # Weight of rule-based score

# ─── Isolation Forest Parameters (configurable) ───────────────────────────────
IF_N_ESTIMATORS = 100
IF_CONTAMINATION = 0.15        # Assumed proportion of anomalies in training data
IF_RANDOM_STATE = 42

# ─── Database ─────────────────────────────────────────────────────────────────
DATABASE_URL = "sqlite:///./vera.db"

# ─── CORS ─────────────────────────────────────────────────────────────────────
CORS_ORIGINS = ["http://localhost:5173", "http://127.0.0.1:5173"]

# ─── App metadata ─────────────────────────────────────────────────────────────
APP_TITLE = "VERA – Verification & Risk Assessment"
APP_VERSION = "0.1.0-mvp"
APP_DESCRIPTION = (
    "VERA is a decision-support prototype for public procurement verification. "
    "AI recommends. Human decides."
)
