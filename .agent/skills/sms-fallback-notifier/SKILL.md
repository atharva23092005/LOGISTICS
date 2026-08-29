---
name: sms-fallback-notifier
description: Use this skill when the user asks to add, modify, or debug the SMS/USSD fallback alert channel for drivers or field officers with limited smartphone connectivity.
---

# SMS Fallback Notifier

## Goal
Ensure critical alerts (route blockages, high-risk warnings) reach drivers and field officers even when they have no app connectivity or only a basic phone, by treating SMS as an equal-priority channel rather than a last-resort afterthought.

## Instructions
1. **Send SMS in parallel with push/in-app notifications for critical alerts**, not sequentially after a push-delivery timeout — a delay here costs real minutes in an emergency, so don't wait to see if push "worked" before trying SMS.
2. **Use short, plain-language, actionable templates** stored and versioned in the Notification Service (e.g., "ALERT: NH-13 blocked near KM45. Reroute via NH-13A.") — never build SMS text ad hoc at each call site, which leads to inconsistent, harder-to-audit messaging.
3. **Respect the driver/officer's stored language preference** — the same locale field used by the app's i18n system should drive SMS language, not default to English regardless of who's receiving it.
4. **Use a gateway with real NER-region carrier coverage.** Flag explicitly if a chosen SMS provider has known poor coverage in the target districts — this defeats the entire purpose of a fallback channel.
5. **Log delivery status per message** (sent/delivered/failed) and treat repeated failures to the same number as a data-quality flag (wrong number, dead SIM) rather than silently retrying forever.
6. **Debounce and deduplicate.** If a segment's risk score flickers around the 0.7 threshold, don't re-send the same alert repeatedly — this is the same threshold-flicker problem the disruption model has to handle, and the notifier shouldn't amplify it into an SMS flood.

## Examples
**Input:** "A new critical alert just fired, does the SMS get sent?"
**Action:** Generate the templated message in the recipient's stored language preference, dispatch via the SMS gateway in parallel with the push notification (not after it), and log delivery status.

**Input:** "Drivers are getting the same reroute alert five times."
**Action:** Check the debounce logic against the risk score's recent history — this is almost certainly a threshold-flicker case where the score crossed 0.7 multiple times in quick succession without deduplication.

## Constraints
- Never rely on push notification delivery alone for a critical alert — always attempt SMS in parallel.
- Never construct SMS text inline at the call site instead of using a versioned template.
- Never default to English when a stored language preference exists.
- Never send repeated SMS for the same underlying alert condition without debouncing.
