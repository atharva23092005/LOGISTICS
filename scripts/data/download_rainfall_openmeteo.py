"""
download_rainfall_openmeteo.py — Fallback: NER daily rainfall from Open-Meteo (ERA5-based)
===========================================================================================

FALLBACK for when imdpune.gov.in is unreachable (geofenced from this environment).

Open-Meteo Historical Weather API serves ERA5 reanalysis data:
  https://archive-api.open-meteo.com/v1/archive
  - Free, no auth, no API key
  - ERA5 reanalysis (ECMWF Copernicus) → REAL_OFFICIAL provenance
  - Global coverage, 0.25° grid, hourly/daily resolution
  - 1940–present
  - License: CC-BY 4.0

WHAT THIS PRODUCES (nothing fabricated — all values are ERA5 reanalysis):
  data/raw/rainfall/openmeteo_ner_grid.json     raw API responses (immutable)
  data/processed/ner_rainfall_daily.nc           NER-clipped daily rainfall (NetCDF)
  data/metadata/openmeteo_rainfall.json          provenance record

The output NetCDF has the SAME structure as the IMD version so the fusion
pipeline doesn't need to change — just swap the source.

Usage:
  python download_rainfall_openmeteo.py --start 2007 --end 2016
  python download_rainfall_openmeteo.py --start 2007 --end 2016 --resolution 0.5  # coarser for speed
"""
from __future__ import annotations

import argparse
import json
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
import requests

sys.path.insert(0, str(Path(__file__).resolve().parent))
from ner_config import NER_BBOX, RAW_DIR, PROCESSED_DIR, ensure_data_dirs  # noqa: E402
from provenance import DatasetMetadata, write_metadata  # noqa: E402

OPENMETEO_URL = "https://archive-api.open-meteo.com/v1/archive"
RAIN_RAW_DIR = RAW_DIR / "rainfall"


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def build_grid(resolution: float = 0.25):
    """Build a lat/lon grid covering NER at the given resolution."""
    lats = np.arange(NER_BBOX["min_lat"], NER_BBOX["max_lat"] + resolution / 2, resolution)
    lons = np.arange(NER_BBOX["min_lng"], NER_BBOX["max_lng"] + resolution / 2, resolution)
    return lats, lons


def fetch_grid_rainfall(lats, lons, start_yr: int, end_yr: int):
    """
    Download daily precipitation for each grid point from Open-Meteo.
    Batches multiple coordinates per request to minimize API calls.
    Open-Meteo allows up to ~50 locations per request.
    """
    RAIN_RAW_DIR.mkdir(parents=True, exist_ok=True)

    start_date = f"{start_yr}-01-01"
    end_date = f"{end_yr}-12-31"

    # build list of all grid points
    points = [(float(lat), float(lon)) for lat in lats for lon in lons]
    total_points = len(points)
    print(f"  [grid] {len(lats)} lat × {len(lons)} lon = {total_points} grid points")

    # Open-Meteo batch limit: process points individually but with rate limiting
    # (their batch endpoint accepts comma-separated coords)
    BATCH_SIZE = 20  # safe batch size to avoid rate limits
    all_results = {}  # (lat, lon) -> {date: rainfall_mm}

    for batch_start in range(0, total_points, BATCH_SIZE):
        batch = points[batch_start:batch_start + BATCH_SIZE]
        batch_lats = ",".join(f"{p[0]:.2f}" for p in batch)
        batch_lons = ",".join(f"{p[1]:.2f}" for p in batch)

        params = {
            "latitude": batch_lats,
            "longitude": batch_lons,
            "start_date": start_date,
            "end_date": end_date,
            "daily": "precipitation_sum",
            "timezone": "UTC",
        }

        for attempt in range(3):
            try:
                resp = requests.get(OPENMETEO_URL, params=params, timeout=120)
                if resp.status_code == 429:
                    # rate limited — wait and retry
                    wait = 10 * (attempt + 1)
                    print(f"  [wait] rate limited, sleeping {wait}s ...")
                    time.sleep(wait)
                    continue
                resp.raise_for_status()
                break
            except requests.exceptions.RequestException as e:
                if attempt < 2:
                    print(f"  [retry] attempt {attempt+1} failed: {type(e).__name__}")
                    time.sleep(5 * (attempt + 1))
                else:
                    raise

        data = resp.json()

        # Open-Meteo returns a list when multiple coords, or dict for single
        if isinstance(data, list):
            responses = data
        else:
            responses = [data]

        for i, entry in enumerate(responses):
            pt = batch[i]
            daily = entry.get("daily", {})
            dates = daily.get("time", [])
            precip = daily.get("precipitation_sum", [])
            result = {}
            for d, p in zip(dates, precip):
                result[d] = p if p is not None else np.nan
            all_results[pt] = result

        done = min(batch_start + BATCH_SIZE, total_points)
        print(f"  [fetch] {done}/{total_points} grid points ({done*100//total_points}%)")

        # polite rate limiting
        if done < total_points:
            time.sleep(1.0)

    # cache raw data
    cache_file = RAIN_RAW_DIR / "openmeteo_ner_grid.json"
    cache_data = {
        f"{lat:.2f},{lon:.2f}": data
        for (lat, lon), data in all_results.items()
    }
    cache_file.write_text(json.dumps({
        "source": "Open-Meteo Historical Weather API (ERA5)",
        "url": OPENMETEO_URL,
        "start_date": start_date,
        "end_date": end_date,
        "grid_resolution": float(lats[1] - lats[0]) if len(lats) > 1 else 0.25,
        "point_count": total_points,
        "download_date": _now_iso(),
        "data": cache_data,
    }, indent=2), encoding="utf-8")
    print(f"  [cache] {cache_file.name} ({cache_file.stat().st_size/1e6:.1f} MB)")

    return all_results


def build_netcdf(all_results, lats, lons, start_yr: int, end_yr: int) -> Path:
    """
    Assemble the grid rainfall data into a NetCDF file matching the
    IMD format expected by the fusion pipeline.
    """
    import xarray as xr
    import pandas as pd

    # Build time axis
    dates = pd.date_range(f"{start_yr}-01-01", f"{end_yr}-12-31", freq="D")

    # Build 3D array: (time, lat, lon)
    rain = np.full((len(dates), len(lats), len(lons)), np.nan, dtype=np.float32)

    for li, lat in enumerate(lats):
        for loi, lon in enumerate(lons):
            pt_data = all_results.get((float(lat), float(lon)), {})
            for ti, dt in enumerate(dates):
                ds = dt.strftime("%Y-%m-%d")
                val = pt_data.get(ds)
                if val is not None and not (isinstance(val, float) and np.isnan(val)):
                    rain[ti, li, loi] = float(val)

    ds = xr.Dataset(
        {"rainfall_mm": (["time", "lat", "lon"], rain)},
        coords={
            "time": dates.values,
            "lat": lats,
            "lon": lons,
        },
    )
    ds["rainfall_mm"].attrs["units"] = "mm"
    ds["rainfall_mm"].attrs["long_name"] = "Daily precipitation sum"
    ds["rainfall_mm"].attrs["source"] = "Open-Meteo (ERA5 reanalysis)"
    ds.attrs["source"] = "Open-Meteo Historical Weather API (ERA5 reanalysis, ECMWF Copernicus)"
    ds.attrs["data_source_type"] = "REAL_OFFICIAL"
    ds.attrs["created"] = _now_iso()

    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    out = PROCESSED_DIR / "ner_rainfall_daily.nc"
    ds.to_netcdf(out)

    valid_pct = np.count_nonzero(~np.isnan(rain)) / rain.size * 100
    max_rain = np.nanmax(rain) if valid_pct > 0 else 0
    print(f"  [nc] {out.name}: shape=({len(dates)}, {len(lats)}, {len(lons)})")
    print(f"       valid={valid_pct:.1f}%, max_rain={max_rain:.1f} mm")
    return out


def main() -> int:
    ap = argparse.ArgumentParser(
        description="Download NER daily rainfall from Open-Meteo (ERA5 fallback for IMD)."
    )
    ap.add_argument("--start", type=int, default=2007)
    ap.add_argument("--end", type=int, default=2016)
    ap.add_argument("--resolution", type=float, default=0.5,
                    help="Grid resolution in degrees (default 0.5; IMD uses 0.25)")
    args = ap.parse_args()

    ensure_data_dirs()
    print(f"NER rainfall acquisition (Open-Meteo ERA5 fallback, {args.start}-{args.end})")
    print(f"  resolution: {args.resolution}°")

    lats, lons = build_grid(resolution=args.resolution)
    all_results = fetch_grid_rainfall(lats, lons, args.start, args.end)
    out = build_netcdf(all_results, lats, lons, args.start, args.end)

    meta = DatasetMetadata(
        dataset_id="openmeteo_rainfall",
        title="Open-Meteo Historical Weather (ERA5 reanalysis) — NER daily rainfall",
        data_source_type="REAL_OFFICIAL",
        source_org="Open-Meteo (ERA5 data from ECMWF / Copernicus C3S)",
        source_url=OPENMETEO_URL,
        license="CC-BY 4.0 (Open-Meteo); Copernicus C3S licence (ERA5 data)",
        coverage_region="NER (8 states)",
        ner_coverage="full (grid covers NER bbox)",
        date_range=f"{args.start}–{args.end} (ERA5 available 1940–present)",
        spatial_resolution=f"{args.resolution}° (~{args.resolution*111:.0f} km)",
        file_format="JSON (raw) → NetCDF (processed)",
        download_method="REST API (no auth)",
        download_date=_now_iso(),
        columns=["rainfall_mm", "lat", "lon", "time"],
        ml_use="Daily rainfall → per-segment antecedent 1/3/7-day rainfall windows; "
               "primary hydro-meteorological disruption trigger.",
        reliability="High (ERA5 is ECMWF's flagship reanalysis; physically consistent). "
                    "Used as fallback because imdpune.gov.in is unreachable from this environment.",
        limitations="ERA5 reanalysis (not gauge truth); coarser than IMD's 0.25° gauge-interpolated "
                    "product for convective extremes; model-based → may underestimate extreme events.",
        verified=True,
        verification_notes="Open-Meteo API verified reachable; ERA5 data confirmed via response.",
    )
    meta.extra = {
        "fallback_reason": "imdpune.gov.in unreachable (ConnectTimeout / geofencing)",
        "primary_source": "IMD 0.25° daily gridded rainfall (imdlib)",
        "processed_netcdf": str(out),
        "grid_resolution_deg": args.resolution,
        "grid_points": int(len(lats) * len(lons)),
    }
    mpath = write_metadata(meta)
    print(f"  → {mpath}\n  done.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
