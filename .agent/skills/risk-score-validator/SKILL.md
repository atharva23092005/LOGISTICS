---
name: risk-score-validator
description: Use this skill when the user asks to sanity-check, validate, or review the disruption risk model's output before it's used to trigger alerts or feed the route optimizer.
---

# Risk Score Validator

## Goal
Catch broken or misleading risk scores before they trigger a false alert flood or a silently-wrong route decision, by validating model output against a fixed set of sanity checks every time a new model version is about to be used in serving.

## Instructions
1. **Range check.** Confirm every output is in [0, 1]. Anything outside indicates a bug in the ensemble combination step, not a modeling issue — stop and report rather than clipping silently.
2. **Class balance check.** Compare the proportion of segments flagged above the 0.7 alert threshold against historical baselines. A sudden 5x jump or drop signals a pipeline bug (e.g., a unit conversion error in a feature) far more often than a real risk shift.
3. **Precision/recall at threshold.** Report precision and recall specifically at 0.7, not just overall AUC — this is the number that determines how many false alerts field teams will see.
4. **Segment coverage check.** Confirm every active road segment has a score — missing segments should be reported as `no_prediction`, never silently excluded from downstream alerting as if they were "safe."
5. **Drift comparison.** Diff the new model's scores against the currently-deployed model's scores on the same feature snapshot; large unexplained divergence needs a human look before rollout.
6. **Block deployment** if any check fails, and report exactly which check and which segments triggered it — don't just say "validation failed."

## Examples
**Input:** "New model is ready, can we ship it?"
**Action:** Run all five checks against the current feature snapshot, report each result explicitly (pass/fail + numbers), and only give a go-ahead if all pass — including the drift comparison against the currently live model.

**Input:** "Why did segment X suddenly show risk 0.95 when yesterday it was 0.2?"
**Action:** Trace which upstream feature(s) changed for that segment between the two runs (via the feature manifest) before assuming the model is wrong — often it's a real rainfall spike, but confirm rather than assume either way.

## Constraints
- Never clip out-of-range scores silently — treat it as a pipeline bug and stop.
- Never let a segment with no prediction be treated as low-risk by default downstream.
- Never approve a model rollout based on AUC alone without checking precision/recall at the actual 0.7 operational threshold.
- Never skip the drift comparison against the previously deployed model.
