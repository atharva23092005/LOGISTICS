"""
download_hydro.py — NER rivers, water & land cover (REAL_* env layers)
======================================================================

VERIFIED SOURCES (live-probed 2026-08-29, all anonymous):
  * HydroRIVERS Asia (WWF/McGill HydroSHEDS) — river network vector:
      https://data.hydrosheds.org/file/HydroRIVERS/HydroRIVERS_v10_as_shp.zip (200, 90.5 MB)
    -> fully materialized: download, clip to NER, write processed/ner_rivers.gpkg.
  * ESA WorldCover 10 m 2021 v200 — land cover COGs (12 NER tiles, all 206):
      s3 https://esa-worldcover.s3.eu-central-1.amazonaws.com/v200/2021/map/ESA_WorldCover_10m_2021_v200_N{ll}E{lll}_Map.tif
  * JRC Global Surface Water occurrence 30 m — water permanence COGs (80E_30N, 90E_30N, both 206):
      https://storage.googleapis.com/global-surface-water/downloads2021/occurrence/occurrence_{lon}_{lat}v1_4_2021.tif

  10 m WorldCover over the whole NER box is huge, so we DON'T bulk-download it.
  We persist a verified tile MANIFEST and expose windowed-read samplers
  (`sample_landcover`, `sample_water_occurrence`) that the FUSION step calls to
  read only the pixels under each road segment — the same anonymous-COG pattern
  proven for the DEM. Nothing is fabricated; every value is read from the COG.

Produces:
  data/raw/hydro/HydroRIVERS_v10_as_shp.zip     raw rivers download (immutable)
  data/processed/ner_rivers.gpkg                 NER-clipped river lines
  data/metadata/hydrorivers.json                 provenance
  data/metadata/esa_worldcover.json              provenance (+ tile manifest)
  data/metadata/jrc_surface_water.json           provenance (+ tile manifest)

Usage:
  python download_hydro.py                # rivers (full) + landcover/water manifests
  python download_hydro.py --no-rivers    # only (re)write the raster manifests
"""
from __future__ import annotations

import argparse
import sys
import zipfile
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from ner_config import NER_BBOX, RAW_DIR, PROCESSED_DIR, CRS_WGS84, ensure_data_dirs  # noqa: E402
from provenance import DatasetMetadata, write_metadata, guard_raw_path  # noqa: E402

HYDRO_RAW_DIR = RAW_DIR / "hydro"
HYDRORIVERS_URL = "https://data.hydrosheds.org/file/HydroRIVERS/HydroRIVERS_v10_as_shp.zip"
WORLDCOVER_BASE = "https://esa-worldcover.s3.eu-central-1.amazonaws.com/v200/2021/map"
JRC_GSW_BASE = "https://storage.googleapis.com/global-surface-water/downloads2021/occurrence"
_UA = {"User-Agent": "ner-logistics-data-pipeline/1.0 (SIH2025 research)"}


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


# ── tile grids (verified 2026-08-29) ─────────────────────────────────────────
def worldcover_tiles() -> list[str]:
    """3deg-grid SW-corner tiles covering the NER bbox (all verified 206)."""
    tiles = []
    for lat in range(21, 30, 3):      # 21,24,27
        for lng in range(87, 98, 3):  # 87,90,93,96
            tiles.append(f"N{lat:02d}E{lng:03d}")
    return tiles


def worldcover_url(tile: str) -> str:
    return f"{WORLDCOVER_BASE}/ESA_WorldCover_10m_2021_v200_{tile}_Map.tif"


def jrc_tiles() -> list[str]:
    """10deg tiles (top-left corner) covering NER 20-30N / 80-100E."""
    return ["80E_30N", "90E_30N"]


def jrc_url(tile: str) -> str:
    return f"{JRC_GSW_BASE}/occurrence_{tile}v1_4_2021.tif"


# ── HydroRIVERS: full acquire + NER clip ─────────────────────────────────────
def acquire_hydrorivers() -> tuple[Path, Path, int]:
    import requests
    import geopandas as gpd

    HYDRO_RAW_DIR.mkdir(parents=True, exist_ok=True)
    zip_path = HYDRO_RAW_DIR / "HydroRIVERS_v10_as_shp.zip"
    if not zip_path.exists():
        print(f"  [fetch] HydroRIVERS Asia (~90 MB) ...")
        with requests.get(HYDRORIVERS_URL, headers=_UA, stream=True, timeout=300) as r:
            r.raise_for_status()
            guard_raw_path("hydro/HydroRIVERS_v10_as_shp.zip")  # assert non-clobber
            with open(zip_path, "wb") as f:
                for chunk in r.iter_content(chunk_size=1 << 20):
                    f.write(chunk)
        print(f"          wrote {zip_path.stat().st_size/1e6:.1f} MB")
    else:
        print(f"  [cache] {zip_path.name}")

    # read the shapefile straight from the zip, clip to NER bbox
    with zipfile.ZipFile(zip_path) as z:
        shp = [n for n in z.namelist() if n.lower().endswith(".shp")][0]
    print(f"  [read ] {shp} (clipping to NER bbox) ...")
    gdf = gpd.read_file(f"zip://{zip_path}!{shp}", bbox=tuple(
        (NER_BBOX["min_lng"], NER_BBOX["min_lat"], NER_BBOX["max_lng"], NER_BBOX["max_lat"])
    ))
    if gdf.crs is None:
        gdf.set_crs(CRS_WGS84, inplace=True)
    gdf["data_source_type"] = "REAL_ACADEMIC"
    gdf["source"] = "HydroRIVERS v10 (HydroSHEDS)"

    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    out = PROCESSED_DIR / "ner_rivers.gpkg"
    gdf.to_file(out, driver="GPKG", layer="rivers")
    print(f"  [clip ] {len(gdf):,} river reaches in NER -> {out.name}")
    return zip_path, out, len(gdf)


# ── windowed-read samplers (used by the FUSION step) ─────────────────────────
def sample_landcover(points_lnglat):
    """Sample ESA WorldCover class code at [(lng,lat), ...] via windowed COG reads."""
    import rasterio
    # Build a lightweight per-tile lookup: open each needed tile lazily.
    srcs = {t: rasterio.open(worldcover_url(t)) for t in worldcover_tiles()}
    out = []
    for lng, lat in points_lnglat:
        val = None
        for s in srcs.values():
            b = s.bounds
            if b.left <= lng <= b.right and b.bottom <= lat <= b.top:
                val = int(list(s.sample([(lng, lat)]))[0][0]); break
        out.append(val)
    for s in srcs.values():
        s.close()
    return out


def sample_water_occurrence(points_lnglat):
    """Sample JRC GSW occurrence (0-100 %, 255 nodata) at points via windowed reads."""
    import rasterio
    srcs = {t: rasterio.open(jrc_url(t)) for t in jrc_tiles()}
    out = []
    for lng, lat in points_lnglat:
        val = None
        for s in srcs.values():
            b = s.bounds
            if b.left <= lng <= b.right and b.bottom <= lat <= b.top:
                v = int(list(s.sample([(lng, lat)]))[0][0])
                val = None if v == 255 else v
                break
        out.append(val)
    for s in srcs.values():
        s.close()
    return out


def main() -> int:
    ap = argparse.ArgumentParser(description="Acquire NER rivers (full) + landcover/water manifests.")
    ap.add_argument("--no-rivers", action="store_true")
    args = ap.parse_args()
    ensure_data_dirs()
    print("NER hydrology & land cover acquisition")

    if not args.no_rivers:
        zip_path, rivers_out, n = acquire_hydrorivers()
        m = DatasetMetadata(
            dataset_id="hydrorivers", title="HydroRIVERS v10 Asia (NER clip)",
            data_source_type="REAL_ACADEMIC", source_org="WWF / McGill (HydroSHEDS)",
            source_url=HYDRORIVERS_URL, license="HydroSHEDS free (sci/edu/commercial)",
            coverage_region="NER (8 states)", ner_coverage="full",
            date_range="HydroSHEDS v1.0 (static)", spatial_resolution="vector (from 15 arc-sec)",
            file_format="Shapefile (raw zip) -> GeoPackage (processed)",
            download_method="direct (anonymous zip)", download_date=_now_iso(),
            ml_use="distance_to_river per road segment; river-crossing/flood context.",
            reliability="Very high (clean vector, one file).",
            limitations="Generalized; small streams thinned. Pair with OSM waterways for detail.",
            verified=True, verification_notes="HEAD 200, application/zip, 90.5 MB.",
        )
        m.add_raw_file(zip_path)
        m.extra = {"river_reaches_ner": n, "processed_gpkg": str(rivers_out)}
        print("  ->", write_metadata(m))

    # WorldCover manifest (windowed at fusion; not bulk-downloaded)
    wc = DatasetMetadata(
        dataset_id="esa_worldcover", title="ESA WorldCover 10 m 2021 v200 (NER tiles)",
        data_source_type="REAL_OPEN", source_org="ESA / VITO",
        source_url=WORLDCOVER_BASE, license="CC-BY 4.0",
        coverage_region="NER (8 states)", ner_coverage="full (12 tiles)",
        date_range="2021", spatial_resolution="10 m",
        file_format="Cloud-Optimized GeoTIFF (windowed reads)",
        download_method="direct anonymous COG (sampled at fusion, not bulk-downloaded)",
        download_date=_now_iso(),
        ml_use="Land-cover class per segment (built-up/forest/cropland/water/wetland) "
               "-> exposure & routing cost context.",
        reliability="Very high (anonymous COG).",
        limitations="2021 vintage; 10 m not parcel-level. 12 tiles too large to bulk-store; "
                    "sampled on demand via sample_landcover().",
        verified=True, verification_notes="All 12 NER tiles HTTP 206 on 2026-08-29.",
    )
    wc.extra = {"tile_urls": [worldcover_url(t) for t in worldcover_tiles()]}
    print("  ->", write_metadata(wc))

    # JRC GSW manifest
    gsw = DatasetMetadata(
        dataset_id="jrc_surface_water", title="JRC Global Surface Water occurrence 30 m (NER tiles)",
        data_source_type="REAL_OFFICIAL", source_org="EC Joint Research Centre / Copernicus",
        source_url=JRC_GSW_BASE, license="Free (cite Pekel et al. 2016)",
        coverage_region="NER (8 states)", ner_coverage="full (2 tiles: 80E_30N, 90E_30N)",
        date_range="1984-2021 history (2021 product)", spatial_resolution="30 m",
        file_format="GeoTIFF (windowed reads)",
        download_method="direct anonymous tiles (sampled at fusion)",
        download_date=_now_iso(),
        ml_use="Surface-water occurrence % per segment -> flood-exposure / low-lying signal.",
        reliability="High.", limitations="Water history, not a land-cover map; 30 m.",
        verified=True, verification_notes="Tiles 80E_30N & 90E_30N HTTP 206 on 2026-08-29.",
    )
    gsw.extra = {"tile_urls": [jrc_url(t) for t in jrc_tiles()]}
    print("  ->", write_metadata(gsw))
    print("  done.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
