---
name: kafka-topic-contract-checker
description: Use this skill when the user asks to add or modify a Kafka topic, event schema, or producer/consumer for vehicle tracking, alerts, or any streaming data in the platform.
---

# Kafka Topic Contract Checker

## Goal
Prevent silent breakage between producers and consumers on Kafka topics (especially vehicle-tracking GPS events) by enforcing an explicit, versioned schema contract instead of ad-hoc JSON.

## Instructions
1. **Every topic has a schema file** (e.g., Avro or JSON Schema) checked into `schemas/{topic-name}.json`, treated as the source of truth — producers and consumers both validate against it, not against each other's code.
2. **Schema changes are additive by default.** Adding an optional field is safe; renaming, removing, or changing the type of an existing field is a breaking change that requires a new topic version (e.g., `vehicle-position-v2`) rather than mutating the existing topic in place.
3. **Producers validate before publishing** — a malformed event should fail at the producer, not get published and break every consumer downstream.
4. **Consumers validate on read** and route schema-mismatched messages to a dead-letter topic rather than crashing the consumer process or silently dropping the message.
5. **Document the topic's key** (e.g., vehicle ID for partitioning) and confirm ordering guarantees needed — vehicle position updates for a single vehicle must stay ordered, which depends on consistent partitioning by vehicle ID.

## Examples
**Input:** "We need to add a 'fuel level' field to the vehicle position event."
**Action:** Add it as an optional field to the existing schema (additive, non-breaking), update the schema file, and confirm existing consumers still validate fine without the field present for older messages.

**Input:** "Rename 'lat'/'lon' to 'latitude'/'longitude' in the vehicle event."
**Action:** This is a breaking change — create `vehicle-position-v2` with the new field names, run producers/consumers on v2 in parallel with v1 during migration, don't rename fields in place on the live topic.

## Constraints
- Never publish an event that hasn't been validated against its schema.
- Never make a breaking schema change (rename/remove/retype a field) on an existing topic version in place.
- Never let a consumer crash or silently drop a malformed message — route to a dead-letter topic.
- Never change a topic's partitioning key without confirming downstream ordering assumptions still hold.
