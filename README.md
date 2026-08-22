# VERA — Verification & Risk Assessment

> **AI recommends. Human decides.**

VERA is an AI-assisted decision-support prototype for public procurement verification and risk prioritization. It helps reviewers identify procurement submissions that may require additional attention before approval.

> ⚠ **Prototype Disclaimer:** VERA is a research and competition prototype. All risk thresholds, scoring weights, and anomaly indicators are configurable assumptions — not official government procurement standards. All demo data is fully synthetic and fictional.

---

## What VERA Does

Public procurement involves large volumes of submissions, vendors, prices, and budgets. Manual review makes it difficult to know *which* submissions need closer attention.

VERA adds an AI-assisted verification layer that:

- Analyzes each procurement submission for potential anomalies
- Assigns a normalized risk score (0–100)
- Explains *why* a submission was flagged, in plain language
- Prioritizes the review queue by risk level
- Lets a human reviewer make the final decision
- Logs every action for full auditability

**VERA does NOT:**
- Automatically approve or reject submissions
- Determine whether fraud or corruption has occurred
- Replace human judgment

---

## Core Workflow

```
Procurement Submission
        ↓
  Data Validation
        ↓
  Risk / Anomaly Analysis
   ├─ Rule Engine (5 indicators)
   └─ Isolation Forest (ML)
        ↓
  Risk Score (0–100)
        ↓
  Plain-Language Explanation
        ↓
  Human Reviewer Decision
        ↓
  Audit Log
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Tailwind CSS, Recharts, Vite |
| Backend | Python 3.13, FastAPI, SQLAlchemy |
| Database | SQLite (easily migratable to PostgreSQL) |
| AI/ML | scikit-learn — Isolation Forest |
| Risk Rules | Custom rule engine (price deviation, budget utilization, quantity anomaly, amount consistency) |

---

## Project Structure

```
vera/
├── backend/
│   ├── main.py              # FastAPI entry point
│   ├── config.py            # Configurable thresholds (NOT official standards)
│   ├── db/                  # SQLAlchemy models + database setup
│   ├── models/              # Pydantic schemas
│   ├── risk_engine/
│   │   ├── rules.py         # Rule-based indicators
│   │   ├── ml_model.py      # Isolation Forest wrapper
│   │   ├── scorer.py        # Combined scoring pipeline
│   │   └── explainer.py     # Plain-language explanation generator
│   ├── routers/             # API route handlers
│   └── seed_data.py         # Synthetic demo data generator
└── frontend/
    └── src/
        ├── pages/           # Dashboard, Queue, Submit, ReviewDetail, AuditLog
        ├── components/      # RiskScoreCard, RiskIndicators, ReviewPanel, NavBar, etc.
        └── api/             # Axios API client
```

---

## Getting Started

### Prerequisites
- Python 3.11+ (with pip)
- Node.js 18+

### 1. Install backend dependencies

```bash
cd vera
pip install -r backend/requirements.txt
```

### 2. Start the backend

```bash
# Windows — double-click:
start_backend.bat

# Or manually:
python -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```

### 3. Install and start the frontend

```bash
cd frontend
npm install
npm run dev
```

### 4. Open the app

- Frontend: http://localhost:5173
- API docs: http://127.0.0.1:8000/docs

### 5. Load demo data

Click **"Load Demo Data"** on the Dashboard, or call:
```
POST http://127.0.0.1:8000/api/seed
```

> All seeded records are clearly marked as synthetic demo data (`is_synthetic: true`).

---

## Risk Analysis

### Rule-Based Indicators

| Indicator | Description |
|-----------|-------------|
| Price Deviation | Unit price vs. reference/market price |
| Budget Utilization | Requested amount as % of available budget |
| Amount Inconsistency | Requested amount vs. quantity × unit price |
| Quantity Anomaly | Statistical outlier vs. historical quantities (z-score) |
| Amount Anomaly | Statistical outlier vs. historical amounts (z-score) |

### Risk Score

```
Final Score = 50% × ML Score + 50% × Rule Score
```

| Score | Level |
|-------|-------|
| 0 – 39 | 🟢 Low |
| 40 – 69 | 🟡 Medium |
| 70 – 100 | 🔴 High |

> Thresholds are configurable prototype assumptions — see `backend/config.py`.

### Language Policy

VERA uses carefully hedged language throughout:

✅ "Potential risk indicator detected"  
✅ "Review recommended"  
✅ "Statistically unusual"  
✅ "Requires additional verification"  
❌ Never: "Fraud detected", "Corrupt", "Automatically rejected"

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/submissions` | Create submission + auto-analyze |
| `GET` | `/api/submissions` | List all submissions |
| `GET` | `/api/submissions/{id}` | Get single submission |
| `POST` | `/api/reviews/{id}` | Submit reviewer decision |
| `GET` | `/api/dashboard/stats` | Dashboard statistics |
| `GET` | `/api/audit` | Audit log |
| `POST` | `/api/seed` | Load synthetic demo data |

Full interactive docs: http://127.0.0.1:8000/docs

---

## Design Philosophy

The UI is inspired by the usability principles of modern mobile-first enterprise dashboards — clean, spacious, and approachable. Key principles:

- Information feels approachable, not technical
- Risk assessment is clearly labelled as AI advisory
- Human reviewer workflow is always front and center
- Progressive disclosure for complex information
- Consistent spacing, typography, and component behavior

---

---

## Government Procurement Context (Indonesia)

VERA is designed with Indonesian public procurement in mind, referencing the LPSE (Layanan Pengadaan Secara Elektronik) ecosystem.

### How Indonesian Procurement Works

| Layer | Description |
|-------|-------------|
| **LPSE** | Online procurement system (e-Procurement) managed by LKPP |
| **e-Katalog** | Government product/service catalog with reference prices |
| **SPSE** | System for Electronic Procurement Services |
| **Satker** | Budget-holding work unit (ministry/agency) |
| **DIPA** | State Budget Implementation List (per agency, per year) |

VERA operates **after LPSE submission** — it flags high-risk submissions for human review **before final approval**, without disrupting the existing workflow.

### 6 Fraud Patterns VERA Detects

| # | Pattern | Signal |
|---|---------|--------|
| 1 | **Price Markup** | Unit price 40%+ above e-Katalog reference |
| 2 | **Vendor Concentration** | Same vendor wins 5+ contracts in same ministry |
| 3 | **Budget Fragmentation** | 1 project split into many micro-purchases to avoid bidding threshold |
| 4 | **Vague Specification** | No measurable deliverable, KPI, or timeline |
| 5 | **Budget Misalignment** | Requested amount exceeds allocated DIPA budget |
| 6 | **e-Katalog Bypass** | Item available in e-Katalog but procured outside it without justification |

**Example high-risk submission:**
> PT Terpadu Sejahtera — 8 contracts in Kemenkeu, Rp 485.000.000 bid for "Jasa Konsultansi Pendukung", no e-Katalog reference, unit price 67% above market → **Risk Score: 82 / 100**

---

## Model Validation

VERA includes a model validation endpoint that measures internal consistency between the ML model and the rule engine.

### What R² Means Here

```
R² = correlation between ML anomaly score and rule-based score
```

| R² Range | Interpretation |
|----------|---------------|
| ≥ 0.80 | Strong — ML detects same patterns as rules |
| 0.60–0.79 | Moderate — ML mostly agrees, adds some extra signal |
| 0.40–0.59 | Weak — ML and rules diverging |
| < 0.40 | Poor — ML needs retraining or more data |

**Example output:**
```json
{
  "r2_score": 0.82,
  "alignment_level": "Strong",
  "interpretation": "R² = 0.82 — Strong alignment. The ML model detects largely the same patterns as the rule engine.",
  "sample_count": 60
}
```

**Important:** R² here measures *internal consistency*, not ground-truth fraud detection accuracy. No labeled fraud data is used. This is a prototype.

**Endpoint:** `GET /api/dashboard/model-eval`

---

## How VERA Fits Into the Indonesian System

```
Procurement Officer submits via LPSE
              ↓
        VERA receives submission
              ↓
   Rule Engine + Isolation Forest analysis
              ↓
        Risk Score assigned (0–100)
              ↓
   Human Reviewer sees flagged submissions
              ↓
   Reviewer decides: Verify / Flag / Dismiss
              ↓
        Audit log recorded
              ↓
   Procurement proceeds (or held for review)
```

**Key properties for Indonesian government context:**
- Non-invasive — works alongside existing LPSE, not replacing it
- Auditable — every flag has an explicit reason
- Human-in-the-loop — AI never makes the final decision
- Configurable — thresholds adapt to each ministry's budget profile
- Transparent — plain-language explanations in Bahasa Indonesia context

---

## Important Notes

- This is a **competition/research prototype**, not a production system
- Do not use with real procurement data without proper security review
- Authentication, authorization, and multi-user support are not implemented in this MVP
- All configurable thresholds are in `backend/config.py`

---

*Built for Intel AI Global Impact Festival — AI for Public Good track*
