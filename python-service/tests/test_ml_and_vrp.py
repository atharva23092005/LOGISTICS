"""
Automated QA Verification Suite for ML Disruption Ensemble & OR-Tools VRP Solver
Implements: vrp-regression-tester & disruption-model-drift-checker skills.
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from app.main import app
from app.ml.synthetic_data import generate_semi_synthetic_features, NER_ROAD_SEGMENTS
from app.ml.ensemble_model import ensemble_scorer, DISRUPTION_ALERT_THRESHOLD
from app.ml.route_optimizer import route_optimizer

client = TestClient(app)


def test_semi_synthetic_data_generation():
    """Verify semi-synthetic feature generator produces valid geospatial data."""
    features = generate_semi_synthetic_features(rainfall_multiplier=1.0)
    assert len(features) == len(NER_ROAD_SEGMENTS)
    
    for f in features:
        assert "slope_deg" in f
        assert "elevation_m" in f
        assert "antecedent_rain_3day_mm" in f
        assert "soil_moisture_pct" in f
        assert 0.0 <= f["soil_moisture_pct"] <= 100.0


def test_ensemble_risk_scoring_and_threshold():
    """Verify XGBoost ensemble scores critical landslide risk and fires alert at >= 0.70."""
    # Critical condition (steep slope + high rainfall)
    critical_feat = {
        "segment_id": "nh415-seg1",
        "highway": "NH-415",
        "name": "NH-415 Km 42",
        "slope_deg": 24.5,
        "antecedent_rain_3day_mm": 180.0,
        "soil_moisture_pct": 88.0,
        "historical_landslides_5yr": 14,
    }
    res = ensemble_scorer.score_segment(critical_feat)
    assert res["risk_score"] >= DISRUPTION_ALERT_THRESHOLD
    assert res["alert_triggered"] is True
    assert res["severity"] == "critical"

    # Low risk condition
    safe_feat = {
        "segment_id": "sh15-seg1",
        "highway": "SH-15",
        "name": "SH-15 Safe Bypass",
        "slope_deg": 3.2,
        "antecedent_rain_3day_mm": 20.0,
        "soil_moisture_pct": 45.0,
        "historical_landslides_5yr": 1,
    }
    safe_res = ensemble_scorer.score_segment(safe_feat)
    assert safe_res["risk_score"] < DISRUPTION_ALERT_THRESHOLD
    assert safe_res["alert_triggered"] is False


def test_or_tools_vrp_pre_departure_and_mid_trip_rerouting():
    """Verify OR-Tools solver produces candidate routes and supports mid-trip GPS rerouting (Scenario B)."""
    # 1. Standard pre-departure solve
    sol1 = route_optimizer.solve_route(origin="Guwahati", destination="Pasighat", blocked_segments=["nh415-seg1"])
    assert len(sol1["options"]) == 3
    assert sol1["recommended_route_id"] == "route-2-sh15-safe"
    assert sol1["is_mid_trip_reroute"] is False

    # 2. Mid-trip GPS reroute (Scenario B)
    current_gps = {"lat": 26.9000, "lng": 93.9000}
    sol2 = route_optimizer.solve_route(
        origin="Guwahati",
        destination="Pasighat",
        blocked_segments=["nh415-seg1"],
        current_gps=current_gps,
    )
    assert sol2["is_mid_trip_reroute"] is True
    assert sol2["mid_trip_summary"] is not None
    assert sol2["mid_trip_summary"]["reroute_origin_gps"] == current_gps


def test_fastapi_ml_endpoints():
    """Verify FastAPI ML HTTP endpoints."""
    # Daily forecast endpoint
    r_forecast = client.get("/ml/daily-forecast")
    assert r_forecast.status_code == 200
    assert "alerts" in r_forecast.json()
    assert "segments" in r_forecast.json()

    # Optimize route endpoint
    r_opt = client.post("/ml/optimize-route", json={
        "origin": "Guwahati",
        "destination": "Pasighat",
        "blocked_segments": ["nh415-seg1"],
        "current_gps": {"lat": 27.2, "lng": 94.1},
    })
    assert r_opt.status_code == 200
    assert r_opt.json()["recommended_route_id"] == "route-2-sh15-safe"

    # Feature importance endpoint
    r_feat = client.get("/ml/feature-importance")
    assert r_feat.status_code == 200
    assert len(r_feat.json()["feature_radar"]) == 4


if __name__ == "__main__":
    print("Running QA Verification Suite...")
    test_semi_synthetic_data_generation()
    print("  [PASS] Semi-synthetic geospatial feature generator")
    test_ensemble_risk_scoring_and_threshold()
    print("  [PASS] XGBoost landslide risk scorer & 0.70 alert threshold")
    test_or_tools_vrp_pre_departure_and_mid_trip_rerouting()
    print("  [PASS] OR-Tools VRP solver & mid-trip GPS rerouting (Scenario B)")
    test_fastapi_ml_endpoints()
    print("  [PASS] FastAPI ML endpoints (/ml/daily-forecast, /ml/optimize-route, /ml/feature-importance)")
    print("\nALL QA TESTS PASSED SUCCESSFULLY!")

