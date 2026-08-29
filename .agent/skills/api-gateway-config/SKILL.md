---
name: api-gateway-config
description: Use this skill when the user asks to configure rate limiting, authentication, or routing rules at the API gateway (Kong/AWS API Gateway) layer.
---

# API Gateway Config

## Goal
Manage API gateway rate-limit, auth, and routing rules as versioned config files, not manual dashboard clicks, so changes are reviewable and reproducible across environments.

## Instructions
1. **Config as code.** Every gateway rule (route, rate limit, auth plugin) lives in a checked-in config file (Kong declarative config YAML, or equivalent for AWS API Gateway/Terraform) — no manual console edits that aren't reflected in the repo.
2. **Rate limits scoped per consumer type**, not a single global limit — field mobile apps, the web dashboard, and any external government-system integrations likely need different limits given NFR-1's 10,000+ concurrent user target.
3. **Auth enforced at the gateway**, not left to individual services to each re-implement — services behind the gateway can trust the gateway's auth headers but must not accept direct unauthenticated traffic if bypassable.
4. **Every new microservice route registered here** as part of its scaffolding checklist (pairs with `fastapi-service-scaffolder`) — a service isn't "done" until it's routable through the gateway with correct auth applied.
5. **Test rate-limit and auth rules in a staging config** before applying to production — a misconfigured rate limit can lock out real users identically to an attack.

## Examples
**Input:** "Add the new Notification Service to the gateway."
**Action:** Add its route to the declarative config with an appropriate rate limit tier and auth plugin, matching the pattern of existing services, and note it needs testing in staging before prod rollout.

**Input:** "Field officers are getting rate-limited during a mass incident-reporting event."
**Action:** Check the mobile-app consumer tier's rate limit against realistic burst behavior during emergencies (e.g., landslide triggers many simultaneous reports) — this may need a higher burst allowance specifically for the field-reporting route, not a global limit increase.

## Constraints
- Never make a gateway config change directly in a dashboard without committing the equivalent change to the config repo.
- Never apply a single global rate limit across fundamentally different consumer types.
- Never let a service accept unauthenticated direct traffic if the gateway is meant to be the sole entry point.
- Never push an untested rate-limit or auth change straight to production.
