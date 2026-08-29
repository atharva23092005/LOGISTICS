---
name: route-optimizer-scaffolder
description: Use this skill when the user asks to build, modify, or debug the route optimization engine, mentions OR-Tools, VRP solver, alternate routing, ETA calculation, or rerouting around blocked roads.
---

# Route Optimizer Scaffolder

## Goal
Scaffold and maintain the vehicle routing engine that takes origin-destination pairs plus real-world constraints and returns an optimized route with ETA and alternates, using Google OR-Tools as the primary solver with an A* fallback when OR-Tools can't find a feasible solution in time.

## Instructions

1. **Model the problem as a constrained VRP, not a plain shortest-path.**
   - Required inputs: origin, destination, vehicle type/capacity, cargo type (perishable/fragile/hazardous), time windows, current road accessibility status, and predicted disruption risk scores per segment (from the `ensemble-trainer` output).
   - Treat any road segment with a risk score above the alert threshold (0.7) as either removed from the graph or heavily penalized — the routing engine and the disruption model must stay in sync on this threshold, not use two different hardcoded values.

2. **Encode hard constraints as actual constraints, not post-hoc filters.**
   - Bridge load capacity vs. vehicle weight — infeasible edges should be removed from the graph before solving, not filtered from results after.
   - Driver rest periods — model as time-window constraints on route segments, not a note appended to the output.
   - Cargo type affects allowed routes (e.g., hazardous cargo may be barred from routes through populated town centers) — this must be a hard constraint, not a soft preference.

3. **Solve with OR-Tools first.**
   - Use the VRP solver with a reasonable time budget (e.g., 10–30s depending on graph size). Log solver status (`OPTIMAL`, `FEASIBLE`, `INFEASIBLE`, `TIMEOUT`).

4. **Fall back to A\* only when OR-Tools returns infeasible or times out.**
   - A* fallback uses dynamic edge weights derived from the same risk scores and accessibility data — don't let the fallback silently ignore constraints the primary solver enforced. If a hard constraint (e.g., bridge capacity) can't be respected in the fallback, surface that explicitly rather than returning a route that would fail in reality.

5. **Output format.**
   - Primary route + at least one alternate, each with: distance, estimated travel time, list of segments with individual risk scores, and a flag for any segment currently below full accessibility.
   - If the primary route becomes blocked mid-transit (a segment's status flips to blocked), the same engine should be callable to reroute from the vehicle's current position, not from the original origin.

6. **Validate before shipping.**
   - Run against the `vrp-regression-tester` skill's fixed test cases before merging any change to constraint logic — routing bugs are easy to introduce silently (e.g., forgetting a unit conversion between km and the solver's internal distance units).

## Examples

**Input:** "A landslide just blocked the primary route for vehicle #42, find an alternate."
**Action:** Re-solve using the vehicle's current GPS position as the new origin, mark the blocked segment as removed from the graph (not just penalized — it's physically impassable), and return an updated route with new ETA, not a diff against the old one.

**Input:** "Add a constraint that hazardous cargo can't route through district capitals."
**Action:** Add it as a hard edge-removal constraint keyed on cargo type, not a scoring penalty — a "penalty" can still be the cheapest available route if all alternatives are worse, which would violate the actual safety requirement.

## Constraints
- Never treat a hard constraint (bridge weight limit, hazardous-cargo routing ban) as a soft penalty that a bad-enough alternative can still violate.
- Never let the A* fallback silently drop a constraint the OR-Tools model was enforcing.
- Never hardcode the 0.7 risk threshold separately here and in the disruption model — reference a shared config value.
- Never return a route without ETA and at least one alternate when the graph has one available.
- Never solve from the original origin when rerouting a vehicle already in transit — always use current position.
