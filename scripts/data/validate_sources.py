"""
validate_sources.py — Live reachability + provenance audit of the data sources
===============================================================================

This is the ANTI-FABRICATION gate. It does NOT trust any claim in code or docs;
it actually pings each source and reports the real HTTP status / tool result.
Run it before an acquisition campaign, and any time you want to re-prove that
what we say is reachable is actually reachable *today*.

Each registry entry records what a discovery agent VERIFIED on 2026-08-29, plus
a live `check()` that re-confirms reachability now. Sources that require an
account/manual download are marked accessible=False with an honest reason — they
are reported, never silently swapped for fabricated data.

Registry is grouped by dataset category:
  A. road network      (OSM: Geofabrik / Overpass / OSMnx)
  B. rainfall/weather  (IMD via imdlib; ERA5 via cdsapi)
  C. terrain/elevation (Copernicus GLO-30)
  E. landcover/water   (ESA WorldCover; HydroRIVERS; JRC GSW)
  D. incidents/labels  (added from the incidents discovery agent's verified findings)

Usage:
  python validate_sources.py                 # check the scriptable (no-auth) sources
  python validate_sources.py --all           # include auth-walled (reports why)
  python validate_sources.py --json out.json # write a machine-readable report
"""
from __future__ import annotations

import argparse
import json
import sys
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Callable, Optional

sys.path.insert(0, str(Path(__file__).resolve().parent))
from ner_config import VALIDATION_DIR, ensure_data_dirs  # noqa: E402


@dataclass
class Source:
    key: str
    category: str            # A/B/C/D/E
    title: str
    org: str
    url: str
    license: str
    rank: str                # A/B/C/D (usability, per discovery)
    accessible: bool         # True = scriptable with NO account/key
    access_note: str         # blunt reality
    data_source_type: str    # confidence ladder
    check: Optional[Callable[[], tuple[bool, str]]] = None  # live probe -> (ok, detail)
    verified_2026_08_29: str = ""  # what the agent confirmed


# Polite identifying UA — some hosts (e.g. Overpass) 406 the default requests UA.
_UA = {"User-Agent": "ner-logistics-data-pipeline/1.0 (SIH2025 research)"}


# ── live probes (real network calls; short timeouts) ─────────────────────────
def _http_head(url: str, expect=(200, 206, 302, 301), timeout=25):
    def _c():
        import requests
        try:
            r = requests.head(url, headers=_UA, timeout=timeout, allow_redirects=True)
            ok = r.status_code in expect
            if ok:
                return ok, f"HEAD {r.status_code}"
            # some hosts don't answer HEAD well; confirm with a 1-byte ranged GET
            r = requests.get(url, headers={**_UA, "Range": "bytes=0-0"}, timeout=timeout, stream=True)
            return r.status_code in expect, f"GET(range) {r.status_code}"
        except Exception as e:
            try:
                import requests
                r = requests.get(url, headers={**_UA, "Range": "bytes=0-0"}, timeout=timeout, stream=True)
                return r.status_code in expect, f"GET(range) {r.status_code}"
            except Exception as e2:
                return False, f"{type(e2).__name__}: {str(e2)[:80]}"
    return _c


def _overpass_probe():
    def _c():
        import requests
        try:
            r = requests.get("https://overpass-api.de/api/status", headers=_UA, timeout=25)
            return r.status_code == 200, f"status endpoint {r.status_code}"
        except Exception as e:
            return False, f"{type(e).__name__}: {str(e)[:80]}"
    return _c


def _pkg_probe(mod: str):
    def _c():
        import importlib
        try:
            m = importlib.import_module(mod)
            return True, f"import ok v{getattr(m, '__version__', '?')}"
        except Exception as e:
            return False, f"{type(e).__name__}"
    return _c


def _cog_probe(url: str):
    def _c():
        import warnings; warnings.filterwarnings("ignore")
        try:
            import rasterio
            with rasterio.open(url) as ds:
                return True, f"COG {ds.width}x{ds.height} {ds.crs}"
        except Exception as e:
            return False, f"{type(e).__name__}: {str(e)[:80]}"
    return _c


# ── registry (verified 2026-08-29 by discovery agents) ───────────────────────
GLO30_TILE = ("https://copernicus-dem-30m.s3.amazonaws.com/"
              "Copernicus_DSM_COG_10_N26_00_E091_00_DEM/Copernicus_DSM_COG_10_N26_00_E091_00_DEM.tif")

REGISTRY: list[Source] = [
    # ── A. Road network ──
    Source("geofabrik_ner", "A", "Geofabrik North-Eastern Zone extract", "Geofabrik/OSM",
           "https://download.geofabrik.de/asia/india/north-eastern-zone-latest.osm.pbf",
           "ODbL 1.0", "A", True, "Direct 104 MB PBF, no auth; 302->dated file is normal.",
           "REAL_OPEN", _http_head("https://download.geofabrik.de/asia/india/north-eastern-zone-latest.osm.pbf"),
           "HEAD 200, 109,194,731 B, Last-Modified 2026-08-28."),
    Source("overpass", "A", "Overpass API (live OSM)", "OSM/Overpass",
           "https://overpass-api.de/api/interpreter", "ODbL 1.0", "A", True,
           "Live query API, no key; fair-use quota (~2 slots, 10k q/day).",
           "REAL_OPEN", _overpass_probe(),
           "Live query returned NER ways highway=trunk/ref=NH27/surface=asphalt."),
    Source("osmnx", "A", "OSMnx (Python over Overpass)", "G. Boeing/PyPI",
           "https://pypi.org/project/osmnx/", "ODbL 1.0 (data)", "A", True,
           "pip package; rides Overpass/Nominatim; per-state graphs.",
           "REAL_OPEN", _pkg_probe("osmnx"),
           "v2.0.7 installed; live Guwahati bbox fetch returned 116 nodes/272 edges."),
    # ── B. Rainfall / weather ──
    Source("imd_rain", "B", "IMD 0.25deg daily gridded rainfall (1901-2024)", "IMD Pune",
           "https://imdpune.gov.in/cmpg/Griddata/Rainfall_25_NetCDF.html", "IMD open (cite Pai 2014)",
           "A", True, "imdlib pip package, no login; official gauge product.",
           "REAL_OFFICIAL", _pkg_probe("imdlib"),
           "imdlib 0.1.21; get_data('rain',y1,y2) signature confirmed."),
    Source("era5", "B", "ERA5 hourly single-levels (precip/temp/humidity/wind)", "ECMWF/Copernicus",
           "https://cds.climate.copernicus.eu/datasets/reanalysis-era5-single-levels", "Copernicus CC-BY",
           "B", False, "Free but needs a CDS token in ~/.cdsapirc (one-time signup).",
           "REAL_OFFICIAL", _pkg_probe("cdsapi"),
           "cdsapi 0.7.7 importable; endpoint verified reachable."),
    # ── C. Terrain / elevation ──
    Source("glo30", "C", "Copernicus GLO-30 DEM (30 m)", "ESA/Copernicus (AWS Open Data)",
           GLO30_TILE, "Copernicus/ESA free-use", "A", True,
           "Anonymous COGs; rasterio reads windows directly, no download needed.",
           "REAL_OFFICIAL", _cog_probe(GLO30_TILE),
           "N26_E091 HTTP 200, N28_E088 206; opened live 3600x3600 EPSG:4326."),
    # ── E. Land cover / water / rivers ──
    Source("worldcover", "E", "ESA WorldCover 10 m land cover (2021 v200)", "ESA/VITO",
           "https://esa-worldcover.s3.eu-central-1.amazonaws.com/v200/2021/map/ESA_WorldCover_10m_2021_v200_N24E093_Map.tif",
           "CC-BY 4.0", "A", True, "Anonymous COG tiles (3 deg grid).",
           "REAL_OPEN", _http_head("https://esa-worldcover.s3.eu-central-1.amazonaws.com/v200/2021/map/ESA_WorldCover_10m_2021_v200_N24E093_Map.tif"),
           "Tiles N24E093/N27E093 HTTP 206."),
    Source("hydrorivers", "E", "HydroRIVERS Asia (river network vector)", "WWF/McGill HydroSHEDS",
           "https://data.hydrosheds.org/file/HydroRIVERS/HydroRIVERS_v10_as_shp.zip",
           "HydroSHEDS free (sci/edu/commercial)", "A", True, "One 90.5 MB anonymous zip.",
           "REAL_ACADEMIC", _http_head("https://data.hydrosheds.org/file/HydroRIVERS/HydroRIVERS_v10_as_shp.zip"),
           "HEAD 200, application/zip, 90.5 MB."),
    Source("jrc_gsw", "E", "JRC Global Surface Water (occurrence, 30 m)", "EC JRC/Copernicus",
           "https://storage.googleapis.com/global-surface-water/downloads2021/occurrence/occurrence_90E_30Nv1_4_2021.tif",
           "Free (cite Pekel 2016)", "B", True, "Anonymous 10 deg tiles; ~2 cover NER.",
           "REAL_OFFICIAL", _http_head("https://storage.googleapis.com/global-surface-water/downloads2021/occurrence/occurrence_90E_30Nv1_4_2021.tif"),
           "Tiles 90E_30Nv1_4/80E_30Nv1_4 HTTP 206 (filename has no '_' before v1_4)."),
    # ── D. incidents / labels (verified by the incidents discovery agent) ──
    Source("nasa_glc", "D", "NASA Global Landslide Catalog (COOLR) — NER landslide incidents",
           "NASA GSFC",
           "https://data.nasa.gov/docs/legacy/Global_Landslide_Catalog_Export/Global_Landslide_Catalog_Export_rows.csv",
           "Cite Kirschbaum 2010 & 2015 (license: not specified)", "A", True,
           "Direct CSV, no auth. THE real label source: dated point landslides.",
           "REAL_ACADEMIC",
           _http_head("https://data.nasa.gov/docs/legacy/Global_Landslide_Catalog_Export/Global_Landslide_Catalog_Export_rows.csv"),
           "Downloaded 8.5 MB / 11,033 rows; NER=442 (344 state-named), all with "
           "lat/lon+event_date, 2007-04-11..2016-10-15; 291 name road impact."),
    Source("dfo_floods", "D", "Dartmouth Flood Observatory — Global Flood Records", "DFO / U. Colorado",
           "https://zenodo.org/records/19288171/files/Global_Flood_Records.csv?download=1",
           "CC-BY-4.0 / CC0-1.0", "C", True,
           "Dated floods but COUNTRY-level (no lat/lon in CSV) — too coarse to localize "
           "to a road. Usable only as coarse flood context, not point labels.",
           "REAL_OPEN",
           _http_head("https://zenodo.org/records/19288171/files/Global_Flood_Records.csv?download=1"),
           "CSV 5,502 rows 1985-2023; India=316 at country granularity."),
    Source("bhukosh_gsi", "D", "GSI Bhukosh landslide inventory", "Geological Survey of India",
           "https://bhukosh.gsi.gov.in/Bhukosh/Public", "GSI terms", "D", False,
           "Map-viewer portal (shapefile after interaction), not a clean dated CSV. "
           "Returned code 000 from THIS environment (likely host geofencing) — cannot "
           "verify dates/coords live here. Reported honestly, NOT substituted.",
           "REAL_OFFICIAL",
           _http_head("https://bhukosh.gsi.gov.in/Bhukosh/Public"),
           "gsi.gov.in resolves (200) but Bhukosh portal unreachable (000) on all tries."),
    Source("india_wris", "D", "India-WRIS flood/water history", "MoJS / CWC",
           "https://indiawris.gov.in/wris/", "Govt open (viewer-centric)", "D", False,
           "Viewer-centric water portal; flood history not a clean dated export. "
           "Code 000 from this environment — unverifiable here, reported honestly.",
           "REAL_OFFICIAL",
           _http_head("https://indiawris.gov.in/wris/"),
           "ECONNREFUSED / 000 on all attempts from this environment."),
    Source("asdma_frims", "D", "ASDMA FRIMS daily flood bulletins (Assam)", "Assam State DMA",
           "https://sdmassam.nic.in/", "Govt (bulletins/PDF)", "B", False,
           "Daily district/circle-level dated flood bulletins as PDFs — B-grade IF "
           "scraped/OCR'd (manual). Code 000 from this environment. Not structured open data.",
           "REAL_OFFICIAL",
           _http_head("https://sdmassam.nic.in/"),
           "Unreachable (000) here; known to publish FRIMS bulletins (PDF, not CSV)."),
]


def run(check_all: bool) -> dict:
    ensure_data_dirs()
    rows = []
    print(f"{'KEY':<14}{'CAT':<4}{'RANK':<5}{'SCRIPTABLE':<11}{'LIVE CHECK'}")
    print("-" * 78)
    for s in REGISTRY:
        if not check_all and not s.accessible:
            live_ok, detail = None, "skipped (auth-walled; use --all)"
        elif s.check is not None:
            live_ok, detail = s.check()
        else:
            live_ok, detail = None, "no probe"
        flag = {True: "OK", False: "FAIL", None: "-"}[live_ok]
        print(f"{s.key:<14}{s.category:<4}{s.rank:<5}{str(s.accessible):<11}{flag}  {detail}")
        rows.append({
            "key": s.key, "category": s.category, "title": s.title, "org": s.org,
            "url": s.url, "license": s.license, "rank": s.rank,
            "scriptable_no_auth": s.accessible, "access_note": s.access_note,
            "data_source_type": s.data_source_type, "verified_2026_08_29": s.verified_2026_08_29,
            "live_ok": live_ok, "live_detail": detail,
        })
    return {"checked_at": datetime.now(timezone.utc).isoformat(),
            "count": len(rows), "sources": rows}


def main() -> int:
    ap = argparse.ArgumentParser(description="Validate (live-probe) the NER data sources.")
    ap.add_argument("--all", action="store_true", help="Also probe auth-walled sources.")
    ap.add_argument("--json", type=str, default=None, help="Write JSON report to this path.")
    args = ap.parse_args()
    report = run(args.all)
    out = Path(args.json) if args.json else (VALIDATION_DIR / "source_validation.json")
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(report, indent=2), encoding="utf-8")
    ok = sum(1 for r in report["sources"] if r["live_ok"] is True)
    print("-" * 78)
    print(f"live-reachable: {ok}/{report['count']}   report -> {out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
