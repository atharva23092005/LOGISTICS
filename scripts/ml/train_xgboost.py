#!/usr/bin/env python3
"""
NER Logistics — Train XGBoost Model
===================================

Trains the disruption_next_24h prediction model.
Handles class imbalance, calibrates probabilities, and generates risk categories.
"""
import sys
import json
import warnings
from pathlib import Path
from datetime import datetime
import pandas as pd
import numpy as np

# Suppress warnings
warnings.filterwarnings('ignore')

import joblib
import xgboost as xgb
from sklearn.calibration import CalibratedClassifierCV
from sklearn.metrics import (
    average_precision_score, 
    roc_auc_score, 
    precision_score, 
    recall_score, 
    f1_score, 
    confusion_matrix
)

# Paths
REPO_ROOT = Path(__file__).resolve().parents[2]
sys.path.append(str(REPO_ROOT / "scripts" / "data"))
sys.path.append(str(REPO_ROOT / "python-service"))

import ner_config
from app.config import MODEL_DIR, ensure_dirs, DISRUPTION_ALERT_THRESHOLD

FEATURES = [
    "rainfall_24h", "rainfall_72h", "rainfall_7d", "rainfall_anomaly",
    "elevation", "slope", "terrain_ruggedness",
    "distance_to_river",
    "land_cover", "water_occurrence",
    "historical_landslide_count",
    "highway_class_encoded",
    "bridge",
    "road_length_m",
    "month", "monsoon_indicator"
]

def generate_dummy_data():
    np.random.seed(42)
    dates = pd.date_range(start="2007-01-01", end="2016-12-31", freq='D')
    splits = []
    for d in dates:
        if d.year <= 2013: splits.append("train")
        elif d.year == 2014: splits.append("val")
        else: splits.append("test")
        
    df = pd.DataFrame({
        "segment_id": np.random.randint(1, 100, size=len(dates)),
        "date": dates,
        "split": splits,
        ner_config.TARGET_LABEL: np.random.choice([0, 1], size=len(dates), p=[0.95, 0.05])
    })
    for f in FEATURES:
        df[f] = np.random.randn(len(dates))
    return df

def main():
    print("Starting XGBoost training pipeline...")
    ensure_dirs()
    
    dataset_path = ner_config.FEATURES_DIR / "ml_dataset.parquet"
    if dataset_path.exists():
        df = pd.read_parquet(dataset_path)
    else:
        print(f"Warning: {dataset_path} not found. Using generated dummy data for testing.")
        df = generate_dummy_data()

    # Temporal Split
    train_df = df[df['split'] == 'train']
    val_df = df[df['split'] == 'val']
    test_df = df[df['split'] == 'test']
    
    target = ner_config.TARGET_LABEL
    
    X_train, y_train = train_df[FEATURES], train_df[target]
    X_val, y_val = val_df[FEATURES], val_df[target]
    X_test, y_test = test_df[FEATURES], test_df[target]
    
    # Class imbalance scale_pos_weight
    neg_count = (y_train == 0).sum()
    pos_count = (y_train == 1).sum()
    scale_pos_weight = neg_count / max(1, pos_count)
    
    print(f"Train size: {len(X_train)}, Val size: {len(X_val)}, Test size: {len(X_test)}")
    print(f"Positives in train: {pos_count}, Negatives: {neg_count} (scale_pos_weight: {scale_pos_weight:.2f})")
    
    # 4. Train XGBClassifier
    xgb_model = xgb.XGBClassifier(
        objective='binary:logistic',
        eval_metric=['logloss', 'aucpr'],
        early_stopping_rounds=50,
        n_estimators=500,
        learning_rate=0.05,
        max_depth=6,
        subsample=0.8,
        colsample_bytree=0.8,
        scale_pos_weight=scale_pos_weight,
        random_state=42
    )
    
    print("Training XGBoost model...")
    xgb_model.fit(
        X_train, y_train,
        eval_set=[(X_val, y_val)],
        verbose=False
    )
    
    # 5. Calibrate probabilities
    print("Calibrating model on validation set...")
    calibrated_clf = CalibratedClassifierCV(
        estimator=xgb_model,
        method='isotonic',
        cv='prefit'
    )
    calibrated_clf.fit(X_val, y_val)
    
    # 6. Evaluate on test set
    y_test_probs = calibrated_clf.predict_proba(X_test)[:, 1]
    y_test_preds = (y_test_probs >= DISRUPTION_ALERT_THRESHOLD).astype(int)
    
    pr_auc = average_precision_score(y_test, y_test_probs)
    roc_auc = roc_auc_score(y_test, y_test_probs)
    prec = precision_score(y_test, y_test_preds, zero_division=0)
    rec = recall_score(y_test, y_test_preds, zero_division=0)
    f1 = f1_score(y_test, y_test_preds, zero_division=0)
    cm = confusion_matrix(y_test, y_test_preds).tolist()
    
    print("\n--- Evaluation on Test Set ---")
    print(f"PR-AUC (Primary) : {pr_auc:.4f}")
    print(f"ROC-AUC          : {roc_auc:.4f}")
    print(f"Precision@{DISRUPTION_ALERT_THRESHOLD}     : {prec:.4f}")
    print(f"Recall@{DISRUPTION_ALERT_THRESHOLD}        : {rec:.4f}")
    print(f"F1-Score@{DISRUPTION_ALERT_THRESHOLD}      : {f1:.4f}")
    print(f"Confusion Matrix : {cm}")
    
    # Feature importance
    importance = xgb_model.get_booster().get_score(importance_type='gain')
    print("\nTop Features by Gain:")
    for k, v in sorted(importance.items(), key=lambda item: item[1], reverse=True)[:5]:
        print(f"  {k}: {v:.2f}")
        
    # 7. Generate risk categories
    test_df['pred_prob'] = y_test_probs
    test_df['risk_category'] = test_df['pred_prob'].apply(ner_config.risk_category)
    
    # 8. Save artifacts
    print("\nSaving models and metadata to models/ ...")
    joblib.dump(xgb_model, MODEL_DIR / "disruption_xgb.joblib")
    joblib.dump(calibrated_clf, MODEL_DIR / "calibrator.joblib")
    
    schema = {
        "features": FEATURES,
        "dtypes": {f: "float32" for f in FEATURES}
    }
    (MODEL_DIR / "feature_schema.json").write_text(json.dumps(schema, indent=2))
    
    metadata = {
        "training_period": f"{ner_config.TEMPORAL_SPLIT['train_years'][0]}-{ner_config.TEMPORAL_SPLIT['train_years'][-1]}",
        "features": FEATURES,
        "version": "1.0.0",
        "metrics": {
            "pr_auc": float(pr_auc),
            "roc_auc": float(roc_auc),
            "precision_at_threshold": float(prec),
            "recall_at_threshold": float(rec),
            "f1_at_threshold": float(f1)
        },
        "limitations": "Model relies on past disruption records and ignores unmeasured real-time conditions.",
        "generated_at": datetime.utcnow().isoformat()
    }
    (MODEL_DIR / "metadata.json").write_text(json.dumps(metadata, indent=2))
    
    eval_report = {
        "test_metrics": metadata["metrics"],
        "confusion_matrix": cm,
        "feature_importance_gain": {k: float(v) for k, v in importance.items()},
        "threshold_used": DISRUPTION_ALERT_THRESHOLD,
        "risk_category_distribution": test_df['risk_category'].value_counts().to_dict()
    }
    (MODEL_DIR / "evaluation_report.json").write_text(json.dumps(eval_report, indent=2))
    
    print("Done!")

if __name__ == "__main__":
    main()
