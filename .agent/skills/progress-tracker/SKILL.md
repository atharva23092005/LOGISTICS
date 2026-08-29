---
name: progress-tracker
description: Use this skill when the user asks for a status check on the project, wants to know which functional requirements (FR-1 through FR-10) are actually implemented, or is preparing for a milestone/demo checkpoint.
---

# Progress Tracker

## Goal
Give an honest, evidence-based status of which functional requirements from the original spec (FR-1 through FR-10) are actually working end-to-end, versus scaffolded, versus not started — so gaps surface early rather than at demo rehearsal.

## Instructions
1. **Maintain a status table** mapping each FR (and key NFRs) to a status: `not started`, `scaffolded`, `working in isolation`, `working end-to-end`, `tested`. Don't collapse these into a single "done/not done" — "working in isolation" and "tested end-to-end" are very different states for a demo.
2. **Require evidence for "working end-to-end"** claims — a passing test, a successful manual walkthrough, or a demo recording, not just "the code is written."
3. **Cross-check against the demo script.** Any feature the `sih-demo-scriptwriter` skill has scripted must be at least "working end-to-end" — flag mismatches immediately rather than letting them surface during rehearsal.
4. **Track blockers explicitly**, not just status — if FR-3 (route optimization) is stuck because of an OR-Tools configuration issue, note the specific blocker so it can be routed to the right person.
5. **Report trend, not just snapshot** — flag if a requirement has been stuck in the same status across multiple check-ins, since that's a signal it needs attention or descoping before the deadline.

## Examples
**Input:** "Status check before we lock the demo script."
**Action:** Produce the full FR/NFR status table with evidence for each "working end-to-end" claim, explicitly cross-check against what the demo script currently assumes, and flag any scripted feature that isn't actually at that status yet.

**Input:** "Is field reporting done?"
**Action:** Don't just say yes/no — report which specific pieces (local capture, background sync, offline maps, multilingual UI) are at which status, since "field reporting" bundles several FRs/features that may be at different maturity levels.

## Constraints
- Never mark something "working end-to-end" without citing the evidence (test result, walkthrough, recording).
- Never let a status report omit known blockers in favor of an optimistic summary.
- Never let the demo script assume a status higher than what this tracker has verified.
- Never present a single-point-in-time snapshot without noting anything stuck across multiple check-ins.
