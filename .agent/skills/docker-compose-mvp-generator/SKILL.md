---
name: docker-compose-mvp-generator
description: Use this skill when the user asks to set up, update, or debug the local Docker Compose stack for running the Phase-1 MVP (Postgres+PostGIS, Redis, FastAPI, React) locally.
---

# Docker Compose MVP Generator

## Goal
Provide a single `docker-compose up` command that reliably brings up the full MVP stack locally, matching what production will eventually run closely enough that "works in Compose" is a meaningful signal.

## Instructions
1. **Pin all image versions explicitly** (e.g., `postgis/postgis:16-3.4`, not `latest`) — an untagged `latest` pull can silently change behavior between team members' machines on different days.
2. **Health checks on every service**, and use `depends_on` with `condition: service_healthy` so, e.g., the backend doesn't start accepting traffic before Postgres is actually ready — not just "container started."
3. **Environment via `.env` file**, checked into the repo as `.env.example` with dummy values, real `.env` gitignored — never commit real credentials even for local dev.
4. **Volume-mount source code** for backend/frontend services in dev mode so changes reflect without a full rebuild, but keep this separate from a production-equivalent Dockerfile build path used for actual deployment testing.
5. **Seed data script** included and idempotent — running it twice shouldn't duplicate sample districts/vehicles, since demo rehearsal will run this repeatedly.

## Examples
**Input:** "New teammate can't get the stack running locally."
**Action:** Check first whether they copied `.env.example` to `.env` and whether their Docker has enough allocated memory for Postgres+PostGIS+Kafka running together — this is the most common local setup failure.

**Input:** "Add Kafka to the local Compose stack for Phase 2."
**Action:** Pin its image version, add a health check, wire `depends_on` correctly for the stream-processor service that needs it ready first, and update `.env.example` with any new required variables.

## Constraints
- Never use `latest` or untagged images in the Compose file.
- Never commit real credentials, even for local development — always via `.env` (gitignored) with a checked-in `.env.example`.
- Never let a dependent service start before its `depends_on` health check passes.
- Never ship a seed script that isn't safe to run multiple times.
