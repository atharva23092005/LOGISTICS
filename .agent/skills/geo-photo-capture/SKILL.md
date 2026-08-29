---
name: geo-photo-capture
description: Use this skill when the user asks to build or modify the field-reporting app's photo capture flow, geo-tagging, or compression for incident reports.
---

# Geo-Tagged Photo Capture

## Goal
Capture incident photos with embedded, tamper-evident GPS/timestamp metadata that survives compression and low-bandwidth upload, without ever losing the original evidence quality.

## Instructions
1. **Embed metadata at capture time**, before any processing — GPS coordinates (with accuracy radius) and device timestamp written directly into image EXIF, not attached as separate app-level fields that could get disassociated from the photo.
2. **Keep full-resolution original in local storage** until the sync service confirms server receipt — only ever compress the copy being uploaded, never the sole stored copy, in case compression settings need revisiting later.
3. **Compress for upload to a practical budget** (target under 500KB) using a method that preserves EXIF metadata — some compression libraries strip EXIF by default, which would silently lose the geo-tag; verify metadata survives the specific compression path used.
4. **Timestamp verification against device clock drift.** If the device clock is significantly out of sync with server time at the next successful connection, flag the report's timestamp as `unverified` rather than presenting it as authoritative — this matters for incident reports used in official decision-making.
5. **Multiple photos per report** should each be independently geo-tagged (an officer may move between shots), not inherit a single report-level location.

## Examples
**Input:** "Reports are showing photos with no GPS data occasionally."
**Action:** Check whether the compression step being used strips EXIF — this is the most common cause — and switch to a compression path that preserves it, or re-embed metadata after compression as a fallback.

**Input:** "Can we reduce upload size further for really poor connectivity areas?"
**Action:** Lower the compression target but verify EXIF survival at the new setting before shipping — don't just lower the quality parameter and assume geo-tagging still works.

## Constraints
- Never compress the only stored copy of a photo — keep a full-resolution original locally until sync confirms.
- Never let compression silently strip GPS/timestamp EXIF data.
- Never present a report's timestamp as authoritative without checking for significant device clock drift.
- Never attach location as a report-level field only when multiple photos in one report could have different locations.
