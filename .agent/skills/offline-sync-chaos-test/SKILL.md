---
name: offline-sync-chaos-test
description: Use this skill when the user asks to test the mobile app's resilience to network drops, flaky connectivity, or verify the offline sync success rate target.
---

# Offline Sync Chaos Test

## Goal
Verify the field-reporting app's offline sync actually meets the >95% sync-success NFR under realistic flaky-connectivity conditions, not just in a clean always-online test environment.

## Instructions
1. **Simulate realistic NER connectivity patterns**: brief connectivity windows followed by extended offline periods, not just a single clean online/offline toggle — this is closer to real field conditions than a simple binary test.
2. **Test mid-upload connection drops specifically** — kill connectivity partway through a photo/report upload and verify the report correctly stays `pending` (not `synced`, not silently lost) and retries on next connectivity window.
3. **Test rapid connectivity flapping** (connect/disconnect every few seconds) to check the background sync service doesn't spawn duplicate upload attempts for the same report or get stuck in a bad retry state.
4. **Measure actual sync success rate** across a batch of simulated reports under these chaotic conditions and compare against the >95% target — report the number, don't just confirm "it seems to work."
5. **Verify no data loss under app kill/restart** during a pending sync — the local database state must survive the app process being killed mid-sync, not just mid-network-drop.
6. **Log every failure mode found** with enough detail (which stage failed, how many retries occurred) to hand directly to whoever owns `offline-first-sync-scaffolder` for a fix.

## Examples
**Input:** "Run the chaos test suite before the SIH demo."
**Action:** Run all scenarios above (mid-upload drop, rapid flapping, app-kill-mid-sync), report the measured success rate against the >95% target, and list any specific failure modes found rather than a pass/fail summary alone.

**Input:** "A report went missing during testing, was that expected?"
**Action:** Investigate the actual failure mode — check whether it was marked `synced` prematurely before server confirmation (a sync-scaffolder bug) versus a genuine test artifact — don't assume "missing" data is expected chaos-test noise without checking.

## Constraints
- Never report a sync success rate without testing mid-upload connection drops specifically, since that's the highest-risk failure mode.
- Never treat a single clean online/offline toggle as sufficient — test flapping connectivity too.
- Never accept "it seems to work" without a measured success rate number against the >95% target.
- Never skip the app-kill-mid-sync scenario — process death is a common real-world cause of data loss distinct from network issues alone.
