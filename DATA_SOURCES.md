# NER Logistics — Real-Data Source Inventory (Prompt 1: Discovery)

**Verified:** 2026-08-29 · **Region:** 8 North-Eastern states (Arunachal Pradesh, Assam, Manipur, Meghalaya, Mizoram, Nagaland, Sikkim, Tripura) · **Modeling grain:** `ROAD_SEGMENT × DATE` · **Target:** `disruption_next_24h`

> **How to read this document.** Every source below was *live-probed* by the acquisition
> pipeline (`scripts/data/validate_sources.py`), and the ones we depend on were additionally
> *downloaded and parsed* to confirm they contain what we claim. Nothing here is aspirational.
> Where a source could **not** be reached or does **not** contain usable data, it says so plainly —
> we do not substitute fabricated data for a source that failed.

---

## 0. The confidence ladder (shown in the Provenance UI)

Every row, feature, and label in the ML dataset carries a `data_source_type`:

| Tier | Meaning | UI weight |
|---|---|---|
| `REAL_OFFICIAL` | Government / IMD / ISRO-NRSC / GSI / Copernicus | 100 |
| `REAL_OPEN` | OpenStreetMap, open reanalyses, open-licensed real data | 85 |
| `REAL_ACADEMIC` | Peer-reviewed / published research datasets | 75 |
| `DERIVED` | Computed **from** real data (e.g. slope from a real DEM) | 60 |
| `SIMULATED` | Explicitly synthetic (operational data we cannot source) | 30 |

---

## 1. Live validation summary (`--all`, 2026-08-29)

**11 of 14 sources live-reachable.** The 3 failures are Indian-government portals that
return connection code `000` **from this build environment** (likely host geofencing) — they are
reported honestly and are **not** used as data sources.

| Key | Cat | Source | Scriptable | Live | Role |
|---|---|---|---|---|---|
| `geofabrik_ner` | A | Geofabrik NE-Zone PBF | ✅ | OK | Road network |
| `overpass` | A | Overpass API | ✅ | OK | Road network (live) |
| `osmnx` | A | OSMnx (Python) | ✅ | OK | Road network (per-state) |
| `imd_rain` | B | IMD 0.25° gridded rainfall | ✅ | OK | **Primary weather trigger** |
| `era5` | B | ERA5 reanalysis | 🔑 token | OK | Weather fallback |
| `glo30` | C | Copernicus GLO-30 DEM | ✅ | OK | Terrain (elev/slope/TRI) |
| `worldcover` | E | ESA WorldCover 10 m | ✅ | OK | Land-cover exposure |
| `hydrorivers` | E | HydroRIVERS v10 | ✅ | OK | Distance-to-river |
| `jrc_gsw` | E | JRC Global Surface Water | ✅ | OK | Flood exposure |
| `nasa_glc` | D | **NASA Global Landslide Catalog** | ✅ | OK | **Primary REAL labels** |
| `dfo_floods` | D | Dartmouth Flood Observatory | ✅ | OK | Coarse flood context |
| `bhukosh_gsi` | D | GSI Bhukosh inventory | ❌ | **FAIL (000)** | Unverifiable here |
| `india_wris` | D | India-WRIS | ❌ | **FAIL (000)** | Unverifiable here |
| `asdma_frims` | D | ASDMA FRIMS bulletins | ❌ | **FAIL (000)** | PDF bulletins, not open data |

---

## 2. Feature sources (environmental foundation — all REAL)

### A. Road network — OpenStreetMap `REAL_OPEN`
- **Access:** Geofabrik North-Eastern Zone PBF (109 MB, ODbL); Overpass API; OSMnx per-state graphs. No auth.
- **Verified:** live Guwahati fetch → **4,211 segments** with `highway/name/ref/bridge/tunnel/lanes/maxspeed`; parquet round-trip OK.
- **Script:** `download_osm.py` → `processed/road_segments.parquet` + `.gpkg`. `segment_id` = `osm-<state>-<i>`.
- **ML use:** the spatial spine — every other layer is joined onto these segments.

### B. Rainfall — IMD 0.25° daily gridded `REAL_OFFICIAL`
- **Access:** `imdlib` (MIT), no login. Official India Meteorological Department gauge-interpolated product, **1901–2024** (so it fully covers our 2007–2016 label era).
- **Verified:** downloaded 2023 (365 days, 129×135 grid); NER clip 365×31×39; max daily 449.1 mm. Negative fill masked to `NaN` — **never forward-filled**.
- **Script:** `download_imd.py` → `processed/ner_rainfall_daily.nc`. ERA5 (`cdsapi`, free token) is the multivariable fallback.
- **ML use:** antecedent 1/3/7-day rainfall windows per segment — the primary hydro-meteorological trigger.

### C. Terrain — Copernicus GLO-30 DEM `REAL_OFFICIAL` (+ `DERIVED` slope/TRI)
- **Access:** anonymous Cloud-Optimized GeoTIFFs on AWS Open Data. `rasterio` reads windows directly.
- **Verified:** opened N26_E091 (3600×3600, EPSG:4326); windowed elevation 48–73 m; slope derived.
- **Script:** `download_dem.py` → `ner_dem_30m.tif` + `ner_slope_deg.tif` + `ner_tri.tif`. Slope & TRI tagged **`DERIVED`**.
- **ML use:** elevation, slope, ruggedness — the primary geomorphic landslide predictors.

### E. Land cover / water / rivers
- **ESA WorldCover 10 m 2021** `REAL_OPEN` (CC-BY): 12 anonymous COG tiles cover NER (all HTTP 206). Sampled at fusion via windowed reads — verified reading real classes (Guwahati→built-up, Brahmaputra→water, Kaziranga→cropland).
- **HydroRIVERS v10** `REAL_ACADEMIC`: one 90 MB anonymous zip; clipped to NER → `ner_rivers.gpkg`. Gives `distance_to_river`.
- **JRC Global Surface Water 30 m** `REAL_OFFICIAL`: 2 anonymous tiles cover NER; occurrence % verified (Brahmaputra point = 99%). Flood-exposure signal.
- **Script:** `download_hydro.py`.

---

## 3. Label reality — the pivotal finding (read this)

**A ready-made, road-specific, dated, open "road closed on date X" dataset for the NER does not exist.**
We verified this rather than assuming it. Anyone claiming such a clean dataset is using a
proprietary/scraped source or fabricating. We therefore build **weak labels via distant
supervision** from the one genuine dated, point-located hazard record that *does* exist:

### NASA Global Landslide Catalog (GLC / COOLR) — `REAL_ACADEMIC` — **PRIMARY LABEL SOURCE**
- **Access:** direct CSV from `data.nasa.gov`, no auth. Cite Kirschbaum et al. 2010 & 2015.
- **Verified (downloaded & parsed, `ingest_incidents.py`):** 11,033 global rows → **442 in NER bbox+India → 344 matched to an NER state name** (independently reproducing the discovery agent's count). **All have lat/lon + `event_date`.** **291 name a road/bridge/route** in free text (our `DERIVED` regex flag).
- **Coverage:** **2007-04-11 → 2016-10-15** (bulk 2007–2017; **not updated past ~2017**).
- **By state:** Assam 85 · Manipur 70 · Nagaland 54 · Sikkim 48 · Arunachal 38 · Mizoram 25 · Meghalaya 21 · Tripura 3.
- **Output:** `processed/ner_landslide_incidents.parquet` + `.gpkg`.

### Consequences (forced by the data, not by preference)
1. **Modeling window = 2007–2016** (the real-label era), **not** 2018–2024. Modeling 2018–2024 would require labels that do not exist in bulk → would force fabrication. Chronological split: **train 2007–2013 (293 pos) · val 2014 (27) · test 2015–2016 (122)**.
2. **Accuracy is not the acceptance metric.** Segment×day landslide labels are extremely imbalanced (a trivial always-negative model scores ~99.99%). **PR-AUC / precision-recall@threshold** are primary; accuracy is context only.
3. **Labels are weak/distant-supervision**, not a gold-standard closure ledger — stated in provenance and in the submission. Positives = incident within an accuracy-scaled buffer of a segment on `event_date` (+24 h); negatives = sampled dry-day segment-days.

### Other label sources (verified, but insufficient alone)
- **Dartmouth Flood Observatory** `REAL_OPEN` (Zenodo, CC-BY): 5,502 dated flood records 1985–2023, **but country-level** (India=316, no lat/lon) — too coarse to localize to a road. Coarse flood context only.
- **EM-DAT:** country-level, account-walled. Cross-check only.
- **Bhuvan flood/landslide WMS** `REAL_OFFICIAL`: reachable, but **inundation/susceptibility rasters (viewer/WMS), not dated point incidents** — feature material, not labels.
- **GSI NLSM / NDMA Landslide Atlas:** **susceptibility maps/PDFs, not dated events** — a static terrain feature at best, never labels.
- **Bhukosh / India-WRIS / ASDMA:** **unreachable from this environment (000).** ASDMA FRIMS publishes dated district-level flood bulletins as **PDFs** (B-grade *if* OCR-scraped — manual, not open structured data). Reported honestly; not used.

---

## 4. Operational logistics data (vehicles / GPS / drivers) — must be `SIMULATED`

No open source provides real fleet telemetry, driver rosters, or delivery manifests for NER
logistics operators. Per the directive, this layer is **explicitly `SIMULATED`** and tagged as
such in the Provenance UI, **while the environmental + geospatial + hazard-label foundation
stays REAL**. The simulation is draped onto the real road graph and real risk surface so routing
demos are realistic, but never presented as real operational data.

---

## 5. What exists on disk after acquisition

```
python-service/data/
  raw/            # immutable, checksummed downloads (never overwritten)
    osm/  imd/  dem/  hydro/  incidents/glc_export.csv
  processed/
    road_segments.parquet/.gpkg      (REAL_OPEN)
    ner_rainfall_daily.nc            (REAL_OFFICIAL)
    ner_dem_30m.tif / slope / tri    (REAL_OFFICIAL / DERIVED)
    ner_rivers.gpkg                  (REAL_ACADEMIC)
    ner_landslide_incidents.parquet  (REAL_ACADEMIC)  ← labels
  metadata/       # one provenance JSON per dataset (source, license, limits, verified)
  validation/     # source_validation.json (live-reachability report)
```

**Next:** Prompt 3 (Fusion) joins these onto `ROAD_SEGMENT × DATE`; Prompt 4 builds the ML
dataset and trains the XGBoost disruption model with the chronological split and imbalance-aware
evaluation described above.
