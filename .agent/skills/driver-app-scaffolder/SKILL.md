---
name: driver-app-scaffolder
description: Use this skill when the user asks to build or modify the driver/transporter Android app — live route display, reroute alerts, or delivery status updates. Distinct from the field officer app.
---

# Driver/Transporter App Scaffolder

## Goal
Build a lightweight Android app for drivers that shows their current route, updates instantly when the platform reroutes them mid-trip, and lets them log delivery status with minimal interaction while driving — without the offline-first/photo-capture complexity the field officer app needs.

## Instructions
1. **Stream GPS at a battery-conscious interval** (e.g., every 10–15 seconds), not continuously — this is a live-tracking feed to the Vehicle Service, not a black-box recorder, and draining a driver's phone battery on a long NER route defeats the purpose.
2. **Subscribe to push notifications scoped to this vehicle/driver only.** Never receive or process alerts meant for other vehicles or districts — the backend should filter at the source, not send everything and let the app discard.
3. **Update the displayed route live when a reroute event arrives**, without requiring an app restart, and show an explicit "route updated" banner — a silently changed route with no indicator is dangerous, since the driver may not notice until it's too late to react smoothly.
4. **Delivery status via large single-tap buttons** (picked up / in-transit / delayed / delivered) — never require typed input or multi-step forms for status updates; this is a safety consideration for someone possibly driving.
5. **Cache the current route locally** so a brief network drop doesn't blank the screen — this is a lightweight cache for continuity, not the full offline-first local database the field app needs.
6. **Don't assume push notifications are guaranteed.** Critical alerts (reroute due to a blocked segment) should also go out via the `sms-fallback-notifier` channel in parallel — the app doesn't implement SMS itself, but shouldn't be built as if push is the only delivery path.

## Examples
**Input:** "Add a hazardous cargo indicator to the driver app."
**Action:** Show it clearly in the route header, and restrict which route options are ever pushed to this driver (hazardous-cargo route restrictions should already be enforced upstream by the route optimizer, not re-implemented here).

**Input:** "A driver said the app showed the old route even after a reroute happened."
**Action:** Check whether the reroute push was received while the app was backgrounded and failed to refresh the displayed route on foreground resume — this is the most common cause, and the fix is to always re-fetch current route state on app foreground, not just rely on push payload alone.

## Constraints
- Never poll GPS at a frequency that meaningfully drains battery on a multi-hour route.
- Never silently update the displayed route without a visible "route updated" indicator.
- Never require typed/multi-step input for delivery status updates.
- Never assume push notification delivery is guaranteed for critical alerts — pair with the SMS fallback channel.
