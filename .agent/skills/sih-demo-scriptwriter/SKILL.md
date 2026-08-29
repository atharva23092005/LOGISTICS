---
name: sih-demo-scriptwriter
description: Use this skill when the user asks to draft, update, or rehearse the timed SIH demo script as new features are built or the presentation plan changes.
---

# SIH Demo Scriptwriter

## Goal
Keep a timed, accurate demo script in sync with what the platform can actually do, so the team never demos a feature that's half-built or forgets to showcase one that's ready.

## Instructions
1. **Anchor the script to the actual feature status**, cross-checked against `progress-tracker` output — never script a demo beat around a feature marked incomplete without flagging the risk explicitly to the team.
2. **Keep to the time budget** (opening 2 min, live demo 8 min, closing 2 min per the plan) — if new content is added, something else must be cut or tightened, not silently let the total run long.
3. **Write in spoken language, not slide bullet points** — the script should sound natural when read aloud, with explicit cues for who's speaking and who's driving the demo screen.
4. **Include fallback lines** for likely live-demo hiccups (e.g., "if the live weather API is slow, say: 'while that loads, let me show you...'") — live demos with real API calls (IMD, GPS) will occasionally lag, and the team should never stand in silence.
5. **Tie every feature shown back to a stated metric or pain point** from the problem statement (e.g., the 20%+ cost inflation figure, the >80% prediction accuracy target) — judges respond to demos that connect back to the original problem, not just feature tours.
6. **Version the script** alongside major feature milestones so rehearsal always uses the current version, not a stale draft.

## Examples
**Input:** "We just got the mobile field-reporting sync working end-to-end, update the script."
**Action:** Insert it into the Field Reporting demo beat with a spoken-language description tied to the "offline capability" pain point from the problem statement, check the total time budget still holds, and flag if something else needs trimming.

**Input:** "What if the live GPS tracking demo lags on stage?"
**Action:** Add an explicit fallback line to that beat's script (e.g., a pre-recorded backup clip cue) so the presenter has a rehearsed graceful recovery rather than improvising.

## Constraints
- Never script a demo beat for a feature not yet confirmed working by `progress-tracker`.
- Never let script edits silently push the total time over budget without flagging what needs to be cut.
- Never omit a fallback line for any demo beat relying on a live external API call.
- Never leave the script un-versioned relative to the feature set it assumes is working.
