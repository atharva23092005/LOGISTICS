---
name: gis-dashboard-component-scaffolder
description: Use this skill when the user asks to build or modify React map components for the GIS dashboard, district color-coding, or accessibility status visualization.
---

# GIS Dashboard Component Scaffolder

## Goal
Generate consistent, performant React + MapLibre/Leaflet components for the accessibility dashboard so district status, road segments, and vehicle overlays render predictably and stay within the <3s load-time NFR.

## Instructions
1. **Layer separation.** Keep base map tiles, district boundaries, road-segment risk overlay, and live vehicle markers as separate map layers that can toggle independently — don't bake them into one monolithic render function.
2. **Color-code by data, not hardcoded values.** Green/yellow/red status should map from the actual risk score or accessibility status field, with named thresholds defined once (matching the 0.7 alert threshold used elsewhere) rather than re-derived per component.
3. **Debounce/throttle live updates.** Vehicle position updates arriving over WebSocket should batch-update the map (e.g., every 1-2s) rather than triggering a re-render per individual message, which will tank performance at NFR-1's scale (5,000+ vehicles).
4. **Lazy-load district detail data.** Don't fetch full connectivity details for every district upfront — fetch on click/hover for the district actually being inspected.
5. **Accessibility of the accessibility dashboard**: color alone shouldn't be the only signal for road status (colorblind users) — pair color with an icon or pattern.

## Examples
**Input:** "Add a layer showing predicted high-risk segments from the disruption model."
**Action:** Add it as its own toggleable layer, colored using the same threshold constants as the alert system, not a new hardcoded 0.7 value in the frontend.

**Input:** "The dashboard freezes when many vehicles are moving at once."
**Action:** Check whether vehicle marker updates are batched/throttled — if each WebSocket message triggers an individual React re-render, that's almost certainly the cause at scale.

## Constraints
- Never hardcode a risk/status threshold in the frontend separately from the backend's value — reference a shared constant or config endpoint.
- Never render live vehicle updates one-by-one without batching.
- Never rely on color alone to convey status.
- Never fetch full detail data for all districts before it's needed.
