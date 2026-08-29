---
name: rbac-dashboard-view-scaffolder
description: Use this skill when the user asks to build or modify role-gated views within the Operations Dashboard (dispatcher, district admin, senior official/analytics) or asks how one dashboard should serve multiple roles.
---

# RBAC Dashboard View Scaffolder

## Goal
Build the Operations Dashboard as a single web app with three role-gated views sharing one map/alert component base, rather than three separate near-duplicate dashboards — while ensuring the frontend gating is never treated as the actual security boundary.

## Instructions
1. **Role comes from the authenticated session/token**, verified server-side — the frontend reads the role claim to decide what to render, but must never be the only thing standing between a role and data it shouldn't see.
2. **Never fetch-then-hide.** If the district admin shouldn't see other districts' data, the API must scope the response server-side to their assigned district(s) — filtering it out only in the frontend means the data already left the server.
3. **Define view configs per role as data**, not three duplicated component trees:
   - **Dispatcher**: full map, all vehicles, route planner, manual reroute controls, alert acknowledgment.
   - **District admin**: their district-scoped map, connectivity status, incident-report verification queue.
   - **Senior official**: read-only analytics — disruption trends, cost/delay metrics — no map action controls at all.
4. **Shared components take a `capabilities` prop** controlling which action buttons/controls render, so the map, alert feed, and district card components are maintained once, not copied three times with slight variations that inevitably drift out of sync.
5. **Mark read-only views as visibly read-only in the UI** (no action buttons shown at all, not just disabled ones) — this is a UX clarity measure, not a security measure; the actual enforcement is the backend role check.

## Examples
**Input:** "Add a manual reroute button to the dashboard."
**Action:** Gate it behind the dispatcher capability in the view config, and confirm the backend endpoint independently rejects the reroute action for non-dispatcher roles — don't rely on the button being hidden as the only protection.

**Input:** "A district admin says they can see another district's incident reports."
**Action:** Check whether the API returns all districts' reports and the frontend filters client-side for display — that's the bug. The fix is server-side scoping to the admin's assigned district(s), not a tighter frontend filter.

## Constraints
- Never fetch data for a role/district that shouldn't have access and filter it client-side.
- Never build three separate copies of the map/alert components per role — use one component set gated by a capabilities/config prop.
- Never treat frontend role-gating as sufficient security on its own.
- Never render action controls (even disabled ones) in a role's view that should have no operational actions at all.
