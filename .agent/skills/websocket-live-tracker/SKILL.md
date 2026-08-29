---
name: websocket-live-tracker
description: Use this skill when the user asks to build or debug the WebSocket connection feeding live vehicle positions to the dashboard.
---

# WebSocket Live Tracker

## Goal
Maintain a reliable WebSocket subscription for live vehicle position updates that reconnects cleanly, never leaks connections, and degrades gracefully rather than silently going stale.

## Instructions
1. **Clean up on unmount.** Every component subscribing to the WebSocket must close its subscription (not just the raw socket, if using a shared connection) when unmounted — leaked subscriptions accumulate and cause duplicate/ghost updates over a long dashboard session.
2. **Reconnect with backoff**, and show a visible "reconnecting" state in the UI rather than silently showing stale positions as if they were live.
3. **Heartbeat/staleness detection.** If no message arrives for longer than the expected update interval, mark displayed vehicle positions as potentially stale (e.g., grey out or timestamp badge) rather than leaving them looking current indefinitely.
4. **Single shared connection per browser tab**, not one WebSocket per component — multiple components should subscribe to a shared connection manager, especially given potentially thousands of concurrent dashboard users (NFR-1).
5. **Server-side fan-out**, not per-client filtering logic duplicated on the frontend — if a user only needs vehicles in one district, that filter should ideally happen server-side to avoid shipping all 5,000+ vehicle updates to every client.

## Examples
**Input:** "The dashboard shows vehicles in the wrong position sometimes after switching districts."
**Action:** Check first whether old subscriptions are being properly torn down when the district filter changes — a stale subscription still pushing old-district updates into the same rendering state is the likely cause.

**Input:** "Add a 'last updated' indicator per vehicle marker."
**Action:** Use the heartbeat/staleness tracking from the connection manager rather than each marker component independently tracking its own timestamp state.

## Constraints
- Never leave a WebSocket subscription open after its owning component unmounts.
- Never show a vehicle position as "live" past a defined staleness window without indicating it might be stale.
- Never open a new WebSocket connection per component when a shared connection manager should be used.
- Never duplicate per-district filtering logic on the client when it can be done server-side at lower bandwidth cost.
