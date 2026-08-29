---
name: disruption-model-drift-checker
description: Use this skill when the user asks to periodically re-check the deployed disruption prediction model's accuracy over time, or investigate why prediction quality seems to have degraded.
---

# Disruption Model Drift Checker

## Goal
Catch gradual accuracy degradation in the deployed risk model before it silently erodes trust in the alert system, by periodically re-evaluating it against fresh ground truth and comparing against the 80% accuracy target.

## Instructions
1. **Re-evaluate on a fixed cadence** (e.g., weekly) using the most recent period's actual outcomes (did a flagged segment actually experience disruption, did an unflagged segment not) as ground truth, sourced from field reports and confirmed incidents.
2. **Compare against the original validation performance**, not just an absolute threshold — a drop from 85% to 81% is a meaningful trend even though 81% might still nominally clear an 80% bar.
3. **Segment the drift check by region/season** where possible — monsoon-season accuracy may genuinely differ from dry-season accuracy, and conflating them can mask a real seasonal weakness in the model.
4. **Distinguish data drift from concept drift.** Check whether the input feature distributions have shifted (e.g., a new data source, a sensor recalibration) before assuming the underlying relationship between features and disruption risk has changed.
5. **Trigger retraining recommendation, not automatic retraining**, when drift crosses a defined threshold — a human should review why before triggering `ensemble-trainer` again, since blind auto-retraining on drifted or biased recent data can compound problems.

## Examples
**Input:** "Run the weekly drift check."
**Action:** Pull the past week's confirmed incidents and non-incidents, evaluate the currently deployed model against them, report accuracy/precision/recall compared to the original validation numbers and the prior week's drift check, and flag if the drop exceeds the defined threshold.

**Input:** "Accuracy dropped noticeably this month, why?"
**Action:** Check feature distributions for the affected period first (e.g., did a data source go down, causing more `stale` flagged inputs) before assuming the model itself needs retraining — a data pipeline issue is a common false cause of apparent "model drift."

## Constraints
- Never treat a single below-threshold reading as automatic grounds for retraining without investigating cause first.
- Never compare drift check results only against an absolute floor without also tracking trend against original validation performance.
- Never conflate seasonal performance differences with genuine drift without explicitly checking for a seasonal pattern.
- Never trigger retraining automatically without human review of the drift cause.
