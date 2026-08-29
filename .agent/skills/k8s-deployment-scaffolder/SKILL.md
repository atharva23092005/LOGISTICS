---
name: k8s-deployment-scaffolder
description: Use this skill when the user asks to generate or update Kubernetes manifests for deploying the platform's microservices beyond the local MVP stage.
---

# Kubernetes Deployment Scaffolder

## Goal
Generate Kubernetes manifests sized and configured to meet the platform's stated NFRs (10,000+ concurrent users, 5,000+ vehicles, 99.5% uptime) rather than generic defaults that happen to work for a demo but not at claimed scale.

## Instructions
1. **Set resource requests/limits deliberately**, based on actual observed usage from local/staging load tests — not copy-pasted defaults. Under-provisioned requests cause throttling that looks like random slowness; missing limits risk one service starving others on a node.
2. **Liveness vs. readiness probes distinctly** — readiness should reflect real dependency health (DB, Kafka reachable), liveness should only fail on genuine deadlock/crash, not transient dependency hiccups, or you'll get restart-loop cascades during a brief DB blip.
3. **HorizontalPodAutoscaler** on stateless services (API services, not the database) keyed on CPU or custom metrics (e.g., request queue depth) to actually meet the 10,000+ concurrent user NFR under variable load.
4. **PodDisruptionBudgets** on critical services so voluntary disruptions (node upgrades) don't take down all replicas of, say, the Alert Service simultaneously — relevant to the 99.5% uptime target.
5. **Secrets via Kubernetes Secrets or an external secrets manager**, never baked into container images or plain ConfigMaps for anything sensitive (pairs with `secrets-and-encryption-checker`).
6. **Namespace separation** for staging vs. production, with distinct resource quotas.

## Examples
**Input:** "Deploy the Alert Service to Kubernetes."
**Action:** Generate Deployment + Service + HPA + PDB manifests with resource requests based on its actual observed footprint, readiness probe checking its DB/Kafka dependencies, and confirm secrets are referenced via Kubernetes Secrets, not env vars with literal values.

**Input:** "We're getting restart loops during a brief database hiccup."
**Action:** Check whether liveness probes are checking downstream dependency health (they shouldn't) rather than just process health — a liveness probe that fails when the DB briefly hiccups will kill and restart otherwise-healthy pods, worsening the outage.

## Constraints
- Never copy generic resource request/limit defaults without basing them on observed load.
- Never make a liveness probe depend on downstream service health — that's readiness's job.
- Never bake secrets into container images or plaintext ConfigMaps.
- Never deploy a critical service without a PodDisruptionBudget if uptime targets depend on it surviving voluntary disruptions.
