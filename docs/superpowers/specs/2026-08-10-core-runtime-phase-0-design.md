# Core Runtime — Phase 0 Design

## Purpose and scope

Phase 0 delivers a foreground, headless runtime foundation. It provides lifecycle management, validated configuration, structured logs, typed in-process events, a component registry, health aggregation, a local HTTP API, and automated tests.

It does not include AI models, voice, tools beyond one example component, memory, Home Assistant, satellites, device control, or operating-system service management.

## Design constraints

- Implementation language: TypeScript on Node.js 22.
- The process runs in the foreground. External supervision is explicitly deferred.
- Runtime-facing contracts must not hardcode the repository or product name. Identity is supplied by configuration or package metadata.
- The system is optimized for agent consumers: structured, schema-stable, machine-readable inputs and outputs are the default.
- The runtime is model-independent.

## Architecture

`CoreRuntime` owns lifecycle. It loads configuration, initializes observability, creates the in-process `EventBus`, registers components, starts the local API, and coordinates graceful shutdown.

`EventBus` provides typed `publish`, `subscribe`, and `unsubscribe` operations. Event envelopes include `type`, `source`, `timestamp`, and optional correlation metadata. Initial event types cover core lifecycle and component registration or failure.

`ComponentRegistry` stores typed component metadata and lifecycle contracts. Required component startup failure aborts startup. Optional component startup failure is recorded and leaves the runtime running in a degraded state. Shutdown attempts every started component in reverse start order.

`HealthService` combines runtime and component health into `healthy`, `degraded`, or `unhealthy`. Each result identifies responsible subsystems and structured reasons.

`LocalApiServer` binds only to localhost and exposes versioned, JSON-only endpoints: `GET /health`, `GET /status`, `GET /components`, and `GET /version`.

The CLI offers `start`, `status`, and `health`. `start` is a foreground process and handles `SIGINT` and `SIGTERM`. `status` and `health` query a running local API. CLI output defaults to JSON and has explicit exit codes.

## Contracts and agent-first operation

Configuration has defaults, environment-variable overrides, and schema validation. It includes configurable identity, API host and port, log level, and component settings. Secrets are accepted only via environment variables or external configuration and are never logged.

Every CLI response, endpoint response, event, and log record has a defined TypeScript type. Operational errors use a stable shape containing `code`, `message`, `context`, and `remediation`. JSON Schema artifacts are generated or maintained for externally consumed configuration and response types.

Structured log records include timestamp, level, component, event, request identifier when available, and structured error data. No operational behavior relies on parsing unstructured console text.

## Project layout

```text
src/
  api/             local HTTP API
  cli/             commands and API client
  components/      contracts, registry, example component
  core/            runtime, configuration, shared contracts
  events/          typed event bus
  observability/   JSON logs and health aggregation
tests/             unit and integration tests
docs/              architecture, progress, and design records
```

## Failure and lifecycle rules

- Configuration errors prevent startup and return a typed error.
- Startup publishes starting and started events; shutdown publishes stopping and stopped events.
- Required component failure prevents a successful start.
- Optional component failure is observable but isolated, resulting in degraded health.
- Shutdown remains best-effort: every started component receives a stop attempt even if an earlier stop fails.
- An unavailable local API produces a typed CLI error and a non-zero exit code.

## Verification

Automated tests cover configuration defaults, overrides, and invalid input; event delivery and unsubscription; registry lifecycle ordering and failure isolation; clean signal-driven shutdown; API status, health, components, and version output; degraded health; and typed unavailable-service errors.

Tests require no internet access, AI API, microphone, special hardware, or external service.

## Delivery checkpoints

Each Phase 0 milestone is implemented on a focused branch, verified with its applicable automated tests, committed independently, and submitted as a pull request. A pull request must state the milestone scope, the completed checks, and any intentionally deferred work. Later milestone work begins only after its predecessor's pull request is ready for review.

## Completion boundary

Phase 0 ends when the headless runtime meets its lifecycle, configuration, event, component, API, health, and test requirements. `PROGRESS.md` records the verified state. Further AI, voice, device, memory, or automation work requires explicit direction.
