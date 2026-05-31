# ADR 0003: Start With Mock Data Before Database

## Status

Accepted

## Context

The first demo uses mock data only and does not need durable persistence. Adding a database early would increase cost and implementation scope.

## Decision

Start with mock JSON or in-memory data. Design data access behind a small boundary so Cosmos DB serverless can be added later if explicitly requested.

## Consequences

- The demo remains inexpensive and easy to reset.
- No migration or seeding infrastructure is needed initially.
- State may reset on refresh or redeploy depending on implementation.
- The data model should stay structured enough to avoid obvious rework later.
