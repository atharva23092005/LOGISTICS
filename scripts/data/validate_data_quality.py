#!/usr/bin/env python3
"""
NER Logistics Pipeline — Data Quality Validation
================================================

Runs automated data quality checks across the entire pipeline output to ensure
readiness for ML modeling and downstream applications.

Validates:
1. Road segments (road_segments.parquet)
2. Rainfall (ner_rainfall_daily.nc)
3. Incidents (ner_landslide_incidents.parquet)
4. Feature table (road_features.parquet) - optional
5. Labels (disruption_labels.parquet) - optional

For each check, records: check_name, status (PASS/WARN/FAIL), metric_value, threshold, message.
Outputs: data/validation/data_quality_report.json and a formatted summary table to stdout.
"""
import argparse
import json
import sys
from pathlib import Path
from typing import Any, Dict, List
from datetime import datetime
import traceback

import numpy as np
import pandas as pd
import geopandas as gpd
import xarray as xr

# Ensure we can import from the current directory (for ner_config)
SCRIPT_DIR = Path(__file__).resolve().parent
if str(SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPT_DIR))

from ner_config import (
    PROCESSED_DIR,
    FEATURES_DIR,
    LABELS_DIR,
    VALIDATION_DIR,
    NER_STATES,
    NER_BBOX,
    TEMPORAL_SPLIT,
    CRS_WGS84,
    ensure_data_dirs
)

def evaluate_status(val: float, warn_thresh: float, fail_thresh: float, higher_is_worse: bool = True) -> str:
    """Helper to determine PASS/WARN/FAIL."""
    if higher_is_worse:
        if val >= fail_thresh:
            return "FAIL"
        elif val >= warn_thresh:
            return "WARN"
        return "PASS"
    else:
        if val <= fail_thresh:
            return "FAIL"
        elif val <= warn_thresh:
            return "WARN"
        return "PASS"


class DataValidator:
    def __init__(self, skip_missing: bool = False):
        self.skip_missing = skip_missing
        self.results: List[Dict[str, Any]] = []

    def record_check(self, group: str, name: str, status: str, metric_value: Any, threshold: str, message: str):
        self.results.append({
            "group": group,
            "check_name": name,
            "status": status,
            "metric_value": metric_value,
            "threshold": threshold,
            "message": message,
            "timestamp": datetime.utcnow().isoformat() + "Z"
        })

    def check_file_exists(self, filepath: Path) -> bool:
        if not filepath.exists():
            if self.skip_missing:
                print(f"Skipping missing file: {filepath.name}")
                return False
            else:
                self.record_check(filepath.name, "file_exists", "FAIL", False, "True", f"File not found: {filepath}")
                return False
        return True

    def validate_road_segments(self):
        filepath = PROCESSED_DIR / "road_segments.parquet"
        if not self.check_file_exists(filepath):
            return
        
        group = "road_segments"
        try:
            gdf = gpd.read_parquet(filepath)
            
            # Missing values
            missing_pct = gdf.isnull().mean().max() * 100
            status = evaluate_status(missing_pct, 1.0, 5.0, higher_is_worse=True)
            self.record_check(group, "missing_values", status, round(missing_pct, 2), "< 5%", f"Max missing in any col: {missing_pct:.2f}%")

            # Duplicate segment_ids
            if "segment_id" in gdf.columns:
                dupes = gdf["segment_id"].duplicated().sum()
                self.record_check(group, "duplicate_segments", "FAIL" if dupes > 0 else "PASS", int(dupes), "0", f"Found {dupes} duplicate segment_ids")
            else:
                self.record_check(group, "duplicate_segments", "FAIL", "N/A", "0", "segment_id column missing")

            # Invalid coordinates
            bounds = gdf.total_bounds
            # [minx, miny, maxx, maxy] (lng, lat)
            invalid_coords = (
                bounds[0] < NER_BBOX["min_lng"] or bounds[2] > NER_BBOX["max_lng"] or
                bounds[1] < NER_BBOX["min_lat"] or bounds[3] > NER_BBOX["max_lat"]
            )
            self.record_check(group, "valid_coordinates", "WARN" if invalid_coords else "PASS", 
                              f"bbox={list(np.round(bounds, 2))}", f"within {NER_BBOX}", 
                              "Geometries extend outside NER bounding box" if invalid_coords else "Geometries within NER bbox")

            # State coverage
            if "state" in gdf.columns:
                states_present = set(gdf["state"].dropna().unique())
                expected_states = set(NER_STATES)
                missing_states = expected_states - states_present
                self.record_check(group, "states_coverage", "FAIL" if missing_states else "PASS", 
                                  len(states_present), str(len(expected_states)), 
                                  f"Missing states: {missing_states}" if missing_states else "All NER states covered")

            # Zero-length segments
            if not gdf.empty:
                # Approximate length check if unprojected (not recommended for true length, but catches literal 0)
                zero_len = (gdf.geometry.length == 0).sum()
                status = "WARN" if zero_len > 0 else "PASS"
                self.record_check(group, "zero_length_segments", status, int(zero_len), "0", f"Found {zero_len} segments with 0 length")

        except Exception as e:
            self.record_check(group, "load_error", "FAIL", str(e), "N/A", f"Exception during validation: {traceback.format_exc()}")

    def validate_rainfall(self):
        filepath = PROCESSED_DIR / "ner_rainfall_daily.nc"
        if not self.check_file_exists(filepath):
            return
        
        group = "rainfall"
        try:
            ds = xr.open_dataset(filepath)
            var_name = list(ds.data_vars.keys())[0] if len(ds.data_vars) > 0 else None
            
            if var_name:
                da = ds[var_name]
                
                # Missing values
                nan_pct = float((np.isnan(da).sum() / da.size).values) * 100
                # Over ocean / outside landmask might naturally be NaN, so WARN heavily instead of FAIL unless 100%
                status = evaluate_status(nan_pct, 50.0, 99.0, higher_is_worse=True)
                self.record_check(group, "missing_values", status, round(nan_pct, 2), "< 99%", f"{nan_pct:.2f}% NaN values")

                # Impossible values
                neg_count = int((da < 0).sum().values)
                high_count = int((da > 1000).sum().values)
                status = "FAIL" if neg_count > 0 else ("WARN" if high_count > 0 else "PASS")
                self.record_check(group, "impossible_values", status, f"neg:{neg_count}, >1000:{high_count}", "0 negative", "Checked for < 0 or > 1000 mm/day")
            else:
                self.record_check(group, "missing_values", "FAIL", "N/A", "1 variable", "No data variables found in netCDF")
            
            # Temporal gaps
            if "time" in ds.coords:
                times = pd.to_datetime(ds.time.values)
                expected_days = (times.max() - times.min()).days + 1
                actual_days = len(times)
                status = "FAIL" if actual_days != expected_days else "PASS"
                self.record_check(group, "temporal_gaps", status, actual_days, str(expected_days), f"Expected {expected_days} daily steps, found {actual_days}")
                
            ds.close()
        except Exception as e:
            self.record_check(group, "load_error", "FAIL", str(e), "N/A", f"Exception during validation: {traceback.format_exc()}")

    def validate_incidents(self):
        filepath = PROCESSED_DIR / "ner_landslide_incidents.parquet"
        if not self.check_file_exists(filepath):
            return
        
        group = "incidents"
        try:
            df = pd.read_parquet(filepath)
            if "geometry_wkt" in df.columns:
                from shapely import wkt
                gdf = gpd.GeoDataFrame(df, geometry=df["geometry_wkt"].apply(wkt.loads), crs=CRS_WGS84)
            elif "latitude" in df.columns and "longitude" in df.columns:
                gdf = gpd.GeoDataFrame(df, geometry=gpd.points_from_xy(df["longitude"], df["latitude"]), crs=CRS_WGS84)
            else:
                gdf = df
            
            # Duplicate event_ids
            if "event_id" in gdf.columns:
                dupes = gdf["event_id"].duplicated().sum()
                self.record_check(group, "duplicate_events", "FAIL" if dupes > 0 else "PASS", int(dupes), "0", f"Found {dupes} duplicate event_ids")
                
            # Invalid coordinates
            bounds = gdf.total_bounds
            invalid_coords = (
                bounds[0] < NER_BBOX["min_lng"] or bounds[2] > NER_BBOX["max_lng"] or
                bounds[1] < NER_BBOX["min_lat"] or bounds[3] > NER_BBOX["max_lat"]
            )
            self.record_check(group, "valid_coordinates", "WARN" if invalid_coords else "PASS", 
                              f"bbox={list(np.round(bounds, 2))}", f"within {NER_BBOX}", 
                              "Incidents extend outside NER bounding box" if invalid_coords else "Incidents within NER bbox")

            # Missing dates & Date range
            if "date" in gdf.columns or "event_date" in gdf.columns:
                date_col = "date" if "date" in gdf.columns else "event_date"
                missing_dates = gdf[date_col].isnull().sum()
                self.record_check(group, "missing_dates", "FAIL" if missing_dates > 0 else "PASS", int(missing_dates), "0", f"{missing_dates} missing dates")
                
                if not gdf[date_col].isnull().all():
                    min_d, max_d = gdf[date_col].min(), gdf[date_col].max()
                    self.record_check(group, "date_range", "PASS", f"{min_d.date()} to {max_d.date()}", "N/A", "Temporal coverage of incidents")
            else:
                self.record_check(group, "missing_dates", "FAIL", "N/A", "0", "No date/event_date column found")

            # State coverage
            if "state" in gdf.columns:
                states_present = set(gdf["state"].dropna().unique())
                # For incidents, it's possible not ALL states have landslides, so WARN if missing
                expected_states = set(NER_STATES)
                missing_states = expected_states - states_present
                self.record_check(group, "states_coverage", "WARN" if missing_states else "PASS", 
                                  len(states_present), str(len(expected_states)), 
                                  f"Missing states: {missing_states}")

        except Exception as e:
            self.record_check(group, "load_error", "FAIL", str(e), "N/A", f"Exception during validation: {traceback.format_exc()}")

    def validate_features(self):
        filepath = FEATURES_DIR / "road_features.parquet"
        if not self.check_file_exists(filepath):
            return
            
        group = "features"
        try:
            df = pd.read_parquet(filepath)
            
            # Missing values per feature
            missing_pct = df.isnull().mean().max() * 100
            status = evaluate_status(missing_pct, 1.0, 5.0, higher_is_worse=True)
            self.record_check(group, "missing_values", status, round(missing_pct, 2), "< 5%", f"Max missing in any col: {missing_pct:.2f}%")

            # Duplicate (segment_id, date) pairs
            if "segment_id" in df.columns and "date" in df.columns:
                dupes = df.duplicated(subset=["segment_id", "date"]).sum()
                self.record_check(group, "duplicate_pairs", "FAIL" if dupes > 0 else "PASS", int(dupes), "0", f"Found {dupes} duplicate (segment_id, date) pairs")

            # Outliers
            if "rainfall" in df.columns:
                outliers = (df["rainfall"] > 500).sum()
                self.record_check(group, "outliers_rainfall", "WARN" if outliers > 0 else "PASS", int(outliers), "0", f"Found {outliers} records with rainfall > 500mm")
            
            if "slope" in df.columns:
                outliers = (df["slope"] > 80).sum()
                self.record_check(group, "outliers_slope", "WARN" if outliers > 0 else "PASS", int(outliers), "0", f"Found {outliers} records with slope > 80 deg")
                
            if "elevation" in df.columns:
                outliers = (df["elevation"] < 0).sum()
                self.record_check(group, "outliers_elevation", "WARN" if outliers > 0 else "PASS", int(outliers), "0", f"Found {outliers} records with negative elevation")

            # State/district completeness
            if "state" in df.columns:
                missing_states = set(NER_STATES) - set(df["state"].dropna().unique())
                self.record_check(group, "states_completeness", "FAIL" if missing_states else "PASS", 
                                  len(set(df["state"].dropna().unique())), str(len(NER_STATES)), 
                                  f"Missing states: {missing_states}" if missing_states else "All states present")

        except Exception as e:
            self.record_check(group, "load_error", "FAIL", str(e), "N/A", f"Exception during validation: {traceback.format_exc()}")

    def validate_labels(self):
        filepath = LABELS_DIR / "disruption_labels.parquet"
        if not self.check_file_exists(filepath):
            return
            
        group = "labels"
        try:
            df = pd.read_parquet(filepath)
            
            # Class balance
            if "disruption_next_24h" in df.columns:
                positives = df["disruption_next_24h"].sum()
                total = len(df)
                pos_pct = (positives / total) * 100 if total > 0 else 0
                status = "WARN" if (pos_pct < 0.1 or pos_pct > 50.0) else "PASS"
                self.record_check(group, "class_balance", status, f"{pos_pct:.2f}%", "0.1% - 50%", f"{positives}/{total} positives")
            else:
                self.record_check(group, "class_balance", "FAIL", "N/A", "0.1% - 50%", "Target label column missing")

            # Temporal split correctness
            if "date" in df.columns:
                years = pd.to_datetime(df["date"]).dt.year.unique()
                all_config_years = set(TEMPORAL_SPLIT["train_years"] + TEMPORAL_SPLIT["val_years"] + TEMPORAL_SPLIT["test_years"])
                unknown_years = set(years) - all_config_years
                self.record_check(group, "temporal_split", "WARN" if unknown_years else "PASS", 
                                  len(unknown_years), "0", 
                                  f"Years not in split config: {unknown_years}" if unknown_years else "All label years in config")
                
            # Orphan segment_ids
            road_filepath = PROCESSED_DIR / "road_segments.parquet"
            if "segment_id" in df.columns and road_filepath.exists():
                roads = pd.read_parquet(road_filepath, columns=["segment_id"])
                orphans = set(df["segment_id"]) - set(roads["segment_id"])
                self.record_check(group, "orphan_segments", "FAIL" if orphans else "PASS", len(orphans), "0", f"Found {len(orphans)} segment_ids in labels missing from road_segments")

        except Exception as e:
            self.record_check(group, "load_error", "FAIL", str(e), "N/A", f"Exception during validation: {traceback.format_exc()}")

    def run_all(self):
        self.validate_road_segments()
        self.validate_rainfall()
        self.validate_incidents()
        self.validate_features()
        self.validate_labels()
        
    def export_report(self):
        ensure_data_dirs()
        out_file = VALIDATION_DIR / "data_quality_report.json"
        with open(out_file, "w") as f:
            json.dump({
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "checks": self.results
            }, f, indent=2)
        return out_file

    def print_summary(self):
        print(f"\n{'='*80}")
        print(f"NER Logistics Pipeline - Data Quality Report")
        print(f"{'='*80}")
        print(f"{'Group':<15} | {'Check Name':<20} | {'Status':<6} | {'Metric Value':<20} | {'Message'}")
        print(f"{'-'*15}-+-{'-'*20}-+-{'-'*6}-+-{'-'*20}-+-{'-'*30}")
        
        fails, warns, passes = 0, 0, 0
        for r in self.results:
            group = r['group'][:15]
            name = r['check_name'][:20]
            status = r['status']
            val = str(r['metric_value'])[:20]
            msg = str(r['message'])[:80]
            
            if status == "FAIL": fails += 1
            elif status == "WARN": warns += 1
            else: passes += 1
                
            print(f"{group:<15} | {name:<20} | {status:<6} | {val:<20} | {msg}")
            
        print(f"{'='*80}")
        print(f"Summary: {passes} PASS | {warns} WARN | {fails} FAIL")
        print(f"{'='*80}\n")

def main():
    parser = argparse.ArgumentParser(description="Validate data quality for NER Logistics Pipeline")
    parser.add_argument("--skip-missing", action="store_true", help="Skip checks for missing files instead of failing")
    args = parser.parse_args()

    validator = DataValidator(skip_missing=args.skip_missing)
    print("Running data quality checks...")
    validator.run_all()
    
    report_file = validator.export_report()
    validator.print_summary()
    print(f"Detailed JSON report saved to: {report_file}")
    
    if any(r['status'] == 'FAIL' for r in validator.results):
        sys.exit(1)

if __name__ == "__main__":
    main()
