"""
VERA — Indonesia Government Procurement Dataset Generator
==========================================================
⚠ ALL DATA IS SYNTHETIC AND FICTIONAL ⚠

Generated records simulate realistic Indonesian government procurement patterns
for prototype demonstration and model training purposes ONLY.

- Ministry codes reference real Indonesian ministry numbering (publicly available)
- Vendor names are fictional (PT/CV format)
- NPWP numbers are randomly generated (not real tax IDs)
- No real procurement transactions are represented
- All records marked is_synthetic=True

References (public information used for realistic simulation):
- LPSE (Layanan Pengadaan Secara Elektronik) system structure
- e-Katalog LKPP categories
- Perpres 16/2018 jo. Perpres 12/2021 procurement thresholds
"""
from __future__ import annotations
import random
import datetime
import math
from typing import Optional

random.seed(2025)

# ─── Ministry / Agency codes (simplified, publicly available) ────────────────
MINISTRIES = [
    {"code": "01.01", "name": "Kementerian Dalam Negeri", "short": "Kemendagri"},
    {"code": "04.01", "name": "Kementerian Pertahanan", "short": "Kemhan"},
    {"code": "06.01", "name": "Kementerian Hukum dan HAM", "short": "Kemenkumham"},
    {"code": "10.01", "name": "Kementerian Keuangan", "short": "Kemenkeu"},
    {"code": "11.01", "name": "Kementerian Pertanian", "short": "Kementan"},
    {"code": "12.01", "name": "Kementerian PUPR", "short": "PUPR"},
    {"code": "13.01", "name": "Kementerian Perhubungan", "short": "Kemenhub"},
    {"code": "14.01", "name": "Kementerian Pendidikan dan Kebudayaan", "short": "Kemendikbud"},
    {"code": "15.01", "name": "Kementerian Kesehatan", "short": "Kemenkes"},
    {"code": "16.01", "name": "Kementerian Agama", "short": "Kemenag"},
    {"code": "18.01", "name": "Kementerian Ketenagakerjaan", "short": "Kemnaker"},
    {"code": "20.01", "name": "Kementerian Sosial", "short": "Kemensos"},
    {"code": "22.01", "name": "Kementerian Lingkungan Hidup", "short": "KLHK"},
    {"code": "29.01", "name": "Kementerian BUMN", "short": "KemenBUMN"},
    {"code": "32.01", "name": "Kementerian Komunikasi dan Informatika", "short": "Kominfo"},
]

# ─── Procurement types (PBJ) ─────────────────────────────────────────────────
PROC_TYPES = ["PBJ Barang", "PBJ Jasa", "Konstruksi", "Jasa Konsultansi"]

# ─── Categories with realistic Rp price ranges ───────────────────────────────
# (ref_price_min, ref_price_max, unit, e_katalog_available)
CATEGORIES = {
    "Alat Tulis Kantor": (15_000, 500_000, "paket", True),
    "Peralatan IT": (1_500_000, 25_000_000, "unit", True),
    "Laptop": (8_000_000, 20_000_000, "unit", True),
    "Server": (30_000_000, 150_000_000, "unit", True),
    "Mebel Kantor": (500_000, 8_000_000, "unit", True),
    "Kendaraan Dinas": (150_000_000, 600_000_000, "unit", True),
    "Obat-obatan": (50_000, 2_000_000, "box", True),
    "Alat Kesehatan": (500_000, 50_000_000, "unit", True),
    "Bahan Bangunan": (200_000, 5_000_000, "m²", False),
    "Konstruksi Gedung": (500_000_000, 5_000_000_000, "paket", False),
    "Jasa Konsultansi IT": (5_000_000, 50_000_000, "hari", False),
    "Jasa Kebersihan": (3_000_000, 15_000_000, "bulan", True),
    "Jasa Keamanan": (4_000_000, 20_000_000, "bulan", True),
    "Catering/Konsumsi": (35_000, 150_000, "porsi", False),
    "Percetakan": (500_000, 10_000_000, "eksemplar", False),
    "Pelatihan/Workshop": (2_000_000, 25_000_000, "hari", False),
    "Pengadaan Software": (5_000_000, 500_000_000, "lisensi", True),
    "Pengadaan Seragam": (200_000, 1_500_000, "stel", True),
    "BBM/Bahan Bakar": (10_000, 20_000, "liter", True),
    "Jasa Audit/Konsultansi": (10_000_000, 100_000_000, "paket", False),
}

# ─── Vendor pool ─────────────────────────────────────────────────────────────
PT_NAMES = [
    "Maju Bersama", "Karya Mandiri", "Terpadu Sejahtera", "Nusantara Prima",
    "Graha Teknologi", "Cipta Solusi", "Indomitra Perkasa", "Buana Abadi",
    "Sinar Harapan", "Delta Karya", "Mega Utama", "Pratama Jaya",
    "Anugrah Mandiri", "Surya Gemilang", "Bintang Nusantara", "Wahyu Abadi",
    "Sumber Makmur", "Persada Utama", "Garuda Sakti", "Sentosa Mulia",
    "Taruna Jaya", "Artha Graha", "Duta Teknologi", "Puja Mandiri",
    "Mitra Utama", "Fajar Gemilang", "Karya Agung", "Cahaya Bangsa",
]

CV_NAMES = [
    "Berkah Abadi", "Usaha Mandiri", "Karya Baru", "Maju Jaya", "Setia Kawan",
    "Harapan Baru", "Rizki Utama", "Barokah", "Hidayah Mandiri", "Amalia Jaya",
]


def _make_vendor_name() -> str:
    if random.random() < 0.75:
        return f"PT {random.choice(PT_NAMES)} {'Tbk' if random.random() < 0.1 else random.choice(['', 'Indonesia', 'Nusantara', 'Persada'])}"
    return f"CV {random.choice(CV_NAMES)}"


def _make_npwp() -> str:
    """Generate fictional NPWP format (not a real tax ID)."""
    return f"{random.randint(10,99)}.{random.randint(100,999)}.{random.randint(100,999)}.{random.randint(1,9)}-{random.randint(100,999)}.{random.randint(100,999)}"


def _make_spse_ref(ministry_code: str) -> str:
    year = random.choice([2024, 2025])
    seq = random.randint(1000, 9999)
    return f"SPSE-{ministry_code.replace('.', '')}-{year}-{seq:04d}"


def _make_date(rush: bool = False) -> str:
    base = datetime.date(2024, 1, 1)
    if rush:
        # Rush: date very close to fiscal year end (Oct-Dec) or start
        base = datetime.date(2024, random.choice([11, 12]), random.randint(1, 28))
    else:
        base = base + datetime.timedelta(days=random.randint(0, 364))
    return base.isoformat()


def _make_budget(ref_price: float, quantity: float, utilization_target: float) -> float:
    """Calculate budget so that utilization hits the target percentage."""
    total_cost = ref_price * quantity
    budget = total_cost / utilization_target
    # Round to nearest million Rp
    return round(budget / 1_000_000) * 1_000_000


# ─── Risk pattern factories ───────────────────────────────────────────────────

def _low_risk_record(idx: int, vendor_history: dict) -> dict:
    """Normal, clean procurement — 30% of dataset."""
    ministry = random.choice(MINISTRIES)
    category = random.choice(list(CATEGORIES.keys()))
    ref_min, ref_max, unit, has_katalog = CATEGORIES[category]

    ref_price = random.uniform(ref_min, ref_max)
    # Price within ±15% of reference
    unit_price = ref_price * random.uniform(0.88, 1.15)
    quantity = random.randint(1, 30)
    requested_amount = unit_price * quantity

    # Established vendor
    vendor = _make_vendor_name()
    vendor_history[vendor] = vendor_history.get(vendor, 0) + random.randint(3, 8)

    budget_util = random.uniform(0.72, 0.88)
    budget = _make_budget(unit_price, quantity, budget_util)

    return {
        "title": f"[SYNTHETIC-ID] Pengadaan {category} — {ministry['short']} #{idx:03d}",
        "category": category,
        "quantity": float(quantity),
        "unit_price": round(unit_price, 0),
        "requested_amount": round(requested_amount, 0),
        "vendor_name": vendor.strip(),
        "budget_available": budget,
        "reference_price": round(ref_price, 0),
        "procurement_date": _make_date(rush=False),
        "description": (
            f"Pengadaan {category} untuk kebutuhan {ministry['name']}. "
            f"Referensi: {_make_spse_ref(ministry['code'])}. "
            f"Spesifikasi sesuai standar SNI. NPWP vendor: {_make_npwp()}. "
            f"Vendor tercatat {vendor_history[vendor]} kontrak sebelumnya. "
            f"[SYNTHETIC RECORD — NOT REAL PROCUREMENT DATA]"
        ),
        "supporting_info": (
            f"Kode Satker: {ministry['code']} | "
            f"Jenis: {random.choice(PROC_TYPES)} | "
            f"E-Katalog: {'Tersedia' if has_katalog else 'Tidak tersedia'} | "
            f"Vendor contracts: {vendor_history[vendor]} | "
            f"NPWP: Terdaftar | Bank: Terverifikasi | "
            f"Risk pattern: LOW (normal procurement)"
        ),
    }


def _medium_risk_record(idx: int, vendor_history: dict) -> dict:
    """Needs investigation — 50% of dataset."""
    ministry = random.choice(MINISTRIES)
    category = random.choice(list(CATEGORIES.keys()))
    ref_min, ref_max, unit, has_katalog = CATEGORIES[category]

    ref_price = random.uniform(ref_min, ref_max)

    risk_type = random.choice([
        "price_elevated", "new_vendor", "budget_tight", "budget_overfunded", "rush_approval"
    ])

    if risk_type == "price_elevated":
        unit_price = ref_price * random.uniform(1.22, 1.38)
        desc_note = "Harga penawaran di atas referensi pasar."
    elif risk_type == "new_vendor":
        unit_price = ref_price * random.uniform(0.95, 1.18)
        desc_note = "Vendor baru, belum ada riwayat kontrak di kementerian ini."
    elif risk_type == "budget_tight":
        unit_price = ref_price * random.uniform(0.98, 1.15)
        desc_note = "Anggaran sangat ketat, utilisasi di atas 90%."
    elif risk_type == "budget_overfunded":
        unit_price = ref_price * random.uniform(0.90, 1.10)
        desc_note = "Anggaran jauh di atas kebutuhan aktual."
    else:  # rush
        unit_price = ref_price * random.uniform(1.10, 1.30)
        desc_note = "Persetujuan dilakukan mendekati akhir tahun anggaran."

    quantity = random.randint(1, 50)
    requested_amount = unit_price * quantity

    vendor = _make_vendor_name()
    past_contracts = vendor_history.get(vendor, 0)
    if risk_type == "new_vendor":
        past_contracts = random.randint(0, 1)
    else:
        past_contracts = past_contracts + random.randint(1, 3)
    vendor_history[vendor] = past_contracts

    if risk_type == "budget_tight":
        budget_util = random.uniform(0.91, 0.99)
    elif risk_type == "budget_overfunded":
        budget_util = random.uniform(0.35, 0.55)
    else:
        budget_util = random.uniform(0.65, 0.85)
    budget = _make_budget(unit_price, quantity, budget_util)

    spse_ref = _make_spse_ref(ministry["code"]) if random.random() > 0.2 else "Tidak tersedia"
    npwp_status = "Terdaftar" if random.random() > 0.25 else "Perlu verifikasi"

    return {
        "title": f"[SYNTHETIC-ID] Pengadaan {category} — {ministry['short']} #{idx:03d}",
        "category": category,
        "quantity": float(quantity),
        "unit_price": round(unit_price, 0),
        "requested_amount": round(requested_amount, 0),
        "vendor_name": vendor.strip(),
        "budget_available": budget,
        "reference_price": round(ref_price, 0),
        "procurement_date": _make_date(rush=(risk_type == "rush_approval")),
        "description": (
            f"Pengadaan {category} — {ministry['name']}. "
            f"Referensi SPSE: {spse_ref}. {desc_note} "
            f"NPWP: {npwp_status}. "
            f"[SYNTHETIC RECORD — NOT REAL PROCUREMENT DATA]"
        ),
        "supporting_info": (
            f"Kode Satker: {ministry['code']} | "
            f"Jenis: {random.choice(PROC_TYPES)} | "
            f"E-Katalog: {'Tersedia' if has_katalog else 'Tidak tersedia'} | "
            f"Vendor contracts: {past_contracts} | "
            f"NPWP: {npwp_status} | "
            f"Risk pattern: MEDIUM ({risk_type})"
        ),
    }


def _high_risk_record(idx: int, vendor_history: dict, fragmentation_group: Optional[str] = None) -> dict:
    """High-risk / corruption signal patterns — 20% of dataset."""
    ministry = random.choice(MINISTRIES)
    category = random.choice(list(CATEGORIES.keys()))
    ref_min, ref_max, unit, has_katalog = CATEGORIES[category]

    ref_price = random.uniform(ref_min, ref_max)

    risk_type = random.choice([
        "price_markup", "vendor_concentration", "budget_fragmentation",
        "vague_spec", "budget_misalign", "no_katalog_bypass"
    ])

    if risk_type == "price_markup":
        # 50–120% above reference — clearly high
        unit_price = ref_price * random.uniform(1.55, 2.20)
        desc = (
            "Harga penawaran jauh di atas referensi e-Katalog. "
            "Tidak ada justifikasi teknis yang memadai."
        )
        spec_quality = "Lengkap"

    elif risk_type == "vendor_concentration":
        unit_price = ref_price * random.uniform(1.35, 1.70)
        vendor = _make_vendor_name()
        vendor_history[vendor] = vendor_history.get(vendor, 0) + random.randint(5, 9)
        desc = (
            f"Vendor telah memenangkan {vendor_history[vendor]} kontrak "
            "di kementerian yang sama dalam 12 bulan terakhir. "
            "Indikasi konsentrasi vendor."
        )
        spec_quality = "Cukup"

    elif risk_type == "budget_fragmentation":
        unit_price = ref_price * random.uniform(1.10, 1.35)
        project_id = fragmentation_group or f"PROJ-{random.randint(1000,9999)}"
        desc = (
            f"Pemecahan pengadaan dari proyek {project_id}. "
            "Diduga bagian dari pemecahan paket untuk menghindari lelang. "
            "Total nilai proyek melebihi ambang batas Rp 200 juta."
        )
        spec_quality = "Kurang lengkap"

    elif risk_type == "vague_spec":
        unit_price = ref_price * random.uniform(1.40, 1.80)
        desc = (
            "Spesifikasi tidak terukur: 'jasa konsultansi pendukung kegiatan'. "
            "Tidak ada KPI, deliverable, atau timeline yang jelas. "
            "Tidak ada referensi e-Katalog."
        )
        spec_quality = "Tidak memadai"
        category = "Jasa Konsultansi IT"

    elif risk_type == "budget_misalign":
        unit_price = ref_price * random.uniform(1.20, 1.50)
        desc = (
            "Nilai pengadaan melebihi pagu anggaran yang tersedia. "
            "Tidak ada revisi DIPA yang tercatat."
        )
        spec_quality = "Cukup"

    else:  # no_katalog_bypass
        unit_price = ref_price * random.uniform(1.50, 2.00)
        desc = (
            "Item tersedia di e-Katalog LKPP namun pengadaan dilakukan "
            "di luar e-Katalog tanpa justifikasi. "
            "Tidak ada referensi SPSE."
        )
        spec_quality = "Ada, namun referensi e-Katalog dilewati"

    quantity = random.randint(1, 20)

    if risk_type == "budget_misalign":
        # Force amount > budget
        requested_amount = unit_price * quantity
        budget = round(requested_amount * random.uniform(0.55, 0.80))
    else:
        requested_amount = unit_price * quantity
        # Budget utilization very tight (>94%)
        budget = _make_budget(unit_price, quantity, random.uniform(0.94, 1.02))

    if risk_type != "vendor_concentration":
        vendor = _make_vendor_name()
        vendor_history[vendor] = vendor_history.get(vendor, 0) + 1
    else:
        vendor = list(vendor_history.keys())[-1] if vendor_history else _make_vendor_name()

    spse_ref = (
        "Tidak tersedia"
        if risk_type in ("no_katalog_bypass", "vague_spec")
        else _make_spse_ref(ministry["code"])
    )
    npwp = (
        "Tidak ditemukan"
        if random.random() < 0.45
        else f"Perlu verifikasi — {_make_npwp()}"
    )

    return {
        "title": f"[SYNTHETIC-ID-ANOMALY] Pengadaan {category} — {ministry['short']} #{idx:03d} ({risk_type})",
        "category": category,
        "quantity": float(quantity),
        "unit_price": round(unit_price, 0),
        "requested_amount": round(requested_amount, 0),
        "vendor_name": vendor.strip(),
        "budget_available": float(budget),
        "reference_price": round(ref_price, 0),
        "procurement_date": _make_date(rush=True),
        "description": (
            f"[⚠ SYNTHETIC HIGH-RISK DEMO RECORD] "
            f"Pengadaan {category} — {ministry['name']}. "
            f"Referensi SPSE: {spse_ref}. {desc} "
            f"Kualitas spesifikasi: {spec_quality}. NPWP: {npwp}. "
            f"[SYNTHETIC RECORD — NOT REAL PROCUREMENT DATA]"
        ),
        "supporting_info": (
            f"Kode Satker: {ministry['code']} | "
            f"Jenis: {random.choice(PROC_TYPES)} | "
            f"E-Katalog: {'Tersedia tapi dilewati' if risk_type == 'no_katalog_bypass' else ('Tidak tersedia' if not has_katalog else 'Tersedia')} | "
            f"Vendor contracts: {vendor_history.get(vendor, 1)} | "
            f"NPWP: {npwp} | "
            f"Risk pattern: HIGH ({risk_type})"
        ),
    }


# ─── Main generator ───────────────────────────────────────────────────────────

def generate_dataset(count: int = 60) -> list[dict]:
    """
    Generate a realistic Indonesia gov procurement dataset.

    Distribution:
      ~30% Low risk  (normal procurement)
      ~50% Medium risk (needs investigation)
      ~20% High risk  (corruption signals)

    Returns list of dicts ready to insert as Submission records.
    """
    n_low = round(count * 0.30)
    n_medium = round(count * 0.50)
    n_high = count - n_low - n_medium

    records = []
    vendor_history: dict[str, int] = {}
    idx = 1

    # Low risk
    for _ in range(n_low):
        records.append({**_low_risk_record(idx, vendor_history), "_risk_target": "Low"})
        idx += 1

    # Medium risk
    for _ in range(n_medium):
        records.append({**_medium_risk_record(idx, vendor_history), "_risk_target": "Medium"})
        idx += 1

    # High risk — include some fragmentation clusters
    frag_group = f"PROJ-{random.randint(1000,9999)}"
    for i in range(n_high):
        use_frag = (i < max(2, n_high // 3))
        records.append({
            **_high_risk_record(idx, vendor_history, frag_group if use_frag else None),
            "_risk_target": "High"
        })
        idx += 1

    # Shuffle so risk levels are mixed throughout
    random.shuffle(records)

    # Strip internal helper key
    for r in records:
        r.pop("_risk_target", None)

    return records
