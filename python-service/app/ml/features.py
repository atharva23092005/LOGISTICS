"""
NER Logistics — Feature Engineering Pipeline
==============================================

Single source of truth for the model's feature schema. Used by:
  * scripts/ml/train_xgboost.py (training)
  * app/ml/ensemble_model.py    (inference / serving)

The feature list MUST match between training and serving — this module
is the contract that prevents train/serve skew.

Skill rules honored:
  • Join on segment_id (dedup last-wins).
  • NO forward-fill of missing weather — missing stays NaN, surfaced via data_freshness.
  • Versioned parquet output + manifest.json.
"""
from __future__ import annotations

import hashlib
import json
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple

import numpy as np
import pandas as pd

from app.config import FEATURE_DIR, ensure_dirs

# ── Canonical model feature vector ───────────────────────────────────────────
# ORDER MATTERS — the model is trained on this exact column order.
# If you add/remove features here, you MUST retrain the model.
FEATURE_COLUMNS: List[str] = [
    "rainfall_24h",
    "rainfall_72h",
    "rainfall_7d",
    "rainfall_anomaly",
    "elevation",
    "slope",
    "terrain_ruggedness",
    "distance_to_river",
    "land_cover",
    "water_occurrence",
    "historical_landslide_count",
    "highway_class_encoded",
    "bridge",
    "road_length_m",
    "month",
    "monsoon_indicator",
]

LABEL_COLUMN = "disruption_next_24h"

# Feature provenance (data_source_type for each feature)
FEATURE_PROVENANCE: Dict[str, str] = {
    "rainfall_24h": "REAL_OFFICIAL",       # IMD
    "rainfall_72h": "REAL_OFFICIAL",       # IMD
    "rainfall_7d": "REAL_OFFICIAL",        # IMD
    "rainfall_anomaly": "DERIVED",         # computed from IMD
    "elevation": "REAL_OFFICIAL",          # Copernicus DEM
    "slope": "DERIVED",                    # computed from DEM
    "terrain_ruggedness": "DERIVED",       # computed from DEM
    "distance_to_river": "REAL_ACADEMIC",  # HydroRIVERS
    "land_cover": "REAL_OPEN",             # ESA WorldCover
    "water_occurrence": "REAL_OFFICIAL",   # JRC GSW
    "historical_landslide_count": "REAL_ACADEMIC",  # NASA GLC
    "highway_class_encoded": "REAL_OPEN",  # OSM
    "bridge": "REAL_OPEN",                 # OSM
    "road_length_m": "REAL_OPEN",          # OSM
    "month": "DERIVED",                    # calendar
    "monsoon_indicator": "DERIVED",        # calendar
}

# Human-readable radar categories (frontend expects exactly 4)
RADAR_CATEGORIES: List[Tuple[str, str, List[str]]] = [
    ("Antecedent Rainfall (1/3/7-Day)", "Meteorological",
     ["rainfall_24h", "rainfall_72h", "rainfall_7d", "rainfall_anomaly"]),
    ("Terrain & Road Gradient", "Topographical",
     ["elevation", "slope", "terrain_ruggedness", "road_length_m"]),
    ("Hydro & Land Exposure", "Hydrological",
     ["distance_to_river", "water_occurrence", "land_cover"]),
    ("Historical Catalog & Infrastructure", "Geological",
     ["historical_landslide_count", "highway_class_encoded", "bridge",
      "month", "monsoon_indicator"]),
]

# Neutral defaults for inference when a feature is missing from the payload
_DEFAULTS: Dict[str, float] = {
    "rainfall_24h": 0.0,
    "rainfall_72h": 0.0,
    "rainfall_7d": 0.0,
    "rainfall_anomaly": 0.0,
    "elevation": 300.0,
    "slope": 10.0,
    "terrain_ruggedness": 5.0,
    "distance_to_river": 5000.0,
    "land_cover": 30,
    "water_occurrence": 0,
    "historical_landslide_count": 0,
    "highway_class_encoded": 2,
    "bridge": 0,
    "road_length_m": 500.0,
    "month": 7,
    "monsoon_indicator": 1,
}

# Legacy field aliases (for backward compatibility with the old API)
_ALIASES: Dict[str, str] = {
    "slope_deg": "slope",
    "elevation_m": "elevation",
    "antecedent_rain_1day_mm": "rainfall_24h",
    "antecedent_rain_3day_mm": "rainfall_72h",
    "antecedent_rain_7day_mm": "rainfall_7d",
    "soil_moisture_pct": None,  # no direct equivalent
    "historical_landslides_5yr": "historical_landslide_count",
    "road_condition_idx": None,
    "traffic_load": None,
}


def assemble_inference_row(raw: Dict[str, Any]) -> Dict[str, float]:
    """
    Map a raw scoring payload to the canonical feature vector.
    Handles both new feature names and legacy aliases.
    """
    # resolve aliases first
    resolved = {}
    for k, v in raw.items():
        target = _ALIASES.get(k, k)
        if target is not None:
            resolved[target] = v

    return {f: float(resolved.get(f, _DEFAULTS.get(f, 0.0))) for f in FEATURE_COLUMNS}


def feature_frame(rows: List[Dict[str, Any]]) -> pd.DataFrame:
    """Build a FEATURE_COLUMNS-ordered DataFrame from raw payloads."""
    assembled = [assemble_inference_row(r) for r in rows]
    return pd.DataFrame(assembled, columns=FEATURE_COLUMNS)


def engineer_features(
    segment_rows: List[Dict[str, Any]],
    weather_rows: Optional[List[Dict[str, Any]]] = None,
    version: Optional[str] = None,
    persist: bool = True,
) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """
    Assemble the operational feature table for road segments, joining live
    weather on segment_id. Missing weather is NOT forward-filled — rows keep
    NaN and data_freshness records the gap.
    """
    weather_by_seg: Dict[str, Dict[str, Any]] = {}
    for w in (weather_rows or []):
        seg_id = w.get("segment_id")
        if seg_id is not None:
            weather_by_seg[seg_id] = w  # last-wins dedup

    records: List[Dict[str, Any]] = []
    for seg in segment_rows:
        seg_id = seg.get("segment_id") or seg.get("id")
        merged: Dict[str, Any] = dict(seg)
        w = weather_by_seg.get(seg_id)
        freshness = "segment_only"
        if w is not None:
            merged.update({k: v for k, v in w.items() if v is not None})
            freshness = "joined_weather"
        for wf in ("rainfall_72h", "rainfall_24h"):
            if wf not in merged or merged.get(wf) is None:
                merged[wf] = np.nan
                freshness = "weather_missing"
        row = assemble_inference_row(merged)
        row["segment_id"] = seg_id
        row["data_freshness"] = freshness
        records.append(row)

    df = pd.DataFrame(records)
    manifest: Dict[str, Any] = {
        "version": version or datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ"),
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "row_count": int(len(df)),
        "feature_columns": FEATURE_COLUMNS,
        "feature_provenance": FEATURE_PROVENANCE,
        "freshness_breakdown": df["data_freshness"].value_counts().to_dict() if len(df) else {},
        "content_hash": hashlib.sha256(
            pd.util.hash_pandas_object(df[FEATURE_COLUMNS], index=False).values.tobytes()
        ).hexdigest()[:16] if len(df) else "",
    }

    if persist and len(df):
        ensure_dirs()
        pq_path = FEATURE_DIR / f"features_v{manifest['version']}.parquet"
        df.to_parquet(pq_path, index=False)
        manifest["parquet_path"] = str(pq_path)
        (FEATURE_DIR / "manifest.json").write_text(json.dumps(manifest, indent=2))

    return df, manifest
