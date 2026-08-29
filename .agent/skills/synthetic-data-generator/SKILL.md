---
name: synthetic-data-generator
description: Use this skill when the user asks to generate synthetic or supplementary training data for the disruption model because real NER landslide/flood data is limited, or mentions the ISRO Landslide Atlas as a baseline.
---

# Synthetic Data Generator

## Goal
Produce clearly-labeled synthetic training samples that plausibly extend the real ISRO Landslide Atlas and field-report data, without ever letting synthetic rows masquerade as real observations downstream.

## Instructions
1. **Start from real distributions, not invented ranges.** Fit distributions for rainfall intensity, slope, soil moisture, etc. from the real ISRO Landslide Atlas and available field data, then sample new synthetic feature combinations from those fitted distributions — don't hand-pick arbitrary values.
2. **Preserve realistic correlations.** Rainfall and soil moisture are correlated; slope and historical incident rate are correlated. Sample jointly (e.g., via a fitted multivariate model or bootstrapping real rows with noise) rather than independently per column, which would produce physically implausible combinations.
3. **Tag every synthetic row** with `source=synthetic` and a generation timestamp/method, in a column that survives every downstream join.
4. **Cap the synthetic-to-real ratio** in any training set (e.g., flag if synthetic rows exceed 50% of the training set) and require this to be reported alongside any model trained on it.
5. **Never use synthetic data in the validation or test split.** Synthetic samples in eval data will overstate model performance since they're generated from the same distributional assumptions the model may just be recovering.

## Examples
**Input:** "We only have 200 real landslide events, generate more for training."
**Action:** Fit distributions from the 200 real events, sample new feature rows preserving correlations, tag them `source=synthetic`, and report the final synthetic:real ratio in the training set — keep validation/test 100% real.

**Input:** "The model looks great on validation, ship it."
**Action:** Confirm validation set is 100% real data before agreeing — if any synthetic rows leaked into validation, the reported accuracy isn't trustworthy.

## Constraints
- Never place synthetic rows in validation or test splits.
- Never generate synthetic features independently per column without preserving real correlations.
- Never omit the `source=synthetic` tag on any generated row.
- Never let synthetic data exceed 50% of a training set without explicitly flagging it to whoever reviews the resulting model.
