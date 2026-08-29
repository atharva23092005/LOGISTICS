---
name: vrp-regression-tester
description: Use this skill when the user asks to test, validate, or review changes to the route optimization engine before merging.
---

# VRP Regression Tester

## Goal
Catch silent routing regressions before they ship, by running every change to the route optimizer against a fixed set of known-good test cases and diffing the output against expected results.

## Instructions
1. **Maintain a fixed golden test set**: a handful of representative origin-destination pairs with known constraints (vehicle type, cargo type, bridge limits, blocked segments) and their previously-validated "correct" optimal or near-optimal routes.
2. **Run the full test set on every change** to constraint logic, solver configuration, or the shared risk-threshold value — not just the specific case the change was intended to fix.
3. **Check hard constraints are actually respected** in the output, not just that a route was returned — e.g., programmatically verify no segment in the returned route exceeds the vehicle's weight relative to any bridge on that segment.
4. **Diff against the previous golden output**, not just check "a route exists." A route that's technically valid but meaningfully longer/slower than before likely indicates an unintended regression in scoring or weighting, even if it's not outright wrong.
5. **Include at least one infeasible case** in the test set (e.g., a request that should correctly return "no route available") to confirm the solver doesn't return a bogus "successful" route when none should exist.
6. **Block merge on any regression** in the golden set, unless the change explicitly intended to change that case's expected output (in which case update the golden expectation deliberately, not silently).

## Examples
**Input:** "I updated the hazardous cargo constraint, run the tests."
**Action:** Run the full golden set, specifically verify the hazardous-cargo test cases now correctly avoid restricted routes, and confirm no other unrelated test case's route changed unexpectedly.

**Input:** "The solver is returning a route through a bridge that should be excluded for heavy vehicles."
**Action:** Add this exact scenario as a new permanent golden test case once fixed, so this specific regression can never silently reappear.

## Constraints
- Never approve a routing engine change without running the full golden test set, even for "small" changes.
- Never accept a returned route without programmatically verifying hard constraints were actually respected.
- Never silently update a golden expected output — any change to expected results needs to be a deliberate, reviewed decision.
- Never omit at least one "should be infeasible" case from the test set.
