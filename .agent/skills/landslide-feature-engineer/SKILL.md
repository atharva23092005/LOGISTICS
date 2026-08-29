---
name: landslide-feature-engineer
description: Use this skill when the user asks to build, update, or debug the feature pipeline feeding the disruption prediction model — rainfall, slope, soil moisture, seismic, NDVI, or road history data.
---

# Landslide/Flood Feature Engineer

## Goal
Produce a single, versioned, per-road-segment feature table that the ensemble-trainer skill can consume directly, joining weather, terrain, satellite, and historical data sources without silent gaps or misalignment.

## Instructions
1. **Join on road segment ID, not lat/lon proximity alone.** Proximity joins between raw GPS points and road segments are lossy near junctions — snap points to the nearest segment using a consistent tolerance (e.g., 50m) and log how many points were unmatched.
2. **Pull each source with explicit timestamps:**
   - IMD rainfall: current reading + 7-day forecast, refreshed at a fixed interval (e.g., every 6 hours).
   - DEM-derived slope angle/aspect: static per segment, recompute only if DEM source updates.
   - Soil moisture index: from remote sensing or IMD, same cadence as rainfall.
   - Seismic activity: pull from the relevant monitoring feed, flag any gap in coverage per region.
   - Road condition history: derived from field reports and past incident records.
   - NDVI: from Bhuvan/satellite imagery, refreshed at whatever cadence imagery updates (typically weekly-ish).
   - Proximity to water bodies: static, computed once from GIS layers.
3. **Version every output table** with a content hash and a manifest listing which source snapshot (with timestamp) fed each column.
4. **Never forward-fill missing forecast data** across more than one refresh cycle — a stale rainfall forecast silently degrades model accuracy without any error being raised. Flag segments with stale data explicitly with a `data_freshness` column.
5. **Write output to `data/features/road_segments_features.parquet`** with a companion `manifest.json`.

## Examples
**Input:** "IMD API is down, what do we do for today's feature build?"
**Action:** Use the last successful pull but mark every affected segment's `data_freshness` column as stale rather than silently reusing old data as if it were current, and surface this to whoever is about to train or serve predictions.

**Input:** "Add the new soil sensor network as a data source."
**Action:** Add it as a new column, don't overwrite the existing soil moisture index column — keep both until you've validated the new source's coverage and quality against the old one.

## Constraints
- Never silently forward-fill stale forecast data without a freshness flag.
- Never join on lat/lon proximity without snapping to a canonical segment ID first.
- Never overwrite a previous feature table version in place — always version it.
- Never ship a feature table without a manifest describing source snapshots used.
