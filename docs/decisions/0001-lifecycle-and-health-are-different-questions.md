# ADR 0001: Lifecycle state and health state are different questions, and lifecycle failure wins

- **Status:** Accepted
- **Date:** 2026-08-15
- **Decision owners:** M.A.R.K. II architecture
- **Retroactive:** migrated from `ARCHITECTURE.md`, where it was correct but filed
  under shape rather than reasoning.

## Context

A component registry has to answer "is this component all right", and there are two
different facts behind that question:

- **What the runtime did with the component** — was it registered, started, did
  starting fail, was it stopped.
- **What the component reports about its own service condition** — healthy,
  degraded, unhealthy.

Collapsing them into one status is the obvious simplification and it produces a
specific, misleading result: a component that started successfully reads as healthy
because it is running. Lifecycle progress gets mistaken for service health, and the
registry reports a system that is fine while a component inside it cannot do its
job.

The reverse error also exists. A component that failed to start cannot report
health at all, and treating its silence as unknown-but-probably-fine hides a hard
failure behind a soft one.

## Decision

**Two state models, kept separate.**

| Model | Values | Owner |
| --- | --- | --- |
| Lifecycle | `registered`, `running`, `failed`, `stopped` | The registry |
| Health | `healthy`, `degraded`, `unhealthy` | The component, via `health()` |

**Aggregation gives a failed lifecycle state precedence.** Otherwise it uses the
component-reported health state. A component that never started is unhealthy
regardless of what it would have said.

**Identity comes from configuration or package metadata.** No contract embeds a
product-specific name, so the runtime can host a differently-named assistant
without a code change.

**Phase 0 stays foreground-only** and provides configuration, structured logs, an
in-process event bus, a component registry, a local API, health reporting, and
tests. Model, voice, memory, device, satellite, and automation concerns stay
outside it.

## Rejected alternatives

### One status enum covering both

Rejected. `running` would satisfy a health check, so a started-but-broken component
reports as fine. That is the exact failure the split prevents.

### Let each component report its own lifecycle state

Rejected. Lifecycle is what the runtime did, and a component reporting it can
disagree with the registry that performed the action. One owner, one answer.

### Treat a failed component's absent health as `degraded`

Rejected. It softens a hard failure. Failing to start is not partial service.

### Let health aggregation weight components by importance

Rejected for Phase 0. Importance is deployment-specific and would put a policy
decision inside the registry before any deployment exists to inform it.

## Consequences

### Positive

- A started-but-broken component cannot report as healthy.
- Lifecycle and health can be queried and reasoned about independently.
- Renaming the assistant requires no change here.

### Costs

- Consumers must understand two state models rather than one.
- A component that is degraded but running needs both facts to be interpreted
  correctly.

## Enforced in

- `ARCHITECTURE.md`

## Explicit non-decisions

This ADR does not define what any component considers `degraded`, does not decide
restart policy for a failed component, does not authorize background or service
operation, and does not fix the local API's shape.
