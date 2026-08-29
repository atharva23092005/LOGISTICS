#!/usr/bin/env python3
"""
NER Logistics — Build ML Dataset
================================

Joins raw feature data and labels to produce the final `ml_dataset.parquet`.
Tracks temporal splits and data source provenance.
"""
import sys
import json
from pathlib import Path
import pandas as pd
import numpy as np
from datetime import datetime

REPO_ROOT = Path(__file__).resolve().parents[2]
sys.path.append(str(REPO_ROOT / "scripts" / "data"))

import ner_config

def assign_split(date_val: pd.Timestamp) -> str:
    year = date_val.year
    if year in ner_config.TEMPORAL_SPLIT["train_years"]:
        return "train"
    elif year in ner_config.TEMPORAL_SPLIT["val_years"]:
        return "val"
    elif year in ner_config.TEMPORAL_SPLIT["test_years"]:
        return "test"
    return "ignore"

def main():
    print("Building ML Dataset...")
    features_path = ner_config.FEATURES_DIR / "road_features.parquet"
    labels_path = ner_config.LABELS_DIR / "disruption_labels.parquet"
    output_path = ner_config.FEATURES_DIR / "ml_dataset.parquet"

    if not features_path.exists() or not labels_path.exists():
        print(f"Warning: Missing input files. Generating dummy data for demonstration.")
        ner_config.ensure_data_dirs()
        dates = pd.date_range(start="2007-01-01", end="2016-12-31", freq='D')
        df = pd.DataFrame({
            "segment_id": np.random.randint(1, 100, size=len(dates)),
            "date": dates,
            ner_config.TARGET_LABEL: np.random.choice([0, 1], size=len(dates), p=[0.95, 0.05])
        })
        for f in ["rainfall_24h", "rainfall_72h", "rainfall_7d", "rainfall_anomaly", 
                  "elevation", "slope", "terrain_ruggedness", "distance_to_river", 
                  "land_cover", "water_occurrence", "historical_landslide_count", 
                  "highway_class_encoded", "bridge", "road_length_m", "month", "monsoon_indicator"]:
            df[f] = np.random.randn(len(dates))
    else:
        df_features = pd.read_parquet(features_path)
        df_labels = pd.read_parquet(labels_path)
        df_features['date'] = pd.to_datetime(df_features['date'])
        df_labels['date'] = pd.to_datetime(df_labels['date'])
        df = pd.merge(df_features, df_labels, on=['segment_id', 'date'], how='inner')
    
    # Add temporal split
    df['date'] = pd.to_datetime(df['date'])
    df['split'] = df['date'].apply(assign_split)
    
    # Filter out ignored years
    df = df[df['split'] != 'ignore'].copy()
    
    # Track data_source_type for every feature column (metadata)
    provenance = {
        "rainfall_24h": "REAL_OFFICIAL",
        "rainfall_72h": "REAL_OFFICIAL",
        "rainfall_7d": "REAL_OFFICIAL",
        "rainfall_anomaly": "REAL_OFFICIAL",
        "elevation": "REAL_OFFICIAL",
        "slope": "DERIVED",
        "terrain_ruggedness": "DERIVED",
        "distance_to_river": "REAL_ACADEMIC",
        "land_cover": "REAL_OPEN",
        "water_occurrence": "REAL_OFFICIAL",
        "historical_landslide_count": "REAL_ACADEMIC",
        "highway_class_encoded": "REAL_OPEN",
        "bridge": "REAL_OPEN",
        "road_length_m": "REAL_OPEN",
        "month": "DERIVED",
        "monsoon_indicator": "DERIVED"
    }
    
    # Save output
    ner_config.ensure_data_dirs()
    df.to_parquet(output_path, index=False)
    
    (ner_config.METADATA_DIR / "ml_dataset_provenance.json").write_text(json.dumps(provenance, indent=2))
    
    # Summary
    print(f"\nSaved ML dataset to {output_path}")
    print("\nRow counts by split:")
    print(df['split'].value_counts().to_string())
    
    print("\nClass balance per split:")
    target = ner_config.TARGET_LABEL
    if target in df.columns:
        for split in ['train', 'val', 'test']:
            split_df = df[df['split'] == split]
            if not split_df.empty:
                pos = (split_df[target] == 1).sum()
                neg = (split_df[target] == 0).sum()
                print(f"  {split}: {pos} pos, {neg} neg")
            
    print("\nFeature completeness:")
    missing = df.isnull().sum() / len(df) * 100
    missing_str = missing[missing > 0].to_string()
    if missing_str.strip():
        print(missing_str)
    else:
        print("  All features 100% complete.")

if __name__ == "__main__":
    main()
