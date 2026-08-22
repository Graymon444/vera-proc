"""
VERA Synthetic Demo Data Generator
====================================
⚠ ALL RECORDS IN THIS FILE ARE SYNTHETIC / FICTIONAL ⚠

This data is generated for prototype demonstration and testing ONLY.
- It does NOT represent any real government procurement.
- It does NOT represent any real vendor, agency, or transaction.
- All names, amounts, dates, and categories are randomly constructed.
- Records are clearly marked with is_synthetic=True in the database.

Do NOT use this data as evidence of any real-world procurement anomaly.
"""
import datetime
import random
from sqlalchemy.orm import Session
from backend.db import models as db_models
from backend.risk_engine.scorer import analyze_submission

random.seed(42)

CATEGORIES = [
    "IT Equipment", "Office Supplies", "Medical Supplies",
    "Construction", "Consulting Services", "Vehicle Fleet",
    "Software Licenses", "Furniture", "Security Services", "Catering",
]

VENDORS = [
    "Alpha Tech Solutions", "BrightPath Supplies Co.", "CornerStone Builders",
    "Delta Office Depot", "Evergreen Consulting", "FortLine Security",
    "GreenField IT", "HorizonMed Supplies", "IronBridge Construction",
    "JetSet Catering Services", "Keystone Software Ltd.", "Luminary Furniture",
    "MegaDrive Vehicles", "NorthStar Consulting", "Optimal Systems Inc.",
]

# Reference prices per category (synthetic baseline)
REFERENCE_PRICES = {
    "IT Equipment": 1500.0,
    "Office Supplies": 25.0,
    "Medical Supplies": 80.0,
    "Construction": 5000.0,
    "Consulting Services": 2000.0,
    "Vehicle Fleet": 30000.0,
    "Software Licenses": 500.0,
    "Furniture": 350.0,
    "Security Services": 1200.0,
    "Catering": 60.0,
}

BUDGETS = {
    "IT Equipment": 500000,
    "Office Supplies": 50000,
    "Medical Supplies": 200000,
    "Construction": 2000000,
    "Consulting Services": 300000,
    "Vehicle Fleet": 1000000,
    "Software Licenses": 150000,
    "Furniture": 80000,
    "Security Services": 250000,
    "Catering": 30000,
}


def _make_normal_submission(category: str, idx: int) -> dict:
    ref = REFERENCE_PRICES[category]
    unit_price = ref * random.uniform(0.90, 1.10)   # within ±10% — normal
    quantity = random.randint(1, 50)
    return {
        "title": f"[SYNTHETIC] {category} Procurement #{idx:03d}",
        "category": category,
        "quantity": float(quantity),
        "unit_price": round(unit_price, 2),
        "requested_amount": round(unit_price * quantity, 2),
        "vendor_name": random.choice(VENDORS),
        "budget_available": float(BUDGETS[category]),
        "reference_price": ref,
        "procurement_date": (
            datetime.date(2025, 1, 1) + datetime.timedelta(days=random.randint(0, 365))
        ).isoformat(),
        "description": f"Routine procurement of {category.lower()} items. [SYNTHETIC RECORD]",
        "supporting_info": None,
    }


def _make_anomalous_submission(category: str, idx: int, anomaly_type: str) -> dict:
    """Create intentionally anomalous records to demonstrate detection."""
    ref = REFERENCE_PRICES[category]
    base = _make_normal_submission(category, idx)
    base["title"] = f"[SYNTHETIC-ANOMALY] {category} #{idx:03d} ({anomaly_type})"
    base["description"] = (
        f"⚠ SYNTHETIC ANOMALY RECORD — {anomaly_type}. "
        "This record was deliberately created to demonstrate VERA's detection capabilities. "
        "It does NOT represent any real procurement."
    )

    if anomaly_type == "high_price":
        base["unit_price"] = round(ref * random.uniform(1.45, 2.0), 2)
        base["requested_amount"] = round(base["unit_price"] * base["quantity"], 2)

    elif anomaly_type == "budget_overrun":
        budget = BUDGETS[category]
        base["requested_amount"] = round(budget * random.uniform(0.92, 1.05), 2)
        base["quantity"] = round(base["requested_amount"] / base["unit_price"], 2)

    elif anomaly_type == "unusual_quantity":
        base["quantity"] = float(random.randint(300, 1000))
        base["requested_amount"] = round(base["unit_price"] * base["quantity"], 2)

    elif anomaly_type == "amount_mismatch":
        # Amount doesn't match qty × unit_price
        base["requested_amount"] = round(base["unit_price"] * base["quantity"] * 1.35, 2)

    return base


def seed_database(db: Session, clear_existing: bool = False) -> int:
    """
    Populate the database with synthetic demo data.
    Returns number of records created.
    """
    if clear_existing:
        db.query(db_models.AuditLog).delete()
        db.query(db_models.Review).delete()
        db.query(db_models.RiskAnalysis).delete()
        db.query(db_models.Submission).delete()
        db.commit()

    records = []
    idx = 1

    # Normal submissions — 4 per category
    for category in CATEGORIES:
        for _ in range(4):
            records.append(_make_normal_submission(category, idx))
            idx += 1

    # Anomalous submissions — spread across categories
    anomaly_types = ["high_price", "budget_overrun", "unusual_quantity", "amount_mismatch"]
    for i, anomaly in enumerate(anomaly_types * 4):
        cat = CATEGORIES[i % len(CATEGORIES)]
        records.append(_make_anomalous_submission(cat, idx, anomaly))
        idx += 1

    # Shuffle order
    random.shuffle(records)

    created = 0
    for record in records:
        sub = db_models.Submission(**record, is_synthetic=True)
        db.add(sub)
        db.commit()
        db.refresh(sub)

        analyze_submission(sub, db)

        log = db_models.AuditLog(
            submission_id=sub.id,
            event_type="submitted",
            event_data={"title": sub.title, "source": "seed_data"},
            actor="system",
        )
        db.add(log)
        db.commit()
        created += 1

    print(f"[VERA Seed] Created {created} synthetic records.")
    return created
