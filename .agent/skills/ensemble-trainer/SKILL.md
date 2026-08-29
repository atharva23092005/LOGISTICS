---
name: ensemble-trainer
description: Use this skill when the user asks to train, retrain, or update the road-disruption risk prediction model, or mentions XGBoost, LSTM, CNN ensemble, risk score, or landslide/flood prediction for the logistics platform.
---

# Disruption Prediction Ensemble Trainer

## Goal
Train and validate the three-model ensemble (XGBoost on structured features, LSTM on temporal weather sequences, CNN on satellite imagery) that produces a per-road-segment risk score in [0, 1], and log every run so results are reproducible and comparable across experiments.

## Instructions

1. **Locate or build the feature set.**
   - Check for `data/features/road_segments_features.parquet`. If missing, run `scripts/build_features.py`, which joins:
     - IMD rainfall (current + 7-day forecast)
     - Slope angle/aspect from DEM
     - Soil moisture index
     - Seismic activity
     - Road condition history
     - NDVI (vegetation cover)
     - Proximity to water bodies
   - If any source is unavailable, fall back to the synthetic generator (see `synthetic-data-generator` skill) and clearly label the run as `synthetic=true` in the experiment log — never silently mix synthetic and real rows in the same training set without a flag column.

2. **Split the data before touching any model.**
   - Time-based split, not random: earlier data for train, most recent for validation, most recent for test. Random splitting leaks future weather patterns into training and inflates accuracy.
   - Persist the split indices to `data/splits/{run_id}.json` so every model in the ensemble trains/evaluates on identical splits.

3. **Train each sub-model independently.**
   - XGBoost: structured tabular features only. Use early stopping on validation AUC.
   - LSTM: sequences of the last 14 days of weather/soil features per segment. Normalize per-feature using train-set statistics only.
   - CNN: satellite imagery patches per segment (Bhuvan tiles). Use a lightweight backbone (e.g., MobileNetV3) given likely compute constraints — do not default to a large architecture without checking available GPU memory first (see `gpu-check` skill).

4. **Combine into an ensemble.**
   - Default combination: weighted average of the three models' output probabilities, with weights tuned on the validation set (not test).
   - Output a single risk score per segment in [0, 1].

5. **Log the run.**
   - Record: git commit hash, dataset version/hash, split file used, hyperparameters, per-model and ensemble AUC/precision/recall, and the synthetic-data flag.
   - Write to MLflow if configured; otherwise append a row to `experiments/log.csv`.

6. **Report results in plain terms**, not just raw metrics: state ensemble AUC, precision/recall at the 0.7 alert threshold specifically (since that's the operational cutoff), and flag if performance is below the 80% accuracy target from the project's success metrics.

## Examples

**Input:** "Retrain the disruption model with this week's new field reports added."
**Action:** Rebuild features including the new field reports, re-run the time-based split, retrain all three sub-models, log as a new run, report AUC and precision/recall at threshold 0.7 compared to the previous run.

**Input:** "Why is the model flagging too many false alarms?"
**Action:** Don't retrain blindly. First pull the last run's confusion matrix at threshold 0.7, check precision specifically, and inspect whether synthetic data was over-represented in training.

## Constraints
- Never train on the test split, even accidentally through hyperparameter tuning.
- Never report ensemble accuracy without also reporting precision/recall at the actual 0.7 alert threshold — a high AUC can hide a threshold that triggers useless alert floods.
- Never delete a previous run's logged metrics or checkpoint when starting a new run.
- Never mix synthetic and real data in a training set without an explicit flag column tracking provenance per row.
- If GPU memory is insufficient for the CNN branch, stop and report it rather than silently falling back to CPU (which can take hours and looks like a hang).
