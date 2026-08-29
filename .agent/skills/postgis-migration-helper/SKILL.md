---
name: postgis-migration-helper
description: Use this skill when the user asks to add, modify, or review a database migration involving spatial data, PostGIS columns, or geometry/geography types.
---

# PostGIS Migration Helper

## Goal
Write and validate database migrations touching spatial data so that spatial queries stay fast and correct as the schema evolves — a missing spatial index or wrong SRID silently makes queries slow or wrong rather than throwing an obvious error.

## Instructions
1. **Always specify SRID explicitly** on new geometry/geography columns (use 4326 for lat/lon unless there's a specific reason otherwise) — never leave it as an unspecified/generic geometry type.
2. **Add a GiST spatial index** on every new geometry/geography column used in a `ST_DWithin`, `ST_Intersects`, or similar spatial query — check existing query patterns in the service before assuming no index is needed.
3. **Migrations must be reversible.** Every migration needs a working `down`/rollback that actually removes what `up` added, tested locally before merging.
4. **Validate geometry validity** on data migrations that transform existing spatial data — use `ST_IsValid` and report (don't silently skip) any rows that fail.
5. **Test against a realistic data volume**, not just a handful of rows — spatial index behavior and query plans can differ meaningfully at scale (e.g., 5,000+ vehicles per NFR-1).

## Examples
**Input:** "Add a column to store the road segment's centroid."
**Action:** Add as `geography(Point, 4326)`, create a GiST index on it if it'll be queried spatially, and write both up and down migrations.

**Input:** "Migrate the old lat/lon float columns to a proper geometry column."
**Action:** Write a data migration that constructs geometries from the existing floats, validates each with `ST_IsValid`, reports any invalid rows rather than silently dropping them, and only then drops the old float columns in a separate migration (not the same one) so the change is reversible at each step.

## Constraints
- Never create a geometry/geography column without an explicit SRID.
- Never skip a spatial index on a column used in spatial query predicates.
- Never ship a migration without a tested rollback.
- Never silently drop rows that fail geometry validation during a data migration.
