---
name: dashboard-perf-budget
description: Use this skill when the user asks to check, enforce, or improve the web dashboard's load time or bundle size against the project's performance targets.
---

# Dashboard Performance Budget

## Goal
Keep the web dashboard's load time under the 3-second NFR by checking bundle size and load performance as a standing gate, not an afterthought before the demo.

## Instructions
1. **Track bundle size per build.** Run a bundle analyzer (e.g., `source-map-explorer` or Vite's built-in reporting) and compare against the previous build — flag any single dependency addition that grows the bundle by more than ~50KB gzipped without discussion.
2. **Lazy-load map tile libraries and heavy chart components** — these shouldn't be in the initial bundle if the user hasn't navigated to that view yet.
3. **Measure actual load time**, not just bundle size — use Lighthouse or equivalent against a realistic network throttle (NER's connectivity isn't uniformly fast, and it's a fair proxy for judges/users on modest connections too).
4. **Set the budget as a CI check**, not a manual pre-demo scramble — fail the build (or at least warn loudly) if the budget is exceeded.
5. **Prioritize what loads first.** The map shell and district overview should be interactive before secondary panels (analytics, historical charts) finish loading.

## Examples
**Input:** "We just added a new charting library for the analytics panel, is that okay?"
**Action:** Check its gzipped size impact and confirm it's lazy-loaded behind the analytics route rather than bundled into the initial dashboard load — the core map view shouldn't pay for a library it doesn't use.

**Input:** "Dashboard feels slow on the conference wifi during rehearsal."
**Action:** Run Lighthouse with network throttling matching typical conference wifi, identify the largest blocking resource, and check whether it's actually needed before first paint.

## Constraints
- Never add a new dependency to the initial bundle without checking its size impact.
- Never let a heavy component load before an interactive map shell that could load first.
- Never treat performance budget checks as a manual, pre-demo-only activity — it should run in CI on every build.
- Never measure only bundle size without also measuring actual load time under a realistic network condition.
