---
name: architecture-decision-log
description: Use this skill when the user makes or changes a significant technology/architecture choice (e.g., picking OR-Tools over a custom solver, choosing PostGIS over a NoSQL alternative) and wants it recorded.
---

# Architecture Decision Log

## Goal
Keep a lightweight, append-only record of why each significant architecture choice was made, so the team (and judges, if asked) can explain rationale rather than just describe what was built.

## Instructions
1. **One ADR file per decision** in `docs/adr/NNNN-short-title.md`, numbered sequentially, never edited after acceptance — a changed decision gets a new ADR that supersedes the old one, with a link back.
2. **Standard format**: Context (what problem prompted the decision), Decision (what was chosen), Alternatives Considered (at least one, with why it was rejected), Consequences (trade-offs accepted).
3. **Write it at decision time, not retroactively** before a deadline — retroactive ADRs tend to rationalize rather than honestly capture trade-offs that were actually weighed.
4. **Link related decisions.** If a decision affects or is affected by another ADR (e.g., choosing Kafka affects the vehicle-tracking data flow ADR), cross-reference explicitly.
5. **Keep it short.** A good ADR is often under a page — this is a decision record, not a design document.

## Examples
**Input:** "We decided to use Leaflet.js instead of MapLibre GL for the MVP, log it."
**Action:** Create `docs/adr/0003-mvp-map-library.md` with Context (need open-source maps fast for MVP), Decision (Leaflet.js for now), Alternatives (MapLibre GL — rejected for MVP due to more setup complexity, noted as a planned Phase 3 upgrade per the existing plan), Consequences (may need migration work later, tracked).

**Input:** "Why did we choose OR-Tools over writing a custom VRP solver?"
**Action:** Point to the relevant existing ADR rather than re-explaining from memory — if none exists yet, create one now capturing the reasoning while it's still fresh and accurate.

## Constraints
- Never edit an accepted ADR's Decision or Consequences after the fact — supersede it with a new one instead.
- Never write an ADR that skips Alternatives Considered — a decision record without rejected alternatives isn't useful for judging why.
- Never let an ADR run long enough to become a design document — keep it to the decision and its rationale.
