"""
build_fusion.py — Geospatial Data-Fusion: ROAD_SEGMENT × DATE feature table
=============================================================================

The MOST IMPORTANT script in the pipeline. Joins all real environmental /
geospatial layers onto the road-segment spine to create the unified feature
table that drives the XGBoost disruption-risk model.

INPUTS (all must exist in data/processed/):
  road_segments.parquet          (OSM road network — spatial spine)
  ner_rainfall_daily.nc          (IMD 0.25° daily rainfall)
  ner_dem_30m.tif                (Copernicus GLO-30 DEM — elevation)
  ner_slope_deg.tif              (DERIVED slope)
  ner_tri.tif                    (DERIVED terrain ruggedness)
  ner_rivers.gpkg                (HydroRIVERS river lines)
  ner_landslide_incidents.parquet (NASA GLC — for historical count features)

RASTER DATA READ ON-THE-FLY (via windowed COG reads — never bulk-downloaded):
  ESA WorldCover 10 m tiles      → land_cover class
  JRC Global Surface Water tiles  → water_occurrence %

OUTPUT:
  data/features/road_features.parquet   — one row per (segment_id, date)
  data/metadata/road_features.json      — provenance record

SPATIAL JOIN STRATEGY (every join explained):
  ┌─────────────────┬──────────────────────┬──────────────────────────────────┐
  │ Layer           │ Join Type            │ How                              │
  ├─────────────────┼──────────────────────┼──────────────────────────────────┤
  │ Road → Elev     │ Raster-to-vector     │ rasterio.sample() at centroid    │
  │ Road → Slope    │ Raster-to-vector     │ rasterio.sample() at centroid    │
  │ Road → TRI      │ Raster-to-vector     │ rasterio.sample() at centroid    │
  │ Road → Rainfall │ Nearest-neighbor     │ KDTree on IMD grid → daily vals  │
  │ Road → Rivers   │ Nearest-geom dist    │ shapely nearest_points in UTM    │
  │ Road → Landcover│ Raster-to-vector     │ windowed COG read at centroid    │
  │ Road → Water    │ Raster-to-vector     │ windowed COG read at centroid    │
  │ Road → Incidents│ Buffered spatial     │ count incidents within radius    │
  └─────────────────┴──────────────────────┴──────────────────────────────────┘

Usage:
  python build_fusion.py                        # full build (all segments × dates)
  python build_fusion.py --start 2007 --end 2016  # custom date range
  python build_fusion.py --sample 500           # random subset of segments (dev)
  python build_fusion.py --skip-raster          # skip slow raster sampling (dev)
"""
from __future__ import annotations

import argparse
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

import numpy as np
import pandas as pd

sys.path.insert(0, str(Path(__file__).resolve().parent))
from ner_config import (  # noqa: E402
    NER_BBOX, PROCESSED_DIR, FEATURES_DIR, CRS_WGS84, PROJECT_METRIC_CRS,
    TEMPORAL_SPLIT, ensure_data_dirs,
)
from provenance import DatasetMetadata, write_metadata  # noqa: E402


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


# ─────────────────────────────────────────────────────────────────────────────
# 1. Load road segments (the spatial spine)
# ─────────────────────────────────────────────────────────────────────────────
def load_road_segments(sample: Optional[int] = None):
    """
    Load the road-segment spine from parquet. Each row is a single road
    segment with segment_id, state, highway, geometry_wkt, etc.
    Returns a GeoDataFrame in WGS84 (EPSG:4326).
    """
    import geopandas as gpd
    from shapely import wkt

    pq = PROCESSED_DIR / "road_segments.parquet"
    if not pq.exists():
        raise FileNotFoundError(
            f"Road segments not found at {pq}. Run download_osm.py first."
        )
    df = pd.read_parquet(pq)
    print(f"  [load] road_segments: {len(df):,} rows, {df['state'].nunique()} states")

    # reconstruct geometry from WKT
    df["geometry"] = df["geometry_wkt"].apply(wkt.loads)
    gdf = gpd.GeoDataFrame(df, geometry="geometry", crs=CRS_WGS84)

    if sample and sample < len(gdf):
        gdf = gdf.sample(n=sample, random_state=42).reset_index(drop=True)
        print(f"  [sample] using {len(gdf):,} segments (dev mode)")
    return gdf


# ─────────────────────────────────────────────────────────────────────────────
# 2. Sample raster values at segment centroids
# ─────────────────────────────────────────────────────────────────────────────
def sample_raster_at_centroids(gdf, raster_path: Path, col_name: str):
    """
    Sample a GeoTIFF raster at each road segment's centroid.
    Uses rasterio.sample() which reads only the needed pixels.
    Centroid is computed in WGS84 (good enough for ~25km grid rasters).
    """
    import rasterio

    if not raster_path.exists():
        print(f"  [warn] {raster_path.name} not found — {col_name} will be NaN")
        gdf[col_name] = np.nan
        return gdf

    centroids = gdf.geometry.centroid
    coords = list(zip(centroids.x, centroids.y))  # (lng, lat) for rasterio

    with rasterio.open(raster_path) as src:
        vals = list(src.sample(coords))
    gdf[col_name] = [float(v[0]) if v[0] != src.nodata and not np.isnan(v[0]) else np.nan
                     for v in vals]
    valid = gdf[col_name].notna().sum()
    print(f"  [raster] {col_name}: {valid:,}/{len(gdf):,} valid from {raster_path.name}")
    return gdf


def sample_terrain(gdf):
    """Sample elevation, slope, and TRI from the processed DEM rasters."""
    gdf = sample_raster_at_centroids(gdf, PROCESSED_DIR / "ner_dem_30m.tif", "elevation")
    gdf = sample_raster_at_centroids(gdf, PROCESSED_DIR / "ner_slope_deg.tif", "slope")
    gdf = sample_raster_at_centroids(gdf, PROCESSED_DIR / "ner_tri.tif", "terrain_ruggedness")
    return gdf


# ─────────────────────────────────────────────────────────────────────────────
# 3. Land cover + water (windowed COG reads from remote tiles)
# ─────────────────────────────────────────────────────────────────────────────
def sample_landcover_and_water(gdf, skip_raster: bool = False):
    """
    Sample ESA WorldCover (land_cover class) and JRC Global Surface Water
    (water_occurrence %) at each segment centroid via windowed COG reads.
    These read directly from S3/GCS — no bulk download needed.
    """
    if skip_raster:
        gdf["land_cover"] = np.nan
        gdf["water_occurrence"] = np.nan
        print("  [skip] land_cover + water_occurrence (--skip-raster)")
        return gdf

    # import the samplers from the hydro download script
    sys.path.insert(0, str(Path(__file__).resolve().parent))
    try:
        from download_hydro import sample_landcover, sample_water_occurrence

        centroids = gdf.geometry.centroid
        points = list(zip(centroids.x, centroids.y))  # (lng, lat)

        print(f"  [cog] sampling ESA WorldCover at {len(points):,} centroids ...")
        gdf["land_cover"] = sample_landcover(points)
        valid_lc = sum(1 for v in gdf["land_cover"] if v is not None)
        print(f"         {valid_lc:,} valid land_cover values")

        print(f"  [cog] sampling JRC Surface Water at {len(points):,} centroids ...")
        gdf["water_occurrence"] = sample_water_occurrence(points)
        valid_wo = sum(1 for v in gdf["water_occurrence"] if v is not None)
        print(f"         {valid_wo:,} valid water_occurrence values")

    except Exception as e:
        print(f"  [warn] COG sampling failed ({type(e).__name__}: {e})")
        gdf["land_cover"] = np.nan
        gdf["water_occurrence"] = np.nan

    return gdf


# ─────────────────────────────────────────────────────────────────────────────
# 4. Distance to nearest river (vector → vector nearest-geometry)
# ─────────────────────────────────────────────────────────────────────────────
def compute_distance_to_river(gdf):
    """
    For each road segment, compute the distance (in meters) to the nearest
    river line from HydroRIVERS. Uses projected CRS (UTM 46N) for accurate
    metric distances, NOT naive lat/lon Euclidean distance.
    """
    import geopandas as gpd
    from shapely.ops import nearest_points

    rivers_path = PROCESSED_DIR / "ner_rivers.gpkg"
    if not rivers_path.exists():
        print("  [warn] ner_rivers.gpkg not found — distance_to_river will be NaN")
        gdf["distance_to_river"] = np.nan
        return gdf

    rivers = gpd.read_file(rivers_path)
    print(f"  [load] rivers: {len(rivers):,} reaches")

    # project both to metric CRS for distance calculation
    seg_utm = gdf.to_crs(PROJECT_METRIC_CRS)
    riv_utm = rivers.to_crs(PROJECT_METRIC_CRS)

    # build a union of all river geometries for efficient nearest lookup
    from shapely.ops import unary_union
    river_union = unary_union(riv_utm.geometry.values)

    centroids_utm = seg_utm.geometry.centroid
    print(f"  [dist] computing distance to nearest river for {len(gdf):,} segments ...")
    distances = []
    for i, c in enumerate(centroids_utm):
        try:
            _, nearest_pt = nearest_points(c, river_union)
            distances.append(c.distance(nearest_pt))
        except Exception:
            distances.append(np.nan)
        if (i + 1) % 5000 == 0:
            print(f"         {i+1:,}/{len(gdf):,} done")

    gdf["distance_to_river"] = [round(d, 1) for d in distances]
    valid = sum(1 for d in distances if not np.isnan(d))
    print(f"  [dist] distance_to_river: {valid:,}/{len(gdf):,} valid "
          f"(median {np.nanmedian(distances):.0f} m)")
    return gdf


# ─────────────────────────────────────────────────────────────────────────────
# 5. Historical incident counts (spatial buffer from GLC)
# ─────────────────────────────────────────────────────────────────────────────
def compute_historical_incidents(gdf):
    """
    For each road segment, count the number of historical landslide incidents
    (from NASA GLC) that fall within a 10km buffer of the segment.
    This is a STATIC feature (count over the entire catalog, not per-date).
    """
    import geopandas as gpd

    inc_path = PROCESSED_DIR / "ner_landslide_incidents.parquet"
    if not inc_path.exists():
        print("  [warn] incidents not found — historical_landslide_count = 0")
        gdf["historical_landslide_count"] = 0
        return gdf

    inc_df = pd.read_parquet(inc_path)
    inc_gdf = gpd.GeoDataFrame(
        inc_df,
        geometry=gpd.points_from_xy(inc_df["longitude"], inc_df["latitude"]),
        crs=CRS_WGS84
    )
    print(f"  [load] incidents: {len(inc_gdf):,} NER landslide events")

    # project to metric CRS
    seg_utm = gdf.to_crs(PROJECT_METRIC_CRS)
    inc_utm = inc_gdf.to_crs(PROJECT_METRIC_CRS)

    # buffer each segment centroid by 10km and count incidents within
    BUFFER_M = 10_000
    centroids_buffered = seg_utm.geometry.centroid.buffer(BUFFER_M)
    buf_gdf = gpd.GeoDataFrame(
        {"segment_id": gdf["segment_id"].values},
        geometry=centroids_buffered.values,
        crs=PROJECT_METRIC_CRS
    )

    # spatial join: count incidents in each buffer
    joined = gpd.sjoin(inc_utm, buf_gdf, how="inner", predicate="within")
    counts = joined.groupby("segment_id").size().rename("historical_landslide_count")

    gdf = gdf.merge(counts.reset_index(), on="segment_id", how="left")
    gdf["historical_landslide_count"] = gdf["historical_landslide_count"].fillna(0).astype(int)
    nonzero = (gdf["historical_landslide_count"] > 0).sum()
    print(f"  [hist] {nonzero:,} segments have ≥1 historical landslide within {BUFFER_M/1000:.0f}km")
    return gdf


# ─────────────────────────────────────────────────────────────────────────────
# 6. Rainfall (IMD daily gridded → per-segment per-date windows)
# ─────────────────────────────────────────────────────────────────────────────
def build_rainfall_features(gdf, start_yr: int, end_yr: int):
    """
    For each road segment and each date in the modeling window, extract
    daily rainfall from the IMD 0.25° grid using nearest-neighbor spatial
    matching, then roll into 1/3/7-day antecedent windows.

    Uses scipy.spatial.cKDTree for efficient nearest-grid-cell lookup —
    NOT naive lat/lon row matching.

    Returns a DataFrame with columns:
      segment_id, date, rainfall_24h, rainfall_72h, rainfall_7d, rainfall_anomaly
    """
    import xarray as xr
    from scipy.spatial import cKDTree

    nc_path = PROCESSED_DIR / "ner_rainfall_daily.nc"
    if not nc_path.exists():
        print("  [warn] ner_rainfall_daily.nc not found — rainfall features will be NaN")
        return pd.DataFrame()

    ds = xr.open_dataset(nc_path)
    rain_var = "rainfall_mm" if "rainfall_mm" in ds.data_vars else list(ds.data_vars)[0]
    print(f"  [load] IMD rainfall: var={rain_var}, dims={dict(ds.dims)}")

    # build KDTree from IMD grid coordinates for nearest-cell lookup
    lat = ds["lat"].values
    lon = ds["lon"].values
    grid_lats, grid_lons = np.meshgrid(lat, lon, indexing="ij")
    grid_points = np.column_stack([grid_lats.ravel(), grid_lons.ravel()])
    tree = cKDTree(grid_points)

    # find nearest IMD grid cell for each segment centroid
    centroids = gdf.geometry.centroid
    seg_coords = np.column_stack([centroids.y, centroids.x])  # (lat, lng)
    _, indices = tree.query(seg_coords)

    # convert flat index to (lat_idx, lon_idx)
    lat_indices = indices // len(lon)
    lon_indices = indices % len(lon)

    # extract the rainfall time series for each segment's nearest cell
    # build a date range for the modeling window
    rain_data = ds[rain_var].values  # shape: (time, lat, lon) or similar
    times = pd.to_datetime(ds["time"].values)

    # filter to modeling window
    time_mask = (times.year >= start_yr) & (times.year <= end_yr)
    times_filtered = times[time_mask]
    rain_filtered = rain_data[time_mask]

    print(f"  [rain] building rainfall features for {len(gdf):,} segments × "
          f"{len(times_filtered):,} days ({start_yr}-{end_yr}) ...")

    records = []
    for si in range(len(gdf)):
        li, loi = lat_indices[si], lon_indices[si]
        seg_id = gdf.iloc[si]["segment_id"]

        # extract daily rainfall for this cell across all dates
        daily = rain_filtered[:, li, loi].astype(float)
        daily = np.where(daily < 0, np.nan, daily)  # mask negative (IMD no-data)

        # rolling windows
        s = pd.Series(daily, index=times_filtered)
        r3 = s.rolling(3, min_periods=1).sum()
        r7 = s.rolling(7, min_periods=1).sum()

        # monthly climatology for anomaly (mean and std of 7-day rainfall by month)
        monthly_mean = r7.groupby(r7.index.month).transform("mean")
        monthly_std = r7.groupby(r7.index.month).transform("std")
        anomaly = (r7 - monthly_mean) / monthly_std.replace(0, np.nan)

        for t_idx, dt in enumerate(times_filtered):
            records.append({
                "segment_id": seg_id,
                "date": dt.date(),
                "rainfall_24h": round(float(s.iloc[t_idx]), 2) if not np.isnan(s.iloc[t_idx]) else None,
                "rainfall_72h": round(float(r3.iloc[t_idx]), 2) if not np.isnan(r3.iloc[t_idx]) else None,
                "rainfall_7d": round(float(r7.iloc[t_idx]), 2) if not np.isnan(r7.iloc[t_idx]) else None,
                "rainfall_anomaly": round(float(anomaly.iloc[t_idx]), 3) if not np.isnan(anomaly.iloc[t_idx]) else None,
            })

        if (si + 1) % 500 == 0:
            print(f"         {si+1:,}/{len(gdf):,} segments done")

    rain_df = pd.DataFrame(records)
    rain_df["date"] = pd.to_datetime(rain_df["date"])
    print(f"  [rain] {len(rain_df):,} (segment, date) rainfall records")
    return rain_df


# ─────────────────────────────────────────────────────────────────────────────
# 7. Static road features (from OSM attributes)
# ─────────────────────────────────────────────────────────────────────────────
def encode_road_features(gdf):
    """
    Encode OSM road attributes into ML-usable features.
    highway_class → ordinal (motorway=5, trunk=4, primary=3, secondary=2, tertiary=1, other=0)
    bridge → binary (yes=1, else=0)
    """
    highway_rank = {
        "motorway": 5, "motorway_link": 5,
        "trunk": 4, "trunk_link": 4,
        "primary": 3, "primary_link": 3,
        "secondary": 2, "secondary_link": 2,
        "tertiary": 1, "tertiary_link": 1,
    }
    gdf["highway_class_encoded"] = gdf["highway"].map(
        lambda h: highway_rank.get(str(h).lower().strip(), 0)
    )
    gdf["bridge"] = gdf.get("bridge", pd.Series(dtype=str)).map(
        lambda v: 1 if str(v).lower().strip() in ("yes", "true", "1") else 0
    )
    gdf["road_length_m"] = pd.to_numeric(gdf.get("length_m", 0), errors="coerce").fillna(0)
    return gdf


# ─────────────────────────────────────────────────────────────────────────────
# 8. Calendar features
# ─────────────────────────────────────────────────────────────────────────────
def add_calendar_features(df):
    """
    Add month and monsoon indicator. NER monsoon roughly June–September.
    These are DERIVED features (from the calendar, not from a sensor).
    """
    df["month"] = df["date"].dt.month
    df["monsoon_indicator"] = df["month"].isin([6, 7, 8, 9]).astype(int)
    return df


# ─────────────────────────────────────────────────────────────────────────────
# MAIN: assemble everything
# ─────────────────────────────────────────────────────────────────────────────
def main() -> int:
    ap = argparse.ArgumentParser(
        description="Build the ROAD_SEGMENT × DATE feature table by fusing all real data layers."
    )
    ap.add_argument("--start", type=int, default=2007, help="Start year (default: 2007)")
    ap.add_argument("--end", type=int, default=2016, help="End year (default: 2016)")
    ap.add_argument("--sample", type=int, default=None, help="Random sample of N segments (dev)")
    ap.add_argument("--skip-raster", action="store_true", help="Skip slow COG raster sampling")
    args = ap.parse_args()

    ensure_data_dirs()
    FEATURES_DIR.mkdir(parents=True, exist_ok=True)
    print("═" * 72)
    print("NER LOGISTICS — GEOSPATIAL DATA FUSION PIPELINE")
    print(f"  window: {args.start}–{args.end}")
    print("═" * 72)

    # ── Step 1: Load road segments ─────────────────────────────────────────
    print("\n▸ STEP 1: Load road segments (spatial spine)")
    gdf = load_road_segments(sample=args.sample)

    # ── Step 2: Sample terrain (DEM, slope, TRI) ──────────────────────────
    print("\n▸ STEP 2: Sample terrain (elevation / slope / TRI)")
    gdf = sample_terrain(gdf)

    # ── Step 3: Land cover + water ────────────────────────────────────────
    print("\n▸ STEP 3: Land cover + water occurrence (COG reads)")
    gdf = sample_landcover_and_water(gdf, skip_raster=args.skip_raster)

    # ── Step 4: Distance to river ─────────────────────────────────────────
    print("\n▸ STEP 4: Distance to nearest river (HydroRIVERS)")
    gdf = compute_distance_to_river(gdf)

    # ── Step 5: Historical incident counts ────────────────────────────────
    print("\n▸ STEP 5: Historical landslide incident counts")
    gdf = compute_historical_incidents(gdf)

    # ── Step 6: Encode road attributes ────────────────────────────────────
    print("\n▸ STEP 6: Encode OSM road attributes")
    gdf = encode_road_features(gdf)

    # Build the STATIC segment-level features (one row per segment)
    static_cols = [
        "segment_id", "state", "highway",
        "elevation", "slope", "terrain_ruggedness",
        "distance_to_river", "land_cover", "water_occurrence",
        "historical_landslide_count",
        "highway_class_encoded", "bridge", "road_length_m",
    ]
    seg_static = gdf[[c for c in static_cols if c in gdf.columns]].copy()

    # ── Step 7: Build rainfall features (segment × date) ─────────────────
    print("\n▸ STEP 7: Build rainfall features (segment × date)")
    rain_df = build_rainfall_features(gdf, args.start, args.end)

    if rain_df.empty:
        print("  [warn] No rainfall data — creating empty feature table")
        # create a minimal date range so we have SOME rows
        dates = pd.date_range(f"{args.start}-01-01", f"{args.end}-12-31", freq="D")
        rain_df = pd.DataFrame({
            "segment_id": np.repeat(seg_static["segment_id"].values, len(dates)),
            "date": np.tile(dates, len(seg_static)),
            "rainfall_24h": np.nan,
            "rainfall_72h": np.nan,
            "rainfall_7d": np.nan,
            "rainfall_anomaly": np.nan,
        })

    # ── Step 8: Join static + temporal ────────────────────────────────────
    print("\n▸ STEP 8: Join static segment features + temporal rainfall")
    feature_df = rain_df.merge(seg_static, on="segment_id", how="left")

    # ── Step 9: Calendar features ─────────────────────────────────────────
    print("\n▸ STEP 9: Calendar features (month, monsoon)")
    feature_df["date"] = pd.to_datetime(feature_df["date"])
    feature_df = add_calendar_features(feature_df)

    # ── Step 10: Data source tracking ─────────────────────────────────────
    feature_provenance = {
        "rainfall_24h": "REAL_OFFICIAL", "rainfall_72h": "REAL_OFFICIAL",
        "rainfall_7d": "REAL_OFFICIAL", "rainfall_anomaly": "DERIVED",
        "elevation": "REAL_OFFICIAL", "slope": "DERIVED", "terrain_ruggedness": "DERIVED",
        "distance_to_river": "REAL_ACADEMIC", "land_cover": "REAL_OPEN",
        "water_occurrence": "REAL_OFFICIAL",
        "historical_landslide_count": "REAL_ACADEMIC",
        "highway_class_encoded": "REAL_OPEN", "bridge": "REAL_OPEN",
        "road_length_m": "REAL_OPEN",
        "month": "DERIVED", "monsoon_indicator": "DERIVED",
    }

    # ── Step 11: Write output ─────────────────────────────────────────────
    print("\n▸ STEP 10: Write output")
    out_path = FEATURES_DIR / "road_features.parquet"
    feature_df.to_parquet(out_path, index=False, engine="pyarrow")
    print(f"  [write] {out_path.name}: {len(feature_df):,} rows × {len(feature_df.columns)} cols")

    # ── Provenance ────────────────────────────────────────────────────────
    meta = DatasetMetadata(
        dataset_id="road_features",
        title="Unified ROAD_SEGMENT × DATE feature table (fused from real data)",
        data_source_type="DERIVED",  # the fusion itself is a derivation
        source_org="Pipeline fusion of OSM + IMD + Copernicus + HydroRIVERS + ESA + JRC + NASA GLC",
        source_url="n/a (derived from multiple sources — see individual dataset provenance)",
        license="Composite: ODbL (OSM) + IMD open + Copernicus free + HydroSHEDS free + CC-BY (ESA)",
        coverage_region="NER (8 states)",
        ner_coverage=f"{seg_static['state'].nunique()} states, {len(seg_static):,} segments",
        date_range=f"{args.start}–{args.end}",
        spatial_resolution="road-segment centroids",
        file_format="Parquet",
        download_method="n/a (derived)",
        download_date=_now_iso(),
        columns=list(feature_df.columns),
        ml_use="Complete feature table for XGBoost disruption_next_24h model.",
        reliability="Feature quality depends on constituent sources (see individual provenance).",
        limitations="Centroid sampling — sub-segment terrain variation not captured. "
                    "IMD 0.25° grid coarse vs road scale. WorldCover is 2021 vintage.",
        verified=True,
        verification_notes="Built by build_fusion.py spatial join pipeline.",
    )
    meta.extra = {
        "segment_count": int(len(seg_static)),
        "date_count": int(feature_df["date"].nunique()),
        "row_count": int(len(feature_df)),
        "feature_provenance": feature_provenance,
        "outputs": {"parquet": str(out_path)},
    }
    mpath = write_metadata(meta)

    # ── Summary ───────────────────────────────────────────────────────────
    print(f"\n{'═' * 72}")
    print(f"FUSION COMPLETE")
    print(f"  segments  : {len(seg_static):,}")
    print(f"  dates     : {feature_df['date'].nunique():,} ({args.start}–{args.end})")
    print(f"  rows      : {len(feature_df):,}")
    print(f"  features  : {len(feature_df.columns)}")
    print(f"  output    : {out_path}")
    print(f"  metadata  : {mpath}")
    print(f"\n  Feature completeness:")
    for col in sorted(feature_provenance.keys()):
        if col in feature_df.columns:
            pct = feature_df[col].notna().mean() * 100
            src = feature_provenance[col]
            print(f"    {col:35s}  {pct:5.1f}%  [{src}]")
    print(f"{'═' * 72}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
