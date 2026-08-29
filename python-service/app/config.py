"""
NER Logistics — Python Service Shared Configuration
====================================================
Single source of truth for cross-cutting constants and filesystem paths.

CROSS-CUTTING RULE 1 (load-bearing): the disruption-alert threshold is declared
here ONCE. Every module that fires alerts must import `DISRUPTION_ALERT_THRESHOLD`
from this file — never re-declare or hardcode `0.70` anywhere else. The Node
backend reads it over HTTP via `GET /ml/config`; it must not re-declare it either.
"""
import os
from pathlib import Path

# ── Service root (…/python-service) ───────────────────────────────────────────
# config.py lives at python-service/app/config.py, so parents[1] == python-service/
SERVICE_ROOT = Path(__file__).resolve().parents[1]


def _env_float(name: str, default: float) -> float:
    raw = os.getenv(name)
    if raw is None or raw.strip() == "":
        return default
    try:
        return float(raw)
    except ValueError:
        return default


def _env_int(name: str, default: int) -> int:
    raw = os.getenv(name)
    if raw is None or raw.strip() == "":
        return default
    try:
        return int(raw)
    except ValueError:
        return default


# ── RULE 1: shared disruption-alert threshold ─────────────────────────────────
# Score >= threshold ⇒ automated emergency alert fires. Env-overridable so the
# whole platform can be re-tuned from one place without a code change.
DISRUPTION_ALERT_THRESHOLD: float = _env_float("DISRUPTION_ALERT_THRESHOLD", 0.70)

# ── Reproducibility ───────────────────────────────────────────────────────────
RANDOM_SEED: int = _env_int("ML_RANDOM_SEED", 42)

# ── Synthetic-data governance (synthetic-data-generator skill) ────────────────
# Hard ceiling on the synthetic share of any dataset partition. Synthetic rows
# are permitted ONLY in the training split, never validation/test.
SYNTHETIC_CAP: float = _env_float("SYNTHETIC_CAP", 0.50)

# ── Filesystem layout (artifacts live on disk / object storage, not the DB) ───
DATA_DIR: Path = Path(os.getenv("ML_DATA_DIR", SERVICE_ROOT / "data"))
FEATURE_DIR: Path = DATA_DIR / "features"
MODEL_DIR: Path = Path(os.getenv("ML_MODEL_DIR", SERVICE_ROOT / "models"))
LOG_DIR: Path = Path(os.getenv("ML_LOG_DIR", SERVICE_ROOT / "logs"))

# Canonical artifact paths (written by app/ml/train.py, read by the scorer)
MODEL_PATH: Path = MODEL_DIR / "disruption_xgb.joblib"
CALIBRATOR_PATH: Path = MODEL_DIR / "calibrator.joblib"
MODEL_METADATA_PATH: Path = MODEL_DIR / "metadata.json"
INFERENCE_LOG_PATH: Path = LOG_DIR / "inference.jsonl"


def ensure_dirs() -> None:
    """Create all artifact directories if absent. Safe to call repeatedly."""
    for d in (DATA_DIR, FEATURE_DIR, MODEL_DIR, LOG_DIR):
        d.mkdir(parents=True, exist_ok=True)


def public_config() -> dict:
    """Serializable config surface exposed via GET /ml/config for the Node backend."""
    return {
        "disruption_alert_threshold": DISRUPTION_ALERT_THRESHOLD,
        "random_seed": RANDOM_SEED,
        "synthetic_cap": SYNTHETIC_CAP,
    }
