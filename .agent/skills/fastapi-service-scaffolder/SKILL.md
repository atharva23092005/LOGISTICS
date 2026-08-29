---
name: fastapi-service-scaffolder
description: Use this skill when the user asks to create a new backend microservice (Route, Vehicle, Alert, Weather, GIS, User, Notification) or wants consistent structure across FastAPI services.
---

# FastAPI Service Scaffolder

## Goal
Generate a new microservice with a consistent, production-ready structure so every service in the platform (Route, Vehicle, Alert, Weather, GIS, User, Notification) looks and behaves the same way to anyone maintaining it.

## Instructions
1. **Standard structure for every service:**
   ```
   service-name/
     app/
       main.py          # FastAPI app, includes routers
       routers/          # one file per resource
       models/           # Pydantic schemas
       db/               # DB session, models
       config.py          # env-based settings
     tests/
     Dockerfile
     requirements.txt
   ```
2. **Every service gets a `/health` endpoint** returning status + dependency checks (DB reachable, etc.) — required for k8s liveness/readiness probes later.
3. **Config via environment variables**, validated at startup with Pydantic settings — fail fast on missing required config rather than failing on first request.
4. **OpenAPI docs enabled by default** at `/docs` — this is how frontend/mobile devs will discover the contract without asking backend devs directly.
5. **Input validation on every endpoint** via Pydantic models — never accept raw dicts for write endpoints, especially anything touching vehicle/location data.
6. **Structured logging** (JSON) from the start, not print statements — this matters once services run in containers and logs get aggregated.

## Examples
**Input:** "Create the Alert Service."
**Action:** Scaffold the full structure above, with routers for creating/listing/acknowledging alerts, a `/health` endpoint, Pydantic models for alert payloads, and Dockerfile — not just a single `main.py` with inline routes.

**Input:** "Add a new endpoint to Vehicle Service for reporting a stopped vehicle."
**Action:** Add it as a new router function with a Pydantic input model (vehicle ID, location, timestamp, reason), not a raw dict, and confirm it doesn't duplicate logic that belongs in the existing status-update endpoint.

## Constraints
- Never scaffold a service without a `/health` endpoint.
- Never accept unvalidated dict input on write endpoints.
- Never hardcode config values that should come from environment variables.
- Never skip structured logging in favor of print statements.
