---
name: public-portal-scaffolder
description: Use this skill when the user asks to build or modify the anonymous, read-only public-facing road status page for general citizens.
---

# Public Citizen Portal Scaffolder

## Goal
Build a lightweight, anonymous, read-only web page showing district-wise road accessibility for the general public, reusing the Operations Dashboard's map components without ever exposing operational or personal data.

## Instructions
1. **Read-only, aggregated data only.** Show district/segment-level accessibility color coding and simple status text — never live vehicle positions, never incident-report details, never any field officer identity. This is a privacy and operational-security boundary, not just a UI simplification.
2. **Use a separate, deliberately limited API contract**, not the authenticated Operations Dashboard endpoints with a "public mode" flag — a shared endpoint with a visibility toggle is one misconfiguration away from leaking authenticated data to the public route.
3. **No login required, ever.** This portal exists specifically so residents can check road status without an account.
4. **Cache aggressively.** All anonymous visitors see the same data at a given moment, so this is a strong candidate for short-TTL caching or static regeneration rather than hitting the backend per visitor — public traffic can spike unpredictably around a real local event.
5. **Multilingual by default**, with the general public as the primary audience — arguably more important here than on the operations dashboard, since this is the surface most likely to be used directly by NER residents rather than trained government staff.
6. **Hold this page to a stricter performance budget** than the operations dashboard — public users may be on lower-end devices and connections than government-issued equipment.

## Examples
**Input:** "Add a public status page for residents."
**Action:** Scaffold a new anonymous route with its own minimal API returning only district/segment-level status, no PII or vehicle data, cached aggressively, and available in all required languages by default.

**Input:** "Can we show which field officer reported an incident on the public page?"
**Action:** No — this is exactly the kind of data leak this skill exists to prevent. Officer identity and report details stay on the authenticated Operations Dashboard only.

## Constraints
- Never expose live vehicle positions, officer identities, or incident report/photo details on the public portal.
- Never reuse an authenticated API endpoint with a public-mode flag — use a separate, intentionally minimal endpoint.
- Never require login on this surface.
- Never skip caching, given unpredictable anonymous traffic spikes.
