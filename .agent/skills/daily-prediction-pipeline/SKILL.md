---
name: daily-prediction-pipeline
description: Use this skill when the user asks about daily predictions, automating daily risk-score updates, or how often the disruption model should be retrained versus just re-run on fresh data.
---

# Daily Prediction Pipeline

## Goal
Formalize the split between a daily automated feature-refresh-and-inference job (using the currently validated model, no training involved) and a periodic, evidence-gated retraining cycle — so "accurate daily predictions" never gets confused with "retrain the model every day," which would introduce instability on thin real-world data.

## Instructions
1. **Daily job (scheduled — GitHub Actions cron or a Kubernetes CronJob, not a notebook):**
   - Pull the latest rainfall/weather forecast and refresh features for every active segment (via `landslide-feature-engineer`'s refresh logic).
   - Run inference using the **currently active, already-validated** model — no training step occurs in this job at all.
   - Write updated risk scores to the database for the alert system and dashboard to consume.
2. **Never let the daily job change which model is active.** It always calls a single "currently active model" pointer/registry entry. That pointer only ever changes through the gated retrain flow below — the daily job has no authority to swap models.
3. **Periodic retrain (default weekly, or triggered early by `disruption-model-drift-checker` crossing its threshold):**
   - Gather the period's new confirmed incidents.
   - Run `ensemble-trainer` with a proper time-based split.
   - Run `risk-score-validator` against the candidate model.
   - Only update the "currently active model" pointer if validation passes — a failed validation means the old model stays active, full stop.
4. **Log daily inference and periodic retraining as distinct event types.** Nobody should be able to look at a log and mistake "the pipeline ran today" for "the model was retrained today" — these need visibly different labels/dashboards.
5. **Manual override exists but never skips validation.** If a major confirmed event or new data source justifies an out-of-cycle retrain, the retrain still must pass `risk-score-validator` before it becomes the active model — urgency is not a reason to bypass the gate.

## Examples
**Input:** "Why do today's risk scores look different from yesterday's?"
**Action:** Check first whether it's because the input weather/feature data changed (expected — this is what the daily job is for) versus the underlying model itself changing (should only happen after a validated retrain) — these have very different implications and are worth distinguishing clearly in the answer.

**Input:** "There was a big landslide in the news, can we retrain right now?"
**Action:** Add the confirmed incident to the training data, then run the standard gated retrain-and-validate flow — don't skip straight to swapping in a hastily retrained model under time pressure.

## Constraints
- Never let the daily job perform any model training — it only refreshes features and runs inference against the existing validated model.
- Never let a retrained model become active without passing `risk-score-validator`.
- Never make daily-inference and periodic-retrain runs indistinguishable in logs or dashboards.
- Never let a manual override bypass the validation gate, regardless of urgency.
