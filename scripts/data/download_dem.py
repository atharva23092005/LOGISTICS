"""
download_dem.py — Acquire NER terrain from Copernicus GLO-30 DEM (REAL_OFFICIAL)
================================================================================

VERIFIED SOURCE (live-checked 2026-08-29):
  Copernicus GLO-30 DEM on AWS Open Data, anonymous, Cloud-Optimized GeoTIFF.
    Bucket : s3://copernicus-dem-30m   (eu-central-1)
    HTTPS  : https://copernicus-dem-30m.s3.amazonaws.com/
    Tile   : Copernicus_DSM_COG_10_{Nyy}_00_{Exxx}_00_DEM/<same>.tif   (1deg x 1deg)
  Verified NER tiles served: N26_E091 (Assam) HTTP 200, N28_E088 (Sikkim) 206.
  No account, no API key — rasterio/rioxarray open the COG URL directly and read
  windows. (OpenTopography /API/globaldem is the free-key fallback; not needed.)

WHAT THIS PRODUCES (nothing fabricated — pixels come from Copernicus):
  data/raw/dem/<tile>.tif                  cached 1deg COG tiles covering NER
  data/processed/ner_dem_30m.tif           merged, NER-clipped elevation raster
  data/processed/ner_slope_deg.tif         DERIVED slope (degrees)
  data/processed/ner_tri.tif               DERIVED terrain ruggedness index
  data/metadata/copernicus_glo30_dem.json  provenance record

Slope & TRI are tagged DERIVED (computed FROM the real DEM) in provenance.
Per-road-segment sampling of these rasters happens in the FUSION step (Prompt 3).

Usage:
  python download_dem.py                 # fetch NER tiles, build DEM+slope+TRI
  python download_dem.py --no-derive     # only fetch/mosaic the raw DEM
  python download_dem.py --bbox 25 27 91 93   # south north west east (subset)
"""
from __future__ import annotations

import argparse
import sys
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from ner_config import NER_BBOX, RAW_DIR, PROCESSED_DIR, CRS_WGS84, ensure_data_dirs  # noqa: E402
from provenance import DatasetMetadata, write_metadata  # noqa: E402

DEM_RAW_DIR = RAW_DIR / "dem"
GLO30_BASE = "https://copernicus-dem-30m.s3.amazonaws.com"


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def tile_name(lat: int, lng: int) -> str:
    """Copernicus GLO-30 tile id for the 1deg cell whose SW corner is (lat,lng)."""
    ns = f"N{lat:02d}" if lat >= 0 else f"S{abs(lat):02d}"
    ew = f"E{lng:03d}" if lng >= 0 else f"W{abs(lng):03d}"
    stem = f"Copernicus_DSM_COG_10_{ns}_00_{ew}_00_DEM"
    return stem


def tile_url(lat: int, lng: int) -> str:
    stem = tile_name(lat, lng)
    return f"{GLO30_BASE}/{stem}/{stem}.tif"


def tiles_for_bbox(south, north, west, east):
    """1deg tiles (by SW corner) covering the bbox."""
    import math
    tiles = []
    for lat in range(int(math.floor(south)), int(math.floor(north)) + 1):
        for lng in range(int(math.floor(west)), int(math.floor(east)) + 1):
            tiles.append((lat, lng))
    return tiles


def fetch_tile(lat: int, lng: int) -> Path | None:
    """Download one GLO-30 COG tile to data/raw/dem/ (cached; skip if present)."""
    import requests

    DEM_RAW_DIR.mkdir(parents=True, exist_ok=True)
    stem = tile_name(lat, lng)
    dst = DEM_RAW_DIR / f"{stem}.tif"
    if dst.exists():
        print(f"  [cache] {stem}.tif")
        return dst
    url = tile_url(lat, lng)
    try:
        with requests.get(url, stream=True, timeout=120) as r:
            if r.status_code == 404:
                # some ocean/absent tiles legitimately don't exist
                print(f"  [none ] {stem} (404 — no tile, e.g. all-ocean)")
                return None
            r.raise_for_status()
            with open(dst, "wb") as f:
                for chunk in r.iter_content(chunk_size=1 << 20):
                    f.write(chunk)
        print(f"  [fetch] {stem}.tif ({dst.stat().st_size/1e6:.1f} MB)")
        return dst
    except Exception as e:
        print(f"  [warn ] {stem}: {type(e).__name__}: {e}")
        return None


def mosaic_clip(tile_paths, south, north, west, east) -> Path:
    """Merge tiles and clip to the NER bbox -> data/processed/ner_dem_30m.tif."""
    import rasterio
    from rasterio.merge import merge
    from rasterio.windows import from_bounds

    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    srcs = [rasterio.open(p) for p in tile_paths]
    mosaic, transform = merge(srcs, bounds=(west, south, east, north))
    meta = srcs[0].meta.copy()
    meta.update(height=mosaic.shape[1], width=mosaic.shape[2], transform=transform, crs=CRS_WGS84)
    out = PROCESSED_DIR / "ner_dem_30m.tif"
    with rasterio.open(out, "w", **meta) as dst:
        dst.write(mosaic)
    for s in srcs:
        s.close()
    print(f"  [merge] -> {out.name}  shape={mosaic.shape[1]}x{mosaic.shape[2]}")
    return out


def derive_slope_and_tri(dem_path: Path):
    """
    Compute slope (degrees) and Terrain Ruggedness Index from the real DEM.
    Uses numpy gradients on the projected pixel spacing. Tagged DERIVED.
    """
    import numpy as np
    import rasterio
    from pyproj import Geod

    with rasterio.open(dem_path) as ds:
        z = ds.read(1).astype("float64")
        nodata = ds.nodata
        if nodata is not None:
            z[z == nodata] = np.nan
        transform = ds.transform
        profile = ds.profile.copy()

    # approximate pixel size in meters at NER latitude (~26N) from degree spacing
    geod = Geod(ellps="WGS84")
    lat_mid = (NER_BBOX["min_lat"] + NER_BBOX["max_lat"]) / 2.0
    dx_deg = abs(transform.a)
    dy_deg = abs(transform.e)
    _, _, dx_m = geod.inv(0, lat_mid, dx_deg, lat_mid)      # E-W meters per pixel
    _, _, dy_m = geod.inv(0, lat_mid, 0, lat_mid + dy_deg)  # N-S meters per pixel

    dzdy, dzdx = np.gradient(z, dy_m, dx_m)
    slope_rad = np.arctan(np.sqrt(dzdx**2 + dzdy**2))
    slope_deg = np.degrees(slope_rad)

    # TRI (Riley): sqrt(mean of squared elevation diffs vs 8 neighbors)
    def _shift(a, dr, dc):
        out = np.full_like(a, np.nan)
        rs = slice(max(dr, 0), a.shape[0] + min(dr, 0))
        cs = slice(max(dc, 0), a.shape[1] + min(dc, 0))
        rs2 = slice(max(-dr, 0), a.shape[0] + min(-dr, 0))
        cs2 = slice(max(-dc, 0), a.shape[1] + min(-dc, 0))
        out[rs, cs] = a[rs2, cs2]
        return out

    sq = np.zeros_like(z)
    cnt = np.zeros_like(z)
    for dr in (-1, 0, 1):
        for dc in (-1, 0, 1):
            if dr == 0 and dc == 0:
                continue
            nb = _shift(z, dr, dc)
            d = (z - nb) ** 2
            m = ~np.isnan(d)
            sq[m] += d[m]
            cnt[m] += 1
    tri = np.sqrt(np.divide(sq, np.maximum(cnt, 1)))

    prof = profile.copy()
    prof.update(dtype="float32", count=1, nodata=np.float32(np.nan))
    slope_out = PROCESSED_DIR / "ner_slope_deg.tif"
    tri_out = PROCESSED_DIR / "ner_tri.tif"
    with rasterio.open(slope_out, "w", **prof) as dst:
        dst.write(slope_deg.astype("float32"), 1)
    with rasterio.open(tri_out, "w", **prof) as dst:
        dst.write(tri.astype("float32"), 1)
    print(f"  [derive] slope -> {slope_out.name}  (max {np.nanmax(slope_deg):.1f} deg)")
    print(f"  [derive] TRI   -> {tri_out.name}")
    return slope_out, tri_out


def main() -> int:
    ap = argparse.ArgumentParser(description="Download Copernicus GLO-30 DEM for NER + derive slope/TRI.")
    ap.add_argument("--bbox", nargs=4, type=float, metavar=("S", "N", "W", "E"),
                    default=[NER_BBOX["min_lat"], NER_BBOX["max_lat"], NER_BBOX["min_lng"], NER_BBOX["max_lng"]])
    ap.add_argument("--no-derive", action="store_true", help="Only fetch + mosaic raw DEM.")
    args = ap.parse_args()
    south, north, west, east = args.bbox

    ensure_data_dirs()
    print("NER terrain acquisition (Copernicus GLO-30 / REAL_OFFICIAL)")
    tiles = tiles_for_bbox(south, north, west, east)
    print(f"  {len(tiles)} candidate 1deg tiles for bbox S{south} N{north} W{west} E{east}")

    paths = []
    for lat, lng in tiles:
        p = fetch_tile(lat, lng)
        if p:
            paths.append(p)
    if not paths:
        print("  ERROR: no DEM tiles fetched.")
        return 1

    dem = mosaic_clip(paths, south, north, west, east)

    meta = DatasetMetadata(
        dataset_id="copernicus_glo30_dem",
        title="Copernicus GLO-30 DEM (NER clip) + derived slope/TRI",
        data_source_type="REAL_OFFICIAL",
        source_org="ESA / Copernicus (AWS Open Data)",
        source_url=f"{GLO30_BASE}/",
        license="Copernicus/ESA free-use (attribution)",
        coverage_region="NER (8 states)",
        ner_coverage="full",
        date_range="Copernicus DSM (2011-2015 acquisition era)",
        spatial_resolution="30 m (1 arc-sec)",
        file_format="Cloud-Optimized GeoTIFF",
        download_method="direct (anonymous COG over HTTPS)",
        download_date=_now_iso(),
        ml_use="Elevation, and DERIVED slope_deg + terrain ruggedness (TRI) per road "
               "segment — primary geomorphic predictors for landslide disruption.",
        reliability="Very high (official Copernicus bucket; verified NER tiles serve).",
        limitations="DSM (surface incl. canopy/buildings), not bare-earth. Slope/TRI "
                    "computed on ~30 m grid; sub-pixel road cuts not resolved.",
        verified=True,
        verification_notes="Live 2026-08-29: N26_E091 HTTP 200, N28_E088 206.",
    )
    for p in paths:
        meta.add_raw_file(p)

    outputs = {"dem": str(dem)}
    if not args.no_derive:
        slope_out, tri_out = derive_slope_and_tri(dem)
        outputs["slope_deg"] = str(slope_out)
        outputs["tri"] = str(tri_out)
        meta.extra["derived_note"] = "slope_deg and TRI are DERIVED from the real DEM."

    meta.extra["outputs"] = outputs
    meta.extra["tiles_fetched"] = [Path(p).stem for p in paths]
    mpath = write_metadata(meta)
    print(f"  -> {mpath}\n  done.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
