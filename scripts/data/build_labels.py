"""
NER Logistics — Real-Data Pipeline: Disruption Labels Builder
=============================================================

This script creates the `disruption_next_24h` target labels for the NER logistics
pipeline. It uses the NASA Global Landslide Catalog (GLC) incidents as weak/distant
supervision labels.

Logic:
1. Positives: For every landslide incident, we buffer it by its location accuracy.
   Any road segment intersecting this buffer on the incident date is a positive
   label (disruption_next_24h=1).
2. Negatives: We sample random road segments and dates within the same temporal
   window (2007-2016) such that they don't overlap with positive labels.
3. Train/Val/Test Split: We apply the temporal split defined in ner_config.py.

Usage:
  python build_labels.py [--max-negatives RATIO]
"""
import argparse
import sys
import pandas as pd
import geopandas as gpd
from shapely import wkt
from pathlib import Path
import random
from datetime import datetime
import numpy as np

# Ensure scripts/data is in sys.path so we can import shared modules
sys.path.append(str(Path(__file__).resolve().parent))

from ner_config import (
    PROCESSED_DIR, LABELS_DIR,
    LABEL_ACCURACY_BUFFER_M, LABEL_DEFAULT_BUFFER_M, LABEL_MAX_BUFFER_M,
    LABEL_NEGATIVE_RATIO, TEMPORAL_SPLIT, PROJECT_METRIC_CRS, CRS_WGS84,
    ensure_data_dirs
)
from provenance import DatasetMetadata, write_metadata

def parse_args():
    parser = argparse.ArgumentParser(description="Build disruption labels from landslide incidents.")
    parser.add_argument(
        "--max-negatives", type=int, default=LABEL_NEGATIVE_RATIO,
        help="Number of negative samples per positive label (default from config)"
    )
    return parser.parse_args()

def get_temporal_split(date: pd.Timestamp) -> str:
    """Map a date to train, val, or test split based on ner_config."""
    year = date.year
    if year in TEMPORAL_SPLIT.get("train_years", []):
        return "train"
    elif year in TEMPORAL_SPLIT.get("val_years", []):
        return "val"
    elif year in TEMPORAL_SPLIT.get("test_years", []):
        return "test"
    return "ignore"

def main():
    args = parse_args()
    ensure_data_dirs()
    
    roads_path = PROCESSED_DIR / "road_segments.parquet"
    incidents_path = PROCESSED_DIR / "ner_landslide_incidents.parquet"
    out_path = LABELS_DIR / "disruption_labels.parquet"
    
    if not roads_path.exists() or not incidents_path.exists():
        print("Error: Missing input data. Ensure processed road_segments and ner_landslide_incidents exist.")
        sys.exit(1)
        
    print("Loading data...")
    roads_df = pd.read_parquet(roads_path)
    incidents_df = pd.read_parquet(incidents_path)
    
    print("Converting to GeoDataFrames and reprojecting to metric CRS...")
    if 'geometry_wkt' in roads_df.columns:
        roads_gdf = gpd.GeoDataFrame(
            roads_df, 
            geometry=roads_df['geometry_wkt'].apply(wkt.loads), 
            crs=CRS_WGS84
        )
    else:
        roads_gdf = gpd.GeoDataFrame(roads_df, geometry='geometry', crs=CRS_WGS84)
        
    incidents_gdf = gpd.GeoDataFrame(
        incidents_df,
        geometry=gpd.points_from_xy(incidents_df.longitude, incidents_df.latitude),
        crs=CRS_WGS84
    )
    
    roads_metric = roads_gdf.to_crs(PROJECT_METRIC_CRS)
    incidents_metric = incidents_gdf.to_crs(PROJECT_METRIC_CRS)
    
    print("Building positive labels...")
    def get_buffer(acc):
        if pd.isna(acc):
            return LABEL_DEFAULT_BUFFER_M
        val = LABEL_ACCURACY_BUFFER_M.get(str(acc).lower(), LABEL_DEFAULT_BUFFER_M)
        return min(val, LABEL_MAX_BUFFER_M)
        
    incidents_metric['buffer_m'] = incidents_metric.get('location_accuracy', pd.Series(['unknown']*len(incidents_metric))).apply(get_buffer)
    incidents_buffered = incidents_metric.copy()
    incidents_buffered.geometry = incidents_buffered.geometry.buffer(incidents_buffered['buffer_m'])
    
    # Ensure event_date is datetime
    incidents_buffered['event_date'] = pd.to_datetime(incidents_buffered['event_date'])
    
    # Use sjoin to find intersections
    positives_joined = gpd.sjoin(roads_metric, incidents_buffered, how='inner', predicate='intersects')
    
    # Determine the column for incident event id
    inc_id_col = 'source_event_id' if 'source_event_id' in positives_joined.columns else 'index_right'
    if 'event_id' in positives_joined.columns:
        inc_id_col = 'event_id'
        
    positives = pd.DataFrame({
        'segment_id': positives_joined['segment_id'],
        'date': positives_joined['event_date'].dt.date,
        'disruption_next_24h': 1,
        'label_source': 'REAL',
        'incident_event_id': positives_joined[inc_id_col],
        'location_accuracy': positives_joined.get('location_accuracy', 'unknown'),
        'buffer_m': positives_joined['buffer_m'],
        'state': positives_joined.get('ner_state', positives_joined.get('state'))
    })
    
    # Remove duplicates if multiple incidents hit same segment on same day
    positives = positives.drop_duplicates(subset=['segment_id', 'date'])
    
    print(f"Generated {len(positives)} positive labels.")
    
    print("Building negative labels...")
    # Get the temporal window from positives
    if not positives.empty:
        min_date = positives['date'].min()
        max_date = positives['date'].max()
    else:
        # Fallback based on config
        min_date = pd.to_datetime('2007-04-11').date()
        max_date = pd.to_datetime('2016-10-15').date()
        
    all_dates = [d.date() for d in pd.date_range(min_date, max_date)]
    all_segments = roads_df['segment_id'].tolist()
    
    num_negatives = int(len(positives) * args.max_negatives)
    
    # Create a set of positive segment-date tuples for fast exclusion
    pos_set = set(zip(positives['segment_id'], positives['date']))
    
    negatives_data = []
    attempts = 0
    max_attempts = num_negatives * 5
    
    # Pre-select random dates and segments to speed up sampling
    print(f"Sampling {num_negatives} negatives...")
    while len(negatives_data) < num_negatives and attempts < max_attempts:
        # Batch sample to reduce loop overhead
        batch_size = min(num_negatives - len(negatives_data), 10000)
        sampled_segs = random.choices(all_segments, k=batch_size)
        sampled_dates = random.choices(all_dates, k=batch_size)
        
        for seg, date in zip(sampled_segs, sampled_dates):
            if (seg, date) not in pos_set:
                negatives_data.append({
                    'segment_id': seg,
                    'date': date,
                    'disruption_next_24h': 0,
                    'label_source': 'DERIVED',
                    'incident_event_id': None,
                    'location_accuracy': None,
                    'buffer_m': None,
                    'state': None  # We could merge state later if needed
                })
                pos_set.add((seg, date)) # Ensure uniqueness in negatives too
                if len(negatives_data) >= num_negatives:
                    break
        attempts += batch_size
        
    negatives = pd.DataFrame(negatives_data)
    
    print("Merging and adding temporal splits...")
    labels_df = pd.concat([positives, negatives], ignore_index=True)
    labels_df['date'] = pd.to_datetime(labels_df['date'])
    labels_df['split'] = labels_df['date'].apply(get_temporal_split)
    
    # Drop rows that fall out of the defined splits
    labels_df = labels_df[labels_df['split'] != 'ignore'].copy()
    
    # Write output
    LABELS_DIR.mkdir(parents=True, exist_ok=True)
    labels_df.to_parquet(out_path, index=False)
    
    print("Writing metadata...")
    meta = DatasetMetadata(
        dataset_id="disruption_labels",
        title="Disruption Next 24h Labels",
        data_source_type="DERIVED",
        source_org="NER Logistics Pipeline",
        source_url="n/a",
        license="n/a",
        coverage_region="NER (8 states)",
        ner_coverage="partial",
        date_range=f"{min_date} to {max_date}",
        spatial_resolution="road segment scale",
        file_format="parquet",
        download_method="computed",
        columns=list(labels_df.columns),
        ml_use="Target labels for training the disruption risk model",
        extra={
            "positive_count": int(len(positives)),
            "negative_count": int(len(negatives)),
            "negative_ratio": args.max_negatives
        }
    )
    write_metadata(meta)
    
    # Summary
    print("\n" + "="*50)
    print("LABEL GENERATION SUMMARY")
    print("="*50)
    print(f"Total Labels : {len(labels_df)}")
    
    pos_df = labels_df[labels_df['disruption_next_24h'] == 1]
    neg_df = labels_df[labels_df['disruption_next_24h'] == 0]
    
    print(f"Positives    : {len(pos_df)}")
    print(f"Negatives    : {len(neg_df)}")
    if len(pos_df) > 0:
        print(f"Class Ratio  : 1:{len(neg_df)/len(pos_df):.1f}")
        
    print("\nPositives by Year:")
    pos_by_year = pos_df.groupby(pos_df['date'].dt.year).size()
    for year, count in pos_by_year.items():
        print(f"  {year}: {count}")
        
    print("\nPositives by State:")
    # We only have state for positives from the spatial join
    if 'state' in pos_df.columns:
        pos_by_state = pos_df.groupby('state').size()
        for state, count in pos_by_state.items():
            print(f"  {state}: {count}")
        
    print("\nSplit Counts:")
    for split in ['train', 'val', 'test']:
        split_count = len(labels_df[labels_df['split'] == split])
        print(f"  {split}: {split_count}")
        
    print("\nOutput written to:")
    print(f"  {out_path}")
    print("="*50)

if __name__ == "__main__":
    main()
