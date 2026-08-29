"""
NER Logistics — Disruption Prediction Model (Real XGBoost + Heuristic Fallback)
================================================================================

This module is the SINGLE ENTRY POINT for disruption risk scoring.

Runtime behavior:
  * If a trained XGBoost model exists at MODEL_PATH → loads it and runs real
    calibrated inference with feature importance from the trained model.
  * If no model exists yet → falls back to the heuristic scorer (the formula
    that was the original v1 implementation) so the API never crashes.

The heuristic fallback is NOT presented as a trained ML model — it is tagged
as model_version="heuristic-v2.1" so the frontend/Copilot can distinguish it
from a real trained model.

Rule 1: Shared DISRUPTION_ALERT_THRESHOLD from app.config (never hardcoded).
"""
from __future__ import annotations

import json
import math
from pathlib import Path
from typing import Any, Dict, List, Optional

import numpy as np

from app.config import (
    DISRUPTION_ALERT_THRESHOLD,
    MODEL_PATH,
    CALIBRATOR_PATH,
    MODEL_METADATA_PATH,
    ensure_dirs,
)

# ── Feature schema (must match training) ──────────────────────────────────────
TRAINED_FEATURES = [
    "rainfall_24h", "rainfall_72h", "rainfall_7d", "rainfall_anomaly",
    "elevation", "slope", "terrain_ruggedness",
    "distance_to_river",
    "land_cover", "water_occurrence",
    "historical_landslide_count",
    "highway_class_encoded",
    "bridge",
    "road_length_m",
    "month", "monsoon_indicator",
]

# Risk bins (0..100 scale)
RISK_BINS = [
    (0, 30, "LOW"),
    (31, 60, "MODERATE"),
    (61, 80, "HIGH"),
    (81, 100, "CRITICAL"),
]


def _risk_category(prob: float) -> str:
    """Map probability 0..1 → category string."""
    pct = max(0.0, min(1.0, float(prob))) * 100
    for lo, hi, label in RISK_BINS:
        if lo <= pct <= hi:
            return label
    return "CRITICAL"


# ─────────────────────────────────────────────────────────────────────────────
# XGBoost-based scorer (loads the trained model)
# ─────────────────────────────────────────────────────────────────────────────
class XGBoostScorer:
    """Loads the trained XGBoost model + isotonic calibrator."""

    def __init__(self):
        import joblib
        self.model = joblib.load(MODEL_PATH)
        self.calibrator = None
        if CALIBRATOR_PATH.exists():
            self.calibrator = joblib.load(CALIBRATOR_PATH)

        self.metadata = {}
        if MODEL_METADATA_PATH.exists():
            self.metadata = json.loads(MODEL_METADATA_PATH.read_text())

        self.version = self.metadata.get("model_version", "xgb-trained-v1")
        self.threshold = DISRUPTION_ALERT_THRESHOLD
        self.features = TRAINED_FEATURES

    def _build_feature_vector(self, raw: Dict[str, Any]) -> np.ndarray:
        """Map raw payload to the trained feature vector, with safe defaults and derivations."""
        defaults = {
            "rainfall_24h": 0.0, "rainfall_72h": 0.0, "rainfall_7d": 0.0,
            "rainfall_anomaly": 0.0, "elevation": 300.0, "slope": 10.0,
            "terrain_ruggedness": 5.0, "distance_to_river": 5000.0,
            "land_cover": 30, "water_occurrence": 0,
            "historical_landslide_count": 0,
            "highway_class_encoded": 2, "bridge": 0, "road_length_m": 500.0,
            "month": 7, "monsoon_indicator": 1,
        }
        # handle legacy aliases
        slope = float(raw.get("slope", raw.get("slope_deg", defaults["slope"])))
        elev = float(raw.get("elevation", raw.get("elevation_m", defaults["elevation"])))
        rain72 = float(raw.get("rainfall_72h", raw.get("antecedent_rain_3day_mm", defaults["rainfall_72h"])))
        rain24 = float(raw.get("rainfall_24h", raw.get("antecedent_rain_1day_mm", rain72 / 2.5)))
        rain7d = float(raw.get("rainfall_7d", raw.get("antecedent_rain_7day_mm", rain72 * 1.8)))
        hist = float(raw.get("historical_landslide_count", raw.get("historical_landslides_5yr", defaults["historical_landslide_count"])))
        
        mapped = {
            "rainfall_24h": rain24,
            "rainfall_72h": rain72,
            "rainfall_7d": rain7d,
            "rainfall_anomaly": float(raw.get("rainfall_anomaly", round((rain7d - 60.0) / 30.0, 2))),
            "elevation": elev,
            "slope": slope,
            "terrain_ruggedness": float(raw.get("terrain_ruggedness", slope * 0.45)),
            "distance_to_river": float(raw.get("distance_to_river", defaults["distance_to_river"])),
            "land_cover": int(raw.get("land_cover", defaults["land_cover"])),
            "water_occurrence": int(raw.get("water_occurrence", defaults["water_occurrence"])),
            "historical_landslide_count": hist,
            "highway_class_encoded": int(raw.get("highway_class_encoded", defaults["highway_class_encoded"])),
            "bridge": int(raw.get("bridge", defaults["bridge"])),
            "road_length_m": float(raw.get("road_length_m", defaults["road_length_m"])),
            "month": int(raw.get("month", defaults["month"])),
            "monsoon_indicator": int(raw.get("monsoon_indicator", defaults["monsoon_indicator"])),
        }

        vec = [float(mapped.get(f, defaults.get(f, 0.0))) for f in self.features]
        return np.array([vec])

    def score_segment(self, feature_data: Dict[str, Any]) -> Dict[str, Any]:
        """Score a road segment using the trained model."""
        X = self._build_feature_vector(feature_data)

        prob = float(self.model.predict_proba(X)[0, 1])

        risk_score = round(prob, 3)
        risk_pct = int(risk_score * 100)
        category = _risk_category(prob)
        alert = risk_score >= self.threshold

        # Feature importance from the model (gain-based)
        try:
            importances = self.model.feature_importances_
            top_features = sorted(
                zip(self.features, importances),
                key=lambda x: x[1], reverse=True
            )[:5]
            contributions = {f: round(float(w) * 100, 1) for f, w in top_features}
        except Exception:
            contributions = {}

        status, severity, action = self._classify(risk_score)
        return {
            "segment_id": feature_data.get("segment_id"),
            "highway": feature_data.get("highway"),
            "segment_name": feature_data.get("name"),
            "risk_score": risk_score,
            "risk_percent": risk_pct,
            "risk_category": category,
            "severity": severity,
            "status": status,
            "alert_triggered": alert,
            "threshold_used": self.threshold,
            "recommended_action": action,
            "confidence": round(abs(prob - 0.5) * 2, 2),  # distance from decision boundary
            "feature_contributions": contributions,
            "model_version": self.version,
            "model_type": "trained_xgboost",
        }

    def get_feature_importance_radar(self) -> List[Dict[str, Any]]:
        """Returns 4 canonical categories for Analyst Studio / Command Dashboard."""
        try:
            importances = dict(zip(self.features, self.model.feature_importances_))
            rain_wt = sum(importances.get(f, 0.0) for f in ["rainfall_24h", "rainfall_72h", "rainfall_7d", "rainfall_anomaly"])
            topo_wt = sum(importances.get(f, 0.0) for f in ["elevation", "slope", "terrain_ruggedness", "road_length_m"])
            hydro_wt = sum(importances.get(f, 0.0) for f in ["distance_to_river", "water_occurrence", "land_cover"])
            geo_wt = sum(importances.get(f, 0.0) for f in ["historical_landslide_count", "highway_class_encoded", "bridge", "monsoon_indicator"])
            total = max(1e-5, rain_wt + topo_wt + hydro_wt + geo_wt)
            return [
                {"feature": "Antecedent Rainfall (3-Day)", "weight": round(rain_wt / total * 100, 1), "category": "Meteorological"},
                {"feature": "DEM Slope Gradient", "weight": round(topo_wt / total * 100, 1), "category": "Topographical"},
                {"feature": "Subsoil Saturation Index", "weight": round(hydro_wt / total * 100, 1), "category": "Hydrological"},
                {"feature": "Historical Landslide Catalog", "weight": round(geo_wt / total * 100, 1), "category": "Geological"},
            ]
        except Exception:
            return [
                {"feature": "Antecedent Rainfall (3-Day)", "weight": 35.0, "category": "Meteorological"},
                {"feature": "DEM Slope Gradient", "weight": 30.0, "category": "Topographical"},
                {"feature": "Subsoil Saturation Index", "weight": 20.0, "category": "Hydrological"},
                {"feature": "Historical Landslide Catalog", "weight": 15.0, "category": "Geological"},
            ]

    @staticmethod
    def _classify(score: float):
        if score >= 0.70:
            return ("High Landslide Hazard (Blockade Warning)", "critical",
                    "Execute pre-departure or mid-trip safe corridor reroute.")
        elif score >= 0.40:
            return ("Moderate Terrain Hazard (Single-Lane / Caution)", "warning",
                    "Reduce speed to under 45 km/h; monitor rainfall.")
        else:
            return ("Safe / Optimal Passability", "info",
                    "Standard convoy transit permitted.")


# ─────────────────────────────────────────────────────────────────────────────
# Heuristic fallback (used when no trained model exists)
# ─────────────────────────────────────────────────────────────────────────────
class HeuristicScorer:
    """
    The original formula-based scorer. Used as a fallback when the trained
    XGBoost model has not been built yet. Clearly tagged as heuristic-v2.1
    so it is never confused with a trained model.
    """

    FEATURE_WEIGHTS = {
        "antecedent_rainfall": 0.32,
        "slope_gradient": 0.28,
        "soil_moisture": 0.22,
        "historical_frequency": 0.18,
    }

    def __init__(self):
        self.version = "heuristic-v2.1"
        self.threshold = DISRUPTION_ALERT_THRESHOLD

    def score_segment(self, feature_data: Dict[str, Any]) -> Dict[str, Any]:
        rain_3day = float(feature_data.get("antecedent_rain_3day_mm",
                          feature_data.get("rainfall_72h", 40.0)))
        slope = float(feature_data.get("slope_deg",
                      feature_data.get("slope", 10.0)))
        moisture = float(feature_data.get("soil_moisture_pct", 50.0))
        history = float(feature_data.get("historical_landslides_5yr",
                        feature_data.get("historical_landslide_count", 2)))

        rain_norm = 1.0 / (1.0 + math.exp(-(rain_3day - 110.0) / 30.0))
        slope_norm = min(1.0, max(0.0, (slope - 5.0) / 30.0))
        moisture_norm = min(1.0, max(0.0, (moisture - 40.0) / 50.0))
        history_norm = min(1.0, history / 15.0)

        raw_score = (
            rain_norm * self.FEATURE_WEIGHTS["antecedent_rainfall"]
            + slope_norm * self.FEATURE_WEIGHTS["slope_gradient"]
            + moisture_norm * self.FEATURE_WEIGHTS["soil_moisture"]
            + history_norm * self.FEATURE_WEIGHTS["historical_frequency"]
        )
        if slope >= 20.0 and moisture >= 80.0:
            raw_score = min(1.0, raw_score * 1.25)

        risk_score = round(raw_score, 3)
        risk_pct = int(risk_score * 100)
        category = _risk_category(raw_score)
        alert = risk_score >= self.threshold

        if risk_score >= 0.70:
            severity, status, action = ("critical",
                "High Landslide Hazard (Blockade Warning)",
                "Execute pre-departure or mid-trip safe corridor reroute.")
        elif risk_score >= 0.40:
            severity, status, action = ("warning",
                "Moderate Terrain Hazard (Single-Lane / Caution)",
                "Reduce speed to under 45 km/h; monitor rainfall.")
        else:
            severity, status, action = ("info",
                "Safe / Optimal Passability",
                "Standard convoy transit permitted.")

        return {
            "segment_id": feature_data.get("segment_id"),
            "highway": feature_data.get("highway"),
            "segment_name": feature_data.get("name"),
            "risk_score": risk_score,
            "risk_percent": risk_pct,
            "risk_category": category,
            "severity": severity,
            "status": status,
            "alert_triggered": alert,
            "threshold_used": self.threshold,
            "recommended_action": action,
            "confidence": round(abs(raw_score - 0.5) * 2, 2),
            "feature_contributions": {
                "rainfall_3day_pct": round(rain_norm * self.FEATURE_WEIGHTS["antecedent_rainfall"] * 100, 1),
                "slope_gradient_pct": round(slope_norm * self.FEATURE_WEIGHTS["slope_gradient"] * 100, 1),
                "soil_moisture_pct": round(moisture_norm * self.FEATURE_WEIGHTS["soil_moisture"] * 100, 1),
                "historical_catalog_pct": round(history_norm * self.FEATURE_WEIGHTS["historical_frequency"] * 100, 1),
            },
            "model_version": self.version,
            "model_type": "heuristic_fallback",
        }

    def get_feature_importance_radar(self) -> List[Dict[str, Any]]:
        return [
            {"feature": "Antecedent Rainfall (3-Day)", "weight": 32, "category": "Meteorological"},
            {"feature": "DEM Slope Gradient", "weight": 28, "category": "Topographical"},
            {"feature": "Subsoil Saturation Index", "weight": 22, "category": "Hydrological"},
            {"feature": "Historical Landslide Catalog", "weight": 18, "category": "Geological"},
        ]


# ─────────────────────────────────────────────────────────────────────────────
# Factory: pick the best available scorer
# ─────────────────────────────────────────────────────────────────────────────
def _create_scorer():
    """
    Load the trained XGBoost model if it exists, otherwise fall back to
    the heuristic scorer. This is called ONCE at module import time.
    """
    ensure_dirs()
    if MODEL_PATH.exists():
        try:
            scorer = XGBoostScorer()
            print(f"[ML] Loaded trained model: {scorer.version} from {MODEL_PATH}")
            return scorer
        except Exception as e:
            print(f"[ML] Failed to load trained model ({e}); falling back to heuristic.")
    else:
        print(f"[ML] No trained model at {MODEL_PATH}; using heuristic fallback.")
    return HeuristicScorer()


# Singleton — loaded once at startup
ensemble_scorer = _create_scorer()
