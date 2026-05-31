# ADR 0001: Use Weekend-Demo Architecture

## Status

Accepted

## Context

Marit must be buildable and deployable as a useful demo in a weekend. The first goal is to demonstrate the workflow, not production readiness.

## Decision

Start with a static-first Next.js app using mock data and deterministic AI evaluation. Defer Azure Functions, Cosmos DB serverless, Entra authentication, Bicep, Application Insights, and real Azure OpenAI integration until a task explicitly asks for them.

## Consequences

- The first build is cheaper and faster.
- Demo behavior can be deterministic.
- The app should keep simple boundaries so real services can be added later without over-building the demo.
- Some production concerns are documented rather than implemented.
