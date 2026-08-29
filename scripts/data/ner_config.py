"""
NER Logistics — Real-Data Pipeline: Shared Geographic & Provenance Constants
============================================================================

SINGLE SOURCE OF TRUTH for the data-acquisition / fusion / ML pipeline.

Everything in this file is one of:
  (a) a well-established PUBLIC GEOGRAPHIC FACT (the 8 NER states; the region
      bounding box), or
  (b) a CONSTANT the user explicitly specified in the real-data directive
      (the data-confidence ladder, the risk-category bins, the target label,
      the temporal-validation split years).

*** No dataset values, no statistics, and no coordinates that purport to be
    measured data live here. Actual data is only ever produced by the
    download_*/ingest_* scripts from verified sources and written under data/. ***

Coordinate convention for the whole project:
  - API / JSON / this file:  {lat, lng}  (or (lat, lng) tuples where noted)
  - PostGIS storage:         (lng, lat)  SRID 4326  (repositories translate)
"""
from __future__ import annotations

from pathlib import Path

# ─────────────────────────────────────────────────────────────────────────────
# Paths (repo layout is fixed; these create nothing, they only name locations)
# ─────────────────────────────────────────────────────────────────────────────
# this file: <repo>/scripts/data/ner_config.py  ->  PYTHON_SERVICE = <repo>/python-service
REPO_ROOT = Path(__file__).resolve().parents[2]
PYTHON_SERVICE_DIR = REPO_ROOT / "python-service"
DATA_DIR = PYTHON_SERVICE_DIR / "data"

RAW_DIR = DATA_DIR / "raw"              # immutable downloads; NEVER overwritten
PROCESSED_DIR = DATA_DIR / "processed"  # cleaned / normalized / reprojected
FEATURES_DIR = DATA_DIR / "features"    # ROAD_SEGMENT x DATE feature frames
LABELS_DIR = DATA_DIR / "labels"        # disruption_next_24h label tables
METADATA_DIR = DATA_DIR / "metadata"    # one provenance JSON per dataset
VALIDATION_DIR = DATA_DIR / "validation"  # data-quality reports

ALL_DATA_SUBDIRS = (RAW_DIR, PROCESSED_DIR, FEATURES_DIR, LABELS_DIR, METADATA_DIR, VALIDATION_DIR)

# ─────────────────────────────────────────────────────────────────────────────
# Region of interest — the 8 North Eastern Region states (public fact)
# ─────────────────────────────────────────────────────────────────────────────
NER_STATES = (
    "Arunachal Pradesh",
    "Assam",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Sikkim",
    "Tripura",
)

# Region bounding box (WGS84 / EPSG:4326). Generous envelope that encloses all
# 8 states incl. easternmost Arunachal (~97.4E) and southern Mizoram (~21.9N).
# Used only to CLIP / SUBSET downloads — not a data value itself.
# Order variants provided to match different libraries' expectations.
NER_BBOX = {
    "min_lat": 21.9,
    "max_lat": 29.5,
    "min_lng": 87.9,
    "max_lng": 97.5,
}
# (west, south, east, north) — rasterio / many APIs
NER_BBOX_WSEN = (NER_BBOX["min_lng"], NER_BBOX["min_lat"], NER_BBOX["max_lng"], NER_BBOX["max_lat"])
# (north, west, south, east) — ERA5 / CDS "area"
NER_BBOX_NWSE = (NER_BBOX["max_lat"], NER_BBOX["min_lng"], NER_BBOX["min_lat"], NER_BBOX["max_lng"])

# ─────────────────────────────────────────────────────────────────────────────
# Coordinate reference systems
# ─────────────────────────────────────────────────────────────────────────────
CRS_WGS84 = "EPSG:4326"     # storage / API / lat-lng
# Metric CRS for distance/buffer/nearest ops over NER. UTM 46N covers the bulk
# of the region (90E–96E); good enough for buffer/nearest fusion at region scale.
CRS_UTM_46N = "EPSG:32646"
PROJECT_METRIC_CRS = CRS_UTM_46N

# ─────────────────────────────────────────────────────────────────────────────
# Data-confidence ladder  (user directive — must surface in the Provenance UI)
# ─────────────────────────────────────────────────────────────────────────────
# Ordered strongest -> weakest. Every row/feature/label carries one of these in
# a `data_source_type` column so the frontend can show provenance + a confidence
# %, and so the AI Copilot can give evidence-based, auditable answers.
DATA_SOURCE_TYPES = (
    "REAL_OFFICIAL",   # govt / IMD / ISRO-NRSC / GSI / NDMA / MoRTH etc.
    "REAL_OPEN",       # OpenStreetMap, open reanalyses, other open-licensed real data
    "REAL_ACADEMIC",   # peer-reviewed / published research datasets
    "DERIVED",         # computed FROM real data (e.g. slope from a real DEM)
    "SIMULATED",       # explicitly synthetic (operational logistics we cannot source)
)
# Indicative confidence weights for UI display (NOT model inputs).
DATA_SOURCE_CONFIDENCE = {
    "REAL_OFFICIAL": 100,
    "REAL_OPEN": 85,
    "REAL_ACADEMIC": 75,
    "DERIVED": 60,
    "SIMULATED": 30,
}

# ─────────────────────────────────────────────────────────────────────────────
# Prediction target + risk taxonomy  (user directive)
# ─────────────────────────────────────────────────────────────────────────────
# Unified modeling grain is  ROAD_SEGMENT x DATE.
TARGET_LABEL = "disruption_next_24h"   # 1 = disruption/closure within next 24h, else 0
MODELING_GRAIN = ("segment_id", "date")

# risk_probability (0..1) -> risk_category. Bins are inclusive upper bounds on a
# 0..100 scale (probability * 100).
RISK_CATEGORY_BINS = (
    (0, 30, "LOW"),
    (31, 60, "MODERATE"),
    (61, 80, "HIGH"),
    (81, 100, "CRITICAL"),
)


def risk_category(probability_0_1: float) -> str:
    """Map a 0..1 risk probability to the user-specified category label."""
    pct = max(0.0, min(1.0, float(probability_0_1))) * 100.0
    for lo, hi, label in RISK_CATEGORY_BINS:
        if lo <= pct <= hi:
            return label
    return "CRITICAL"


# ─────────────────────────────────────────────────────────────────────────────
# Temporal validation  (train PAST -> validate -> test FUTURE; never random split)
# ─────────────────────────────────────────────────────────────────────────────
# FINALIZED from Prompt-1 label verification: the only genuine, dated, point-
# located NER disruption labels are NASA Global Landslide Catalog incidents, whose
# NER coverage runs 2007-04-11 .. 2016-10-15 (bulk data ends ~2017 — the catalog
# is not updated past then). We therefore model the REAL-label era and split it
# chronologically. We do NOT model 2018-2024, because no real bulk labels exist
# there and inventing them would violate the no-fabrication mandate.
TEMPORAL_SPLIT = {
    "train_years": (2007, 2008, 2009, 2010, 2011, 2012, 2013),
    "val_years": (2014,),
    "test_years": (2015, 2016),
}
# Environmental feature layers span this window: IMD rainfall (1901-2024, so
# fully available), Copernicus DEM (static), HydroRIVERS (static). WorldCover is
# 2021-vintage (slow-changing) — used as a near-static exposure feature with that
# caveat recorded in provenance.

# ─────────────────────────────────────────────────────────────────────────────
# Label construction — disruption_next_24h via distant supervision (Prompt 3)
# ─────────────────────────────────────────────────────────────────────────────
# A road segment is a POSITIVE for a given date if a landslide incident falls
# within a buffer of the segment on event_date within this horizon. Buffer scales
# with the incident's stated positional accuracy (GLC `location_accuracy`).
LABEL_HORIZON_HOURS = 24
LABEL_ACCURACY_BUFFER_M = {
    "exact": 250, "1km": 1000, "5km": 5000,
    "10km": 10000, "25km": 25000, "unknown": 5000,
}
LABEL_DEFAULT_BUFFER_M = 5000       # blank/unrecognised accuracy -> conservative
LABEL_MAX_BUFFER_M = 25000          # hard cap (never label beyond the coarsest tier)
# Extreme class imbalance is intrinsic (few incident-days vs all segment-days).
# Negatives are SAMPLED (not the full cross-product) and class weights applied.
LABEL_NEGATIVE_RATIO = 20           # sampled negatives per positive (train frame)

# ─────────────────────────────────────────────────────────────────────────────
# Evaluation metrics — imbalance-aware (accuracy is NOT primary)
# ─────────────────────────────────────────────────────────────────────────────
# With ~hundreds of positives against many negatives, a trivial always-negative
# model scores ~1.0 accuracy. So ranking/threshold metrics are primary; raw
# accuracy is reported for context only, never as an acceptance gate.
PRIMARY_EVAL_METRICS = ("pr_auc", "roc_auc", "recall_at_threshold", "precision_at_threshold")

# ─────────────────────────────────────────────────────────────────────────────
# Single-sourced disruption threshold (Rule 1) — mirrors python-service app.config
# ─────────────────────────────────────────────────────────────────────────────
# Kept here ONLY so pipeline scripts that run outside the FastAPI app can align
# label/eval thresholds with the served model. The FastAPI service's app.config
# remains the runtime source of truth that Node fetches via GET /ml/config.
DISRUPTION_ALERT_THRESHOLD = 0.70


def ensure_data_dirs() -> None:
    """Create the data/ subdirectory tree if missing (idempotent)."""
    for d in ALL_DATA_SUBDIRS:
        d.mkdir(parents=True, exist_ok=True)


if __name__ == "__main__":
    ensure_data_dirs()
    print("NER real-data pipeline config")
    print("  states       :", len(NER_STATES))
    print("  bbox (WSEN)  :", NER_BBOX_WSEN)
    print("  metric CRS   :", PROJECT_METRIC_CRS)
    print("  target label :", TARGET_LABEL, "over", MODELING_GRAIN)
    print("  provenance   :", ", ".join(DATA_SOURCE_TYPES))
    print("  data dirs    : ok ->", DATA_DIR)
