import nbformat as nbf
from pathlib import Path

nb = nbf.v4.new_notebook()
cells = []

cells.append(nbf.v4.new_markdown_cell("""# Notebook 1 — XGBoost Disruption Model (Tabular Data)

**Run this on:** Kaggle Notebooks (CPU is fine) or local machine.

**What this builds:** the tabular sub-model of the disruption-prediction
ensemble — one row per road segment per day, predicting probability of a
landslide/flood disruption.

**Datasets used:**
- NASA COOLR (landslide events) — free ArcGIS REST API, no key needed
- Open-Meteo (rainfall history + forecast) — free, no key needed
- A small hardcoded set of NER road-segment coordinates (swap for a full
  OpenStreetMap Overpass pull once you're past initial testing)

Run cells top to bottom. Each cell is self-contained and prints its own output."""))

cells.append(nbf.v4.new_markdown_cell("## 1. Install dependencies"))
cells.append(nbf.v4.new_code_cell("""!pip install -q requests pandas numpy xgboost scikit-learn"""))

cells.append(nbf.v4.new_markdown_cell("""## 2. Define NER road segments

Start with a small, real set of coordinates along major NER highways.
Replace this with a full OpenStreetMap Overpass API pull once this notebook
is working end-to-end — see the Overpass query pattern commented below."""))
cells.append(nbf.v4.new_code_cell("""import pandas as pd

# A starter set of real coordinates along NER highways. Extend this list —
# or replace it entirely with an Overpass API pull (query pattern below).
NER_SEGMENTS = pd.DataFrame([
    {"segment_id": "NH13-KM40", "name": "NH-13, Arunachal Pradesh", "latitude": 27.10, "longitude": 93.62, "slope_deg": 38},
    {"segment_id": "NH6-BARAK",  "name": "NH-6, Barak Valley, Assam", "latitude": 24.83, "longitude": 92.78, "slope_deg": 22},
    {"segment_id": "NH40-KHASI", "name": "NH-40, East Khasi Hills, Meghalaya", "latitude": 25.57, "longitude": 91.88, "slope_deg": 30},
    {"segment_id": "NH102B-IMP", "name": "NH-102B, Imphal-Ukhrul, Manipur", "latitude": 24.98, "longitude": 94.35, "slope_deg": 35},
    {"segment_id": "NH54-AIZ",   "name": "NH-54, Aizawl approach, Mizoram", "latitude": 23.73, "longitude": 92.72, "slope_deg": 28},
])
NER_SEGMENTS

# --- Optional: full OpenStreetMap pull (uncomment to use) ---
# import requests
# OVERPASS_URL = "https://overpass-api.de/api/interpreter"
# query = '''
# [out:json][timeout:60];
# area["name"="Assam"]["boundary"="administrative"]->.searchArea;
# (way["highway"~"^(trunk|primary|secondary)$"](area.searchArea););
# out geom;
# '''
# resp = requests.post(OVERPASS_URL, data={"data": query})
# data = resp.json()
# # ... parse `data['elements']` into the same segment_id/latitude/longitude schema"""))

cells.append(nbf.v4.new_markdown_cell("""## 3. Pull real landslide events (labels) from NASA COOLR

Queries only the NER bounding box, not the full global dataset."""))
cells.append(nbf.v4.new_code_cell("""import requests
import pandas as pd

COOLR_ENDPOINT = "https://maps.nccs.nasa.gov/mapping/rest/services/COOLR/COOLR_Events_Point/FeatureServer/0/query"

NER_BBOX = {"min_lon": 88.0, "min_lat": 22.0, "max_lon": 97.5, "max_lat": 29.5}

params = {
    "where": "1=1",
    "geometry": f"{NER_BBOX['min_lon']},{NER_BBOX['min_lat']},{NER_BBOX['max_lon']},{NER_BBOX['max_lat']}",
    "geometryType": "esriGeometryEnvelope",
    "inSR": "4326",
    "spatialRel": "esriSpatialRelIntersects",
    "outFields": "*",
    "returnGeometry": "true",
    "f": "geojson",
}
headers = {"User-Agent": "ner-disruption-model-research/1.0"}

resp = requests.get(COOLR_ENDPOINT, params=params, headers=headers, timeout=30)
resp.raise_for_status()
geojson = resp.json()

events = []
for feature in geojson.get("features", []):
    props = feature.get("properties", {})
    coords = feature.get("geometry", {}).get("coordinates", [None, None])
    events.append({
        "event_date": props.get("event_date"),
        "trigger": props.get("landslide_trigger"),
        "longitude": coords[0],
        "latitude": coords[1],
    })

landslide_events = pd.DataFrame(events)
print(f"Fetched {len(landslide_events)} real landslide events in the NER bounding box")
landslide_events.head()

# Citation if you publish results using this data:
# Kirschbaum, D.B., Stanley, T., & Zhou, Y. (2015). Spatial and temporal
# analysis of a global landslide catalog. Geomorphology, 249, 4-15."""))

cells.append(nbf.v4.new_markdown_cell("""## 4. Pull daily rainfall history per segment from Open-Meteo (free, no key)"""))
cells.append(nbf.v4.new_code_cell("""import time

OPEN_METEO_ARCHIVE = "https://archive-api.open-meteo.com/v1/archive"
START_DATE, END_DATE = "2023-01-01", "2025-12-31"

all_rainfall = []
for _, seg in NER_SEGMENTS.iterrows():
    params = {
        "latitude": seg["latitude"], "longitude": seg["longitude"],
        "start_date": START_DATE, "end_date": END_DATE,
        "daily": "precipitation_sum", "timezone": "Asia/Kolkata",
    }
    r = requests.get(OPEN_METEO_ARCHIVE, params=params, timeout=30)
    r.raise_for_status()
    daily = r.json()["daily"]
    df = pd.DataFrame({
        "segment_id": seg["segment_id"],
        "date": daily["time"],
        "rainfall_mm": daily["precipitation_sum"],
    })
    all_rainfall.append(df)
    time.sleep(0.3)  # be polite to the free API

rainfall_history = pd.concat(all_rainfall, ignore_index=True)
rainfall_history["date"] = pd.to_datetime(rainfall_history["date"])
print(f"Fetched {len(rainfall_history)} segment-day rainfall rows")
rainfall_history.head()"""))

cells.append(nbf.v4.new_markdown_cell("""## 5. Build the feature table

Joins rainfall history with segment terrain data, computes a rolling 7-day
forecast proxy (using actual future rainfall since we're building history,
not live forecasts), and labels each segment-day using proximity to a real
landslide event (~2km, ~3 days)."""))
cells.append(nbf.v4.new_code_cell("""import numpy as np

df = rainfall_history.merge(NER_SEGMENTS, on="segment_id", how="left")
df = df.sort_values(["segment_id", "date"])

# 7-day forward-looking rainfall sum, used as a forecast proxy for historical training
df["rainfall_forecast_7d_mm"] = (
    df.groupby("segment_id")["rainfall_mm"]
    .transform(lambda s: s.shift(-1).rolling(7, min_periods=1).sum())
)

# Placeholder terrain/soil features — replace with real SRTM/soil-moisture
# pulls once available (see REAL_DATA_GUIDE.md pattern). Flagged explicitly,
# not silently faked as real.
df["soil_moisture_pct"] = np.clip(20 + df["rainfall_mm"].rolling(3, min_periods=1).sum() * 0.5, 0, 100)
df["seismic_activity"] = 0.1  # placeholder — wire a real seismic feed if available
df["ndvi"] = 0.55             # placeholder — wire real NDVI (Sentinel/MODIS) if available
df["dist_to_water_km"] = 2.0  # placeholder — compute from OSM waterway layer
df["historical_incident_rate"] = 0.0

# Label: a real landslide event within ~2km and ~3 days counts as disrupted=1
df["disrupted"] = 0
if len(landslide_events) > 0:
    landslide_events["event_date"] = pd.to_datetime(landslide_events["event_date"], errors="coerce")
    for _, event in landslide_events.dropna(subset=["latitude", "event_date"]).iterrows():
        nearby = (
            (abs(df["latitude"] - event["latitude"]) < 0.02)
            & (abs(df["longitude"] - event["longitude"]) < 0.02)
            & (abs((df["date"] - event["event_date"]).dt.days) <= 3)
        )
        df.loc[nearby, "disrupted"] = 1
        df.loc[nearby, "historical_incident_rate"] += 1

print(f"Positive rate: {df['disrupted'].mean():.4f}  (expect this to be very low/zero with only 5 sample segments — add more segments for a usable rate)")
df.head()"""))

cells.append(nbf.v4.new_markdown_cell("""## 6. Time-based train/val/test split

Never split randomly — split by date, so the model is evaluated on data
chronologically after what it trained on, matching how it'll actually be used."""))
cells.append(nbf.v4.new_code_cell("""df = df.dropna(subset=["rainfall_forecast_7d_mm"])
df["date_ordinal"] = df["date"].map(pd.Timestamp.toordinal)

cutoff_train = df["date_ordinal"].quantile(0.70)
cutoff_val = df["date_ordinal"].quantile(0.85)

train = df[df["date_ordinal"] <= cutoff_train]
val = df[(df["date_ordinal"] > cutoff_train) & (df["date_ordinal"] <= cutoff_val)]
test = df[df["date_ordinal"] > cutoff_val]

print(f"train: {len(train)}, val: {len(val)}, test: {len(test)}")"""))

cells.append(nbf.v4.new_markdown_cell("## 7. Train XGBoost"))
cells.append(nbf.v4.new_code_cell("""import xgboost as xgb

FEATURE_COLS = [
    "rainfall_mm", "rainfall_forecast_7d_mm", "soil_moisture_pct",
    "seismic_activity", "slope_deg", "ndvi", "dist_to_water_km",
    "historical_incident_rate",
]

dtrain = xgb.DMatrix(train[FEATURE_COLS], label=train["disrupted"])
dval = xgb.DMatrix(val[FEATURE_COLS], label=val["disrupted"])
dtest = xgb.DMatrix(test[FEATURE_COLS], label=test["disrupted"])

pos = max((train["disrupted"] == 1).sum(), 1)
neg = (train["disrupted"] == 0).sum()

params = {
    "objective": "binary:logistic", "eval_metric": "auc",
    "max_depth": 5, "eta": 0.1, "scale_pos_weight": neg / pos, "seed": 42,
}

model = xgb.train(
    params, dtrain, num_boost_round=200,
    evals=[(dtrain, "train"), (dval, "val")],
    early_stopping_rounds=15, verbose_eval=20,
)"""))

cells.append(nbf.v4.new_markdown_cell("""## 8. Evaluate — AUC AND precision/recall at the actual 0.7 alert threshold

AUC alone can hide a model that misses most real disruptions at the
threshold you'll actually use operationally."""))
cells.append(nbf.v4.new_code_cell("""from sklearn.metrics import roc_auc_score, precision_score, recall_score, confusion_matrix

ALERT_THRESHOLD = 0.7  # must match shared/config.py in the main project — never redefine independently

test_probs = model.predict(dtest)
test_labels = test["disrupted"].values

auc = roc_auc_score(test_labels, test_probs) if test_labels.sum() > 0 else float("nan")
preds = (test_probs >= ALERT_THRESHOLD).astype(int)
precision = precision_score(test_labels, preds, zero_division=0)
recall = recall_score(test_labels, preds, zero_division=0)

print(f"AUC: {auc:.4f}")
print(f"Precision at {ALERT_THRESHOLD} threshold: {precision:.4f}")
print(f"Recall at {ALERT_THRESHOLD} threshold: {recall:.4f}")
print(f"\\nNOTE: with only 5 sample segments and a short date range, expect weak/undefined\\n"
      f"metrics here. Add more real segments (Overpass pull) and a longer date range\\n"
      f"before trusting these numbers.")"""))

cells.append(nbf.v4.new_markdown_cell("## 9. Save the model and metrics"))
cells.append(nbf.v4.new_code_cell("""import json

model.save_model("xgboost_disruption_model.json")

metrics = {
    "test_auc": float(auc) if not np.isnan(auc) else None,
    "precision_at_threshold": float(precision),
    "recall_at_threshold": float(recall),
    "alert_threshold_used": ALERT_THRESHOLD,
    "train_rows": len(train), "val_rows": len(val), "test_rows": len(test),
}
with open("training_metrics.json", "w") as f:
    json.dump(metrics, f, indent=2)

print("Saved xgboost_disruption_model.json and training_metrics.json")
print("Next: run this through risk_score_validator.py before treating it as deployable.")"""))

nb["cells"] = cells
out_path = Path("ml/notebooks/1_xgboost_tabular.ipynb")
out_path.parent.mkdir(parents=True, exist_ok=True)
nbf.write(nb, str(out_path))
print(f"Notebook 1 written to {out_path}")
