---
name: mbtiles-offline-map-packer
description: Use this skill when the user asks to prepare, update, or debug offline map tiles for the field-reporting app's district-level offline maps.
---

# MBTiles Offline Map Packer

## Goal
Package district-level vector map tiles into the field app at install/first-sync time so officers can navigate and report incidents with zero connectivity, without bloating the app's storage footprint unnecessarily.

## Instructions
1. **Package by assigned district(s) only**, not the entire NER region — determine the officer's assignment at provisioning time and download only relevant MBTiles, checking storage constraints on typical field devices.
2. **Use vector tiles, not raster**, where possible — smaller footprint and allows on-device restyling (e.g., highlighting a reported incident) without re-downloading tiles.
3. **Version the tile packages** and check for updates only when online — an officer's map shouldn't silently go stale without any indication of "last updated" date, especially important as new roads or damage change the terrain.
4. **Verify package integrity after download** (checksum) before marking the offline map as ready — a corrupted partial download should trigger a retry, not a broken map discovered mid-fieldwork.
5. **Graceful degradation.** If offline tiles for a district aren't yet downloaded (new officer, new assignment), the app should clearly indicate map unavailability rather than showing a blank or broken map silently.

## Examples
**Input:** "An officer got reassigned to a new district, how does their offline map update?"
**Action:** Trigger a new district package download next time they have connectivity, keep the old district's tiles until the new one is confirmed downloaded (don't leave them with no offline map during the transition), and show a clear "map ready" status once complete.

**Input:** "App storage is filling up on older field devices."
**Action:** Check whether tiles for previously-assigned (now irrelevant) districts are still being retained — implement a cleanup policy for districts no longer assigned, with confirmation before deleting.

## Constraints
- Never download the entire NER region's tiles when only the assigned district(s) are needed.
- Never mark an offline map "ready" without verifying download integrity via checksum.
- Never leave an officer with a silently blank/broken map — always show explicit unavailability status.
- Never delete a district's offline tiles without confirming a replacement is ready, if reassignment is the reason.
