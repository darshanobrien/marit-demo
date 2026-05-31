# ADR 0002: Defer Real Authentication

## Status

Accepted

## Context

The demo should show role-aware behavior for Business Users and AI Builders. Admin is a deferred role. Real authentication would add setup, cost, and integration complexity before it is needed for the weekend demo.

## Decision

Do not implement real authentication on day one. Simulate roles with a role switcher or seeded demo users. Document future authorization expectations, including eventual Microsoft Entra ID.

## Consequences

- The demo can show role-specific flows quickly.
- No real user identity should be trusted in the prototype.
- Production work must later replace the simulator with real identity and authorization, likely using Microsoft Entra ID.
- Any role-gated UI in the demo is for experience only, not security.
