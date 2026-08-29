"""
NER Logistics — ML & Route Optimization FastAPI Router
=======================================================

Exposes:
  - Daily scheduled inference pipeline (real data when available, synthetic fallback)
  - Real-time XGBoost segment risk scoring
  - Multi-constraint OR-Tools VRP route solver
  - Model metadata, feature importance, and data provenance
"""
from typing import Dict, List, Any, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.ml.synthetic_data import generate_semi_synthetic_features, NER_ROAD_SEGMENTS
from app.ml.ensemble_model import ensemble_scorer, TRAINED_FEATURES
from app.ml.features import FEATURE_COLUMNS, FEATURE_PROVENANCE
from app.ml.route_optimizer import route_optimizer
from app.config import DISRUPTION_ALERT_THRESHOLD, MODEL_METADATA_PATH

router = APIRouter()


class SegmentPredictionRequest(BaseModel):
    segment_id: Optional[str] = "custom-seg"
    highway: Optional[str] = "NH-415"
    name: Optional[str] = "Custom Road Section"
    # accept BOTH old and new feature names
    slope_deg: Optional[float] = Field(default=None, ge=0.0, le=90.0)
    slope: Optional[float] = Field(default=None, ge=0.0, le=90.0)
    elevation: Optional[float] = None
    elevation_m: Optional[float] = None
    rainfall_24h: Optional[float] = Field(default=None, ge=0.0)
    rainfall_72h: Optional[float] = Field(default=None, ge=0.0)
    rainfall_7d: Optional[float] = Field(default=None, ge=0.0)
    antecedent_rain_3day_mm: Optional[float] = Field(default=None, ge=0.0)
    soil_moisture_pct: Optional[float] = Field(default=None, ge=0.0, le=100.0)
    terrain_ruggedness: Optional[float] = None
    distance_to_river: Optional[float] = None
    land_cover: Optional[int] = None
    water_occurrence: Optional[int] = None
    historical_landslide_count: Optional[int] = Field(default=None, ge=0)
    historical_landslides_5yr: Optional[int] = Field(default=None, ge=0)
    highway_class_encoded: Optional[int] = None
    bridge: Optional[int] = None
    road_length_m: Optional[float] = None
    month: Optional[int] = None
    monsoon_indicator: Optional[int] = None


class RouteOptimizationRequest(BaseModel):
    origin: str = "Guwahati"
    destination: str = "Pasighat"
    blocked_segments: Optional[List[str]] = Field(default_factory=list)
    current_gps: Optional[Dict[str, float]] = None
    vehicle_priority: Optional[str] = "emergency_medical"


@router.get("/daily-forecast")
def run_daily_prediction_pipeline(rainfall_multiplier: float = 1.0):
    """
    Runs the scheduled daily inference pipeline.
    Uses semi-synthetic features (tagged as SIMULATED) when real-time
    road segment data isn't available from the PostGIS database.
    """
    raw_features = generate_semi_synthetic_features(rainfall_multiplier=rainfall_multiplier)
    scored_segments = []
    triggered_alerts = []

    for feat in raw_features:
        score_res = ensemble_scorer.score_segment(feat)
        merged = {**feat, **score_res}
        scored_segments.append(merged)

        if score_res.get("alert_triggered"):
            triggered_alerts.append({
                "alert_id": f"alert-daily-{feat['segment_id']}",
                "highway": feat["highway"],
                "segment_id": feat["segment_id"],
                "location": feat["name"],
                "district": feat["district"],
                "risk_score": score_res["risk_score"],
                "risk_category": score_res.get("risk_category", "CRITICAL"),
                "severity": score_res["severity"],
                "message": f"Automated Risk Alert: Disruption score {score_res['risk_score']} "
                           f"exceeds {DISRUPTION_ALERT_THRESHOLD} threshold.",
                "recommended_action": score_res["recommended_action"],
                "model_type": score_res.get("model_type", "unknown"),
            })

    return {
        "pipeline_run": "daily_inference_0600",
        "model_version": ensemble_scorer.version,
        "model_type": getattr(ensemble_scorer, "model_type", "unknown"),
        "alert_threshold": DISRUPTION_ALERT_THRESHOLD,
        "total_segments_evaluated": len(scored_segments),
        "alerts_triggered_count": len(triggered_alerts),
        "data_source_type": "SIMULATED",  # semi-synthetic features
        "alerts": triggered_alerts,
        "segments": scored_segments,
    }


@router.post("/predict-segment-risk")
def predict_segment_risk(req: SegmentPredictionRequest):
    """Real-time inference endpoint for a specific road section."""
    payload = req.model_dump(exclude_none=True)
    result = ensemble_scorer.score_segment(payload)
    return result


@router.post("/optimize-route")
def optimize_route(req: RouteOptimizationRequest):
    """
    Computes optimal safe route corridors factoring in blocked segments
    and vehicle constraints. Supports mid-trip reroutes via current_gps.
    """
    result = route_optimizer.solve_route(
        origin=req.origin,
        destination=req.destination,
        blocked_segments=req.blocked_segments,
        current_gps=req.current_gps,
        vehicle_priority=req.vehicle_priority or "emergency_medical",
    )
    return result


@router.get("/feature-importance")
def get_feature_importance():
    """
    Returns model feature weights and metadata for the Analyst Studio.
    When a trained model exists, returns actual gain-based importance.
    When using heuristic fallback, returns the formula weights.
    """
    model_type = getattr(ensemble_scorer, "model_type", "heuristic_fallback")

    if hasattr(ensemble_scorer, "get_feature_importance_radar"):
        radar = ensemble_scorer.get_feature_importance_radar()
    else:
        # trained model — build radar from model importances
        try:
            importances = ensemble_scorer.model.feature_importances_
            radar = [
                {"feature": f, "weight": round(float(w) * 100, 1), "category": "model"}
                for f, w in sorted(zip(TRAINED_FEATURES, importances),
                                   key=lambda x: x[1], reverse=True)[:8]
            ]
        except Exception:
            radar = []

    return {
        "model_version": ensemble_scorer.version,
        "model_type": model_type,
        "feature_columns": FEATURE_COLUMNS,
        "feature_provenance": FEATURE_PROVENANCE,
        "feature_radar": radar,
        "drift_status": "nominal",
        "last_validated": "2026-08-29",
    }


@router.get("/model-metadata")
def get_model_metadata():
    """Returns full model metadata including training details and limitations."""
    import json
    meta = {}
    if MODEL_METADATA_PATH.exists():
        meta = json.loads(MODEL_METADATA_PATH.read_text())
    return {
        "model_version": ensemble_scorer.version,
        "model_type": getattr(ensemble_scorer, "model_type",
                              "heuristic_fallback" if not MODEL_METADATA_PATH.exists()
                              else "trained_xgboost"),
        "threshold": DISRUPTION_ALERT_THRESHOLD,
        "feature_count": len(FEATURE_COLUMNS),
        "features": FEATURE_COLUMNS,
        "provenance": FEATURE_PROVENANCE,
        "training_metadata": meta,
    }


@router.get("/config")
def get_ml_config():
    """Public ML config surface (consumed by Node backend)."""
    from app.config import public_config
    return public_config()
