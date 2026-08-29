---
name: offline-first-sync-scaffolder
description: Use this skill when the user asks to build, modify, or debug the field-official mobile app's offline storage, background sync, geo-tagged reporting, or anything involving Room/SQLite local database and network reconnection logic.
---

# Offline-First Sync Scaffolder

## Goal
Generate and maintain the Flutter field-reporting app's offline-first data layer: local storage that always accepts writes regardless of connectivity, a background sync service that reliably drains the queue when network returns, and conflict resolution that never silently drops a field officer's report.

## Instructions

1. **Local database first.**
   - Every field report (incident, photo, geo-tag) writes to the local SQLite/Room database immediately. The UI must never block on or wait for network availability to confirm a save.
   - Schema includes a `sync_status` column (`pending`, `syncing`, `synced`, `failed`) and a `local_created_at` timestamp separate from any server timestamp.

2. **Background sync service.**
   - Poll connectivity state (not just a single check at app launch — connectivity can flap in NER's terrain).
   - When online, drain the `pending` queue in `local_created_at` order.
   - On failure, retry with exponential backoff (start at 5s, cap at 5 min), and increment a retry counter. After a configurable max retries, mark `failed` and surface it to the user rather than retrying silently forever.

3. **Conflict resolution.**
   - Default: last-write-wins on the server, but the server response must return the canonical record, and the client must reconcile its local copy rather than assuming its own write "won."
   - For photo/incident reports specifically — these are creates, not updates, so true conflicts are rare. Treat duplicate-looking reports (same officer, same location, within 5 minutes) as a warning to flag for dedup, not an automatic merge.

4. **Geo-tagged photo capture.**
   - Embed GPS coordinates and timestamp into photo metadata at capture time, before any compression, so the data survives even if compression or upload fails.
   - Compress for low-bandwidth upload (target: under 500KB per photo) but keep the original at full resolution in local storage until sync is confirmed.

5. **Offline map tiles.**
   - Pre-package MBTiles for the officer's assigned district(s) at app install or first sync, not on-demand — on-demand fetching defeats the purpose of offline-first.

6. **Multilingual UI check.**
   - Any new UI string added during scaffolding must go into the i18n resource files for all required languages (Assamese, Bengali, Bodo, Manipuri, Hindi, English), even if only English is filled in initially — flag missing translations rather than hardcoding English strings inline.

## Examples

**Input:** "Add a new field to the incident report form for road width estimate."
**Action:** Add the column to the local Room schema with a migration, update the sync payload schema and server-side validation together (not just one side), add the new label to all six language resource files (flagging untranslated ones), and confirm the field is included in the `pending` → `synced` payload.

**Input:** "Sync is dropping some reports when the officer's phone loses signal mid-upload."
**Action:** Check that uploads are wrapped in a transaction that only marks `synced` after server confirms receipt — a report should stay `pending` (not `synced`) if the connection drops mid-request, so it retries rather than being silently lost.

## Constraints
- Never mark a report `synced` before receiving explicit server confirmation.
- Never block the local save on network availability.
- Never let a compression step run before GPS/timestamp metadata is embedded in the photo.
- Never hardcode a UI string in only one language — always route through the i18n resource files.
- Never silently drop a report after max retries — it must surface as `failed` and be visible to the user or a sync-status screen.
