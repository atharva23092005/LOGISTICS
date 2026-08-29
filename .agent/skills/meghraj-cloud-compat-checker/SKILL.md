---
name: meghraj-cloud-compat-checker
description: Use this skill when the user asks whether a dependency, service, or architecture choice would be deployable on government cloud (MeghRaj) as an alternative to AWS/Azure/GCP.
---

# MeghRaj Cloud Compatibility Checker

## Goal
Flag any architecture or dependency choice that would be hard or impossible to run on India's government cloud (MeghRaj) early, so the platform isn't accidentally locked into a single hyperscaler if government deployment is a real requirement or judging criterion.

## Instructions
1. **Prefer open-source, self-hostable components** over managed hyperscaler-specific services where a reasonable open alternative exists (e.g., self-hosted PostgreSQL+PostGIS over a proprietary managed spatial DB, self-hosted Kafka over a fully managed equivalent) — this keeps the option open without necessarily giving up AWS/Azure/GCP for the actual prototype/demo.
2. **Avoid hard dependencies on hyperscaler-specific managed services** (e.g., a proprietary serverless function format, a cloud-specific ML training service) in the core architecture — these are the hardest to port later. Note them explicitly when used for convenience during prototyping, marked as "replace before government deployment" rather than left silent.
3. **Check container portability.** Standard Docker/Kubernetes workloads generally port reasonably across clouds including government cloud offerings — favor this over cloud-specific PaaS abstractions for anything core.
4. **Document data residency assumptions.** Since NER logistics and field-officer PII are involved, note where data is stored and confirm this aligns with any data residency expectations under DPDP Act 2023 and government deployment norms, rather than assuming any cloud region is fine.
5. **Flag, don't block, prototype-stage convenience choices** — using a hyperscaler's managed database for faster prototyping during SIH is reasonable; just track it as a known item to revisit for the deployment roadmap the judges will ask about.

## Examples
**Input:** "We're using AWS RDS for Postgres in the prototype, is that a problem?"
**Action:** Not a blocker for the prototype/demo stage — but note it as a tracked item ("uses AWS RDS; portable to self-hosted PostgreSQL+PostGIS for government cloud deployment") so it's ready to answer if judges ask about deployment flexibility.

**Input:** "Should we use a cloud-specific serverless function for the alert-triggering logic?"
**Action:** Prefer a standard containerized service instead, since serverless function formats are one of the harder things to port between clouds, and this is core logic rather than a throwaway prototype convenience.

## Constraints
- Never silently adopt a hyperscaler-specific managed service in core architecture without flagging it as a portability item.
- Never claim government-cloud readiness without actually checking container portability and data residency assumptions.
- Never block prototype-stage convenience choices outright — track them instead.
