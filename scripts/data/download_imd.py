"""
download_imd.py — Acquire NER daily rainfall from IMD 0.25deg gridded (REAL_OFFICIAL)
=====================================================================================

VERIFIED SOURCE (live-checked 2026-08-29):
  India Meteorological Department (IMD, Pune) 0.25 deg x 0.25 deg daily gridded
  rainfall, 1901-2024, accessed via the `imdlib` Python package (MIT).
    imdlib : get_data('rain', start_yr, end_yr, fn_format='yearwise', file_dir=...)
             -> .get_xarray() -> xarray Dataset (lat, lon, time)
  Grid 6.5-38.5N / 66.5-100E fully encloses NER. No login, no key, no fee.
  Verified: imdlib 0.1.21 installed; get_data signature confirmed.

ERA5 FALLBACK (verified, free but needs a CDS token in ~/.cdsapirc):
  Copernicus ERA5 hourly single-levels via `cdsapi` — total_precipitation,
  2m_temperature, dewpoint (humidity), 10m wind. Enabled with --source era5.

WHAT THIS PRODUCES (nothing fabricated — values come from IMD):
  data/raw/imd/rain_<year>.grd                 raw yearly IMD binary (immutable)
  data/processed/ner_rainfall_daily.nc         NER-clipped daily rainfall (NetCDF)
  data/metadata/imd_rainfall.json              provenance record

Daily gridded rainfall is later sampled onto each ROAD_SEGMENT (nearest grid
cell) and rolled into antecedent windows (1/3/7-day) in the FUSION step.

Usage:
  python download_imd.py --start 2018 --end 2024      # IMD rainfall (recommended)
  python download_imd.py --source era5 --start 2023 --end 2024
"""
from __future__ import annotations

import argparse
import shutil
import sys
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from ner_config import NER_BBOX, NER_BBOX_NWSE, RAW_DIR, PROCESSED_DIR, ensure_data_dirs  # noqa: E402
from provenance import DatasetMetadata, write_metadata  # noqa: E402

IMD_RAW_DIR = RAW_DIR / "imd"


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _clip_ner(ds):
    """Clip an xarray dataset to the NER bounding box (handles lat ascend/descend)."""
    lat = ds["lat"]
    lat_slice = slice(NER_BBOX["min_lat"], NER_BBOX["max_lat"]) if float(lat[0]) <= float(lat[-1]) \
        else slice(NER_BBOX["max_lat"], NER_BBOX["min_lat"])
    return ds.sel(lat=lat_slice, lon=slice(NER_BBOX["min_lng"], NER_BBOX["max_lng"]))


# ─────────────────────────────────────────────────────────────────────────────
# IMD path (primary)
# ─────────────────────────────────────────────────────────────────────────────
def download_imd(start_yr: int, end_yr: int) -> Path:
    import imdlib as imd

    IMD_RAW_DIR.mkdir(parents=True, exist_ok=True)
    print(f"  [imd] get_data('rain', {start_yr}, {end_yr}) ...")
    data = imd.get_data("rain", start_yr, end_yr, fn_format="yearwise", file_dir=str(IMD_RAW_DIR))
    ds = data.get_xarray()

    # normalize the rainfall variable name -> 'rainfall_mm'
    var = list(ds.data_vars)[0]
    ds = ds.rename({var: "rainfall_mm"})
    # mask IMD no-data (large negative fill) as NaN — NEVER forward-fill
    ds["rainfall_mm"] = ds["rainfall_mm"].where(ds["rainfall_mm"] >= 0)

    ner = _clip_ner(ds)
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    out = PROCESSED_DIR / "ner_rainfall_daily.nc"
    ner.to_netcdf(out)
    print(f"  [imd] NER clip -> {out.name}  dims={dict(ner.dims)}")
    return out


def _raw_imd_files() -> list[Path]:
    return sorted(list(IMD_RAW_DIR.glob("*.grd")) + list(IMD_RAW_DIR.glob("*.GRD")))


# ─────────────────────────────────────────────────────────────────────────────
# ERA5 path (fallback; needs ~/.cdsapirc token)
# ─────────────────────────────────────────────────────────────────────────────
def download_era5(start_yr: int, end_yr: int) -> Path:
    import cdsapi

    era_dir = RAW_DIR / "era5"
    era_dir.mkdir(parents=True, exist_ok=True)
    target = era_dir / f"era5_ner_{start_yr}_{end_yr}.nc"
    if target.exists():
        print(f"  [era5] cached {target.name}")
        return target
    c = cdsapi.Client()  # reads ~/.cdsapirc (URL + key). Raises clearly if absent.
    N, W, S, E = NER_BBOX_NWSE
    print(f"  [era5] retrieve reanalysis-era5-single-levels area={[N,W,S,E]} ...")
    c.retrieve(
        "reanalysis-era5-single-levels",
        {
            "product_type": "reanalysis",
            "variable": ["total_precipitation", "2m_temperature",
                         "2m_dewpoint_temperature", "10m_u_component_of_wind",
                         "10m_v_component_of_wind"],
            "year": [str(y) for y in range(start_yr, end_yr + 1)],
            "month": [f"{m:02d}" for m in range(1, 13)],
            "day": [f"{d:02d}" for d in range(1, 32)],
            "time": [f"{h:02d}:00" for h in range(0, 24, 3)],
            "area": [N, W, S, E],
            "format": "netcdf",
        },
        str(target),
    )
    print(f"  [era5] -> {target.name}")
    return target


# ─────────────────────────────────────────────────────────────────────────────
def main() -> int:
    ap = argparse.ArgumentParser(description="Download NER daily rainfall (IMD gridded, or ERA5).")
    ap.add_argument("--source", choices=["imd", "era5"], default="imd")
    ap.add_argument("--start", type=int, default=2018)
    ap.add_argument("--end", type=int, default=2024)
    args = ap.parse_args()
    ensure_data_dirs()

    print(f"NER rainfall acquisition (source={args.source}, {args.start}-{args.end})")

    if args.source == "imd":
        out = download_imd(args.start, args.end)
        meta = DatasetMetadata(
            dataset_id="imd_rainfall",
            title="IMD 0.25deg daily gridded rainfall (NER clip)",
            data_source_type="REAL_OFFICIAL",
            source_org="India Meteorological Department (IMD), Pune",
            source_url="https://imdpune.gov.in/cmpg/Griddata/Rainfall_25_NetCDF.html "
                       "(via imdlib, https://pypi.org/project/imdlib/)",
            license="IMD open gridded data (cite Pai et al. 2014, MAUSAM)",
            coverage_region="NER (8 states)",
            ner_coverage="full (grid 6.5-38.5N/66.5-100E encloses NER)",
            date_range=f"{args.start}-{args.end} (product available 1901-2024)",
            spatial_resolution="0.25 deg (~25 km)",
            file_format="IMD binary .grd (raw) -> NetCDF (processed)",
            download_method="python package imdlib (no login)",
            download_date=_now_iso(),
            columns=["rainfall_mm", "lat", "lon", "time"],
            ml_use="Daily rainfall -> per-segment antecedent 1/3/7-day rainfall windows; "
                   "primary hydro-meteorological disruption trigger.",
            reliability="High (official national gauge-interpolated product).",
            limitations="Gauge-interpolated -> sparse-station bias in high-relief "
                        "Arunachal/interior hills; 0.25 deg coarse vs road scale.",
            verified=True,
            verification_notes="imdlib 0.1.21 API confirmed; live download test run separately.",
        )
        for f in _raw_imd_files():
            meta.add_raw_file(f)
        meta.extra = {"processed_netcdf": str(out)}
    else:
        out = download_era5(args.start, args.end)
        meta = DatasetMetadata(
            dataset_id="era5_weather",
            title="ERA5 hourly single-levels (NER) — precip/temp/humidity/wind",
            data_source_type="REAL_OFFICIAL",
            source_org="ECMWF / Copernicus C3S",
            source_url="https://cds.climate.copernicus.eu/datasets/reanalysis-era5-single-levels",
            license="Copernicus C3S licence (CC-BY, one-time acceptance)",
            coverage_region="NER (8 states)",
            ner_coverage="full (global, bbox-subset)",
            date_range=f"{args.start}-{args.end} (product 1940-present)",
            spatial_resolution="0.25 deg, 3-hourly (subset here)",
            file_format="NetCDF",
            download_method="python package cdsapi (free CDS token required)",
            download_date=_now_iso(),
            columns=["tp", "t2m", "d2m", "u10", "v10"],
            ml_use="Multivariable weather (rain+temp+humidity+wind) per segment/day.",
            reliability="High (physically consistent reanalysis).",
            limitations="Reanalysis (not gauge truth); coarse for convective extremes; "
                        "requires a free CDS account token in ~/.cdsapirc.",
            verified=True,
            verification_notes="cdsapi 0.7.7 importable; endpoint verified reachable by discovery agent.",
        )
        meta.add_raw_file(out)

    mpath = write_metadata(meta)
    print(f"  -> {mpath}\n  done.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
