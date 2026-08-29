"""
ingest_incidents.py — REAL disruption labels from the NASA Global Landslide Catalog
====================================================================================

VERIFIED SOURCE (downloaded & parsed by discovery agent 2026-08-29):
  NASA Global Landslide Catalog (GLC / COOLR), NASA GSFC.
    CSV : https://data.nasa.gov/docs/legacy/Global_Landslide_Catalog_Export/Global_Landslide_Catalog_Export_rows.csv
    Cite: Kirschbaum et al. 2010 (Nat. Hazards) & 2015 (Geomorphology).
  11,033 rows globally; India = 1,265; NER = 344 rows, ALL with valid
  latitude+longitude AND event_date. ~60% of NER rows name a road/bridge/route.
  Coverage 1988-2017 (bulk 2007-2017); NOT updated past ~2017.

WHY THIS IS THE LABEL SOURCE (and what it is NOT):
  * A structured "road X closed on date Y" open dataset does NOT exist for NER.
    We do NOT fabricate one. GLC is the most defensible REAL, dated, point-located
    hazard record — used here for DISTANT SUPERVISION / weak labels, not as a
    gold-standard road-closure ledger. Stated plainly in metadata + report.
  * Floods (DFO) are dated but country-level (too coarse to localize to a road);
    Bhukosh/India-WRIS/ASDMA were unreachable from this environment. Those are
    reported honestly in the discovery report, not silently substituted.

data_source_type = REAL_ACADEMIC:
  NASA GSFC peer-reviewed catalog, but the underlying events are media/citizen
  sourced (reporting bias toward severe / road-blocking events). Not an official
  government incident ledger -> REAL_ACADEMIC, not REAL_OFFICIAL. The road-impact
  text flag we derive is tagged DERIVED (our regex, not a source field).

WHAT THIS PRODUCES (nothing fabricated — every row comes from the GLC CSV):
  data/raw/incidents/glc_export.csv                 immutable raw download
  data/processed/ner_landslide_incidents.parquet    NER-filtered incidents (+point geom wkt)
  data/processed/ner_landslide_incidents.gpkg        same, as GIS points
  data/metadata/nasa_glc_incidents.json             provenance

These points become the POSITIVE labels for `disruption_next_24h` in the fusion
step: a road segment is labelled disrupted if a GLC point falls within a buffer
(scaled by `location_accuracy`) of it, on event_date (+24 h). Negatives are
sampled segment-days with no nearby incident (see Prompt-3 fusion).

Usage:
  python ingest_incidents.py            # download + filter to NER + write outputs
  python ingest_incidents.py --keep     # reuse cached raw CSV if present
"""
from __future__ import annotations

import argparse
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from ner_config import (  # noqa: E402
    NER_BBOX, NER_STATES, RAW_DIR, PROCESSED_DIR, CRS_WGS84, ensure_data_dirs,
)
from provenance import DatasetMetadata, write_metadata, guard_raw_path  # noqa: E402

INCIDENTS_RAW_DIR = RAW_DIR / "incidents"
GLC_CSV_URL = ("https://data.nasa.gov/docs/legacy/Global_Landslide_Catalog_Export/"
               "Global_Landslide_Catalog_Export_rows.csv")
_UA = {"User-Agent": "ner-logistics-data-pipeline/1.0 (SIH2025 research)"}

# our own regex (DERIVED) — flags GLC free text that names road/transport impact
ROAD_TEXT_RE = re.compile(
    r"\b(?:road|highway|nh[-\s]?\d+|national\s+highway|bridge|culvert|route|"
    r"stranded|cut[-\s]?off|cutoff|connectivity|traffic|vehicle|transport|"
    r"blocked|landslip|debris)\b",
    re.IGNORECASE,
)


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def fetch_glc_csv(keep: bool) -> Path:
    import requests

    INCIDENTS_RAW_DIR.mkdir(parents=True, exist_ok=True)
    dst = INCIDENTS_RAW_DIR / "glc_export.csv"
    if dst.exists() and keep:
        print(f"  [cache] {dst.name}")
        return dst
    print("  [fetch] NASA Global Landslide Catalog CSV ...")
    with requests.get(GLC_CSV_URL, headers=_UA, stream=True, timeout=180) as r:
        r.raise_for_status()
        guard_raw_path("incidents/glc_export.csv", allow_exists=True)
        with open(dst, "wb") as f:
            for chunk in r.iter_content(chunk_size=1 << 20):
                f.write(chunk)
    print(f"          wrote {dst.stat().st_size/1e6:.1f} MB")
    return dst


def _match_state(row_text: str) -> str | None:
    low = row_text.lower()
    for st in NER_STATES:
        if st.lower() in low:
            return st
    return None


def build_ner_incidents(csv_path: Path):
    import numpy as np
    import pandas as pd
    import geopandas as gpd

    df = pd.read_csv(csv_path, low_memory=False)
    print(f"  [read ] {len(df):,} global rows, {df.shape[1]} columns")

    # numeric coords + parsed date; drop rows lacking either (honest completeness)
    df["latitude"] = pd.to_numeric(df.get("latitude"), errors="coerce")
    df["longitude"] = pd.to_numeric(df.get("longitude"), errors="coerce")
    df["event_date"] = pd.to_datetime(df.get("event_date"), errors="coerce")
    df = df.dropna(subset=["latitude", "longitude", "event_date"]).copy()

    # geographic truth: point inside NER bbox AND country India
    in_bbox = (
        df["latitude"].between(NER_BBOX["min_lat"], NER_BBOX["max_lat"])
        & df["longitude"].between(NER_BBOX["min_lng"], NER_BBOX["max_lng"])
    )
    is_india = df.get("country_name", "").astype(str).str.contains("India", case=False, na=False)
    ner = df[in_bbox & is_india].copy()
    print(f"  [filt ] {len(ner):,} rows in NER bbox & country=India")

    # assign state from admin/location/title text (best-effort, honest)
    def _state(r):
        blob = " ".join(str(r.get(c, "")) for c in
                        ("admin_division_name", "location_description", "event_title"))
        return _match_state(blob)
    ner["ner_state"] = ner.apply(_state, axis=1)
    named = ner["ner_state"].notna().sum()
    print(f"  [state] {named:,}/{len(ner):,} rows matched to an NER state name")

    # DERIVED road-impact flag from free text (our regex, not a source field)
    text_blob = (ner.get("event_title", "").astype(str) + " " +
                 ner.get("event_description", "").astype(str))
    ner["road_impact_text"] = text_blob.str.contains(ROAD_TEXT_RE)
    print(f"  [road ] {int(ner['road_impact_text'].sum()):,} rows name road/transport impact (DERIVED flag)")

    # tidy label-relevant columns; keep provenance-critical raw fields
    keep_cols = [c for c in [
        "event_id", "event_date", "event_time", "event_title", "event_description",
        "location_description", "location_accuracy", "landslide_category",
        "landslide_trigger", "landslide_size", "fatality_count", "injury_count",
        "source_name", "source_link", "admin_division_name", "country_name",
        "latitude", "longitude",
    ] if c in ner.columns]
    ner = ner[keep_cols + ["ner_state", "road_impact_text"]].copy()
    ner["data_source_type"] = "REAL_ACADEMIC"
    ner["label_role"] = "positive_landslide"  # role in disruption_next_24h labelling

    gdf = gpd.GeoDataFrame(
        ner, geometry=gpd.points_from_xy(ner["longitude"], ner["latitude"]), crs=CRS_WGS84
    )
    gdf["geometry_wkt"] = gdf.geometry.to_wkt()

    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    pq = PROCESSED_DIR / "ner_landslide_incidents.parquet"
    gp = PROCESSED_DIR / "ner_landslide_incidents.gpkg"
    pd.DataFrame(gdf.drop(columns="geometry")).to_parquet(pq, index=False)
    gdf.to_file(gp, driver="GPKG", layer="incidents")

    # honest coverage summary
    yr = gdf["event_date"].dt.year
    summary = {
        "ner_incidents": int(len(gdf)),
        "with_state_name": int(named),
        "road_impact_text": int(gdf["road_impact_text"].sum()),
        "date_min": str(gdf["event_date"].min().date()),
        "date_max": str(gdf["event_date"].max().date()),
        "by_year": {int(k): int(v) for k, v in yr.value_counts().sort_index().items()},
        "by_state": {k: int(v) for k, v in gdf["ner_state"].value_counts().items()},
        "location_accuracy": {str(k): int(v)
                              for k, v in gdf.get("location_accuracy",
                                                  pd.Series(dtype=str)).value_counts().items()},
    }
    print(f"  [write] {pq.name} + {gp.name}")
    print(f"  [dates] {summary['date_min']} .. {summary['date_max']}")
    print(f"  [state] {summary['by_state']}")
    return gdf, pq, gp, csv_path, summary


def main() -> int:
    ap = argparse.ArgumentParser(description="Ingest NASA GLC landslide incidents for NER (REAL labels).")
    ap.add_argument("--keep", action="store_true", help="Reuse cached raw CSV if present.")
    args = ap.parse_args()
    ensure_data_dirs()
    print("NER disruption labels — NASA Global Landslide Catalog (REAL_ACADEMIC)")

    csv_path = fetch_glc_csv(args.keep)
    gdf, pq, gp, raw, summary = build_ner_incidents(csv_path)

    meta = DatasetMetadata(
        dataset_id="nasa_glc_incidents",
        title="NASA Global Landslide Catalog — NER landslide incidents (labels)",
        data_source_type="REAL_ACADEMIC",
        source_org="NASA Goddard Space Flight Center (GLC / COOLR)",
        source_url=GLC_CSV_URL,
        license="Cite Kirschbaum et al. 2010 & 2015 (data.gov: license not specified)",
        coverage_region="NER (8 states)",
        ner_coverage=f"{summary['ner_incidents']} dated point incidents",
        date_range=f"{summary['date_min']} .. {summary['date_max']} (bulk 2007-2017; not updated past ~2017)",
        spatial_resolution="point lat/lon with location_accuracy (exact..25 km)",
        file_format="CSV (raw) -> Parquet + GeoPackage (processed)",
        download_method="direct CSV download (no auth)",
        download_date=_now_iso(),
        columns=list(gdf.columns),
        ml_use="POSITIVE labels for disruption_next_24h via spatial+temporal buffer join "
               "to road segments (distant supervision / weak labels).",
        reliability="High as a hazard record; MEDIA-SOURCED so biased toward severe / "
                    "road-blocking events. Not an official road-closure ledger.",
        limitations="Bulk data ends ~2017 (drives the 2007-2017 modelling window); "
                    "location_accuracy varies (0.5-25 km); 'road impact' is a DERIVED "
                    "text flag, not a source field; reporting bias. Use as weak labels only.",
        verified=True,
        verification_notes="Discovery agent downloaded & parsed full CSV (11,033 rows); "
                           "re-materialised here — see coverage summary in extra.",
    )
    meta.add_raw_file(raw)
    meta.extra = {"coverage_summary": summary,
                  "road_impact_regex": ROAD_TEXT_RE.pattern,
                  "outputs": {"parquet": str(pq), "gpkg": str(gp)}}
    print("  ->", write_metadata(meta))
    print("  done.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
