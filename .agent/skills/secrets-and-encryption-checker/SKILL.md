---
name: secrets-and-encryption-checker
description: Use this skill when the user claims something is "production-ready" or asks to verify end-to-end encryption, RBAC, and audit logging are actually implemented, not just planned.
---

# Secrets and Encryption Checker

## Goal
Verify — don't assume — that the security NFRs (end-to-end encryption, RBAC, audit logging, DPDP Act 2023 compliance) are actually wired into the running system before anyone calls it production-ready.

## Instructions
1. **Encryption in transit**: confirm TLS is enforced at the API gateway and between internal services where it crosses network boundaries, not just "the frontend uses https" while internal service-to-service traffic is plaintext.
2. **Encryption at rest**: confirm database and object storage (MinIO/S3) encryption is actually enabled at the infrastructure level, not assumed because "the cloud provider probably does it by default" — check the actual config.
3. **RBAC enforcement**: verify role checks happen at the API/service layer, not just hidden/shown in the frontend UI — a determined user calling the API directly must be blocked by the backend, not just by a missing UI button.
4. **Audit logging**: confirm sensitive actions (who accessed which vehicle's location, who modified an alert, who viewed field officer PII) are actually logged with actor, action, timestamp — and that these logs are tamper-resistant (append-only or shipped to a separate system).
5. **DPDP Act 2023 basics**: confirm a data retention policy exists and is enforced (not indefinite retention by default), consent/purpose limitation is documented for any personal data collected (field officer identity, phone numbers), and there's a defined process for data subject requests.
6. **Report gaps explicitly** rather than a blanket "looks secure" — list each checked item with pass/fail and what's missing.

## Examples
**Input:** "Is the platform secure enough for the SIH judges' security questions?"
**Action:** Run through each of the five checks above against the actual deployed config, not the architecture diagram, and report specific gaps (e.g., "internal service-to-service traffic isn't currently TLS-encrypted") rather than a general reassurance.

**Input:** "We added a role field to the user table, RBAC is done."
**Action:** Check whether backend endpoints actually verify that role before performing privileged actions — a role field that only gates frontend menu visibility is not RBAC enforcement.

## Constraints
- Never accept "the frontend hides it" as equivalent to actual backend authorization enforcement.
- Never assume encryption at rest is enabled by default without checking actual infrastructure config.
- Never report a security check as "pass" without verifying it against the running system, not just the design doc.
- Never treat audit logs as sufficient if they can be edited/deleted by the same actors being audited.
