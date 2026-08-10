# Core Runtime Phase 0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a tested, foreground, headless TypeScript runtime with configurable identity, typed lifecycle primitives, and a JSON-only local API.

**Architecture:** `CoreRuntime` owns startup and shutdown, publishing events and coordinating a registry, health service, and localhost HTTP server. The CLI and HTTP API consume shared JSON contracts; configuration and package metadata supply identity rather than runtime literals.

**Tech Stack:** Node.js 22, TypeScript, Zod, Pino, Node `http`, Node test runner, tsx.

## Global Constraints

- Implementation language: TypeScript on Node.js 22.
- The process runs in the foreground. External supervision is explicitly deferred.
- Runtime-facing contracts must not hardcode the repository or product name. Identity is supplied by configuration or package metadata.
- The system is optimized for agent consumers: structured, schema-stable, machine-readable inputs and outputs are the default.
- The runtime is model-independent.
- No AI models, voice, tools beyond one example component, memory, Home Assistant, satellites, device control, or OS service management.
- Each completed Phase 0 milestone must pass its checks, be committed on a focused branch, be pushed, and have its own pull request opened before work starts on the next milestone. This rule overrides task groupings below: milestones 0.4, 0.5, 0.6, and 0.8 are delivered independently and in numeric order.

---

## File structure

| Path | Responsibility |
| --- | --- |
| `src/core/contracts.ts` | Shared JSON response, error, lifecycle, and health types. |
| `src/core/runtime.ts` | Foreground lifecycle orchestration. |
| `src/core/config.ts` | Defaults, environment overrides, validation, and JSON Schema. |
| `src/events/event-bus.ts` | Typed in-process publish/subscribe primitive. |
| `src/components/contracts.ts` | Component metadata, lifecycle, and health contract. |
| `src/components/registry.ts` | Start/stop ordering and failure isolation. |
| `src/components/example-component.ts` | Minimal optional example component. |
| `src/observability/logger.ts` | Pino JSON logger factory. |
| `src/observability/health.ts` | Aggregate health state. |
| `src/api/server.ts` | Localhost JSON HTTP API. |
| `src/cli/main.ts` | JSON-default start, status, and health commands. |
| `tests/**/*.test.ts` | Isolated unit and integration coverage. |

### Task 1: Repository foundation (Milestone 0.1)

**Files:**
- Create: `package.json`, `tsconfig.json`, `.gitignore`, `src/core/contracts.ts`, `tests/contracts.test.ts`, `ARCHITECTURE.md`, `PROGRESS.md`
- Modify: `README.md`

**Interfaces:**
- Produces: `HealthState`, `RuntimeError`, `ApiEnvelope<T>`, and `VersionInfo` from `src/core/contracts.ts`.

- [ ] **Step 1: Write the failing contract test**

```ts
import assert from 'node:assert/strict';
import test from 'node:test';
import { createError, createOk } from '../src/core/contracts.js';

test('core contracts create stable JSON envelopes', () => {
  assert.deepEqual(createOk({ value: 1 }), { ok: true, data: { value: 1 } });
  assert.deepEqual(createError('CONFIG_INVALID', 'Invalid configuration', {}, 'Set a valid port'), {
    ok: false, error: { code: 'CONFIG_INVALID', message: 'Invalid configuration', context: {}, remediation: 'Set a valid port' },
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- tests/contracts.test.ts`

Expected: FAIL because the project and module do not exist.

- [ ] **Step 3: Add minimal project and contract implementation**

```ts
export type HealthState = 'healthy' | 'degraded' | 'unhealthy';
export type RuntimeError = { code: string; message: string; context: Record<string, unknown>; remediation: string };
export type ApiEnvelope<T> = { ok: true; data: T } | { ok: false; error: RuntimeError };
export const createOk = <T>(data: T): ApiEnvelope<T> => ({ ok: true, data });
export const createError = (code: string, message: string, context: Record<string, unknown>, remediation: string): ApiEnvelope<never> => ({ ok: false, error: { code, message, context, remediation } });
```

Create ESM TypeScript configuration, Node 22 engine declaration, scripts `test`, `typecheck`, and `build`, and dependencies `zod`, `pino`, `typescript`, `tsx`, and `@types/node`. Use a neutral package and executable identifier; do not embed the product name. Document the architecture decision and mark 0.1 as complete only after verification.

- [ ] **Step 4: Run checks**

Run: `npm install; npm run typecheck; npm test`

Expected: both checks PASS.

- [ ] **Step 5: Commit and open the milestone PR**

Run: `git checkout -b phase-0-1-foundation; git add package.json tsconfig.json .gitignore src/core/contracts.ts tests/contracts.test.ts README.md ARCHITECTURE.md PROGRESS.md; git commit -m "feat: establish core runtime foundation"; git push -u origin phase-0-1-foundation`

Open a PR titled `Phase 0.1: repository foundation` with the commands and results from Step 4.

### Task 2: Foreground core lifecycle (Milestone 0.2)

**Files:**
- Create: `src/core/runtime.ts`, `src/cli/main.ts`, `tests/runtime.test.ts`
- Modify: `package.json`, `PROGRESS.md`

**Interfaces:**
- Consumes: `ApiEnvelope`, `RuntimeError` from `src/core/contracts.ts`.
- Produces: `CoreRuntime.start(): Promise<void>`, `CoreRuntime.stop(reason: string): Promise<void>`, and `CoreRuntime.status()`.

- [ ] **Step 1: Write the failing lifecycle test**

```ts
test('runtime transitions from idle to running and stopped', async () => {
  const runtime = new CoreRuntime({ identity: 'test-runtime' });
  await runtime.start();
  assert.equal(runtime.status().state, 'running');
  await runtime.stop('test');
  assert.equal(runtime.status().state, 'stopped');
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- tests/runtime.test.ts`

Expected: FAIL because `CoreRuntime` does not exist.

- [ ] **Step 3: Implement the minimal runtime and CLI**

```ts
export type RuntimeState = 'idle' | 'starting' | 'running' | 'stopping' | 'stopped' | 'failed';
export class CoreRuntime {
  #state: RuntimeState = 'idle';
  async start() { this.#state = 'starting'; this.#state = 'running'; }
  async stop(_reason: string) { this.#state = 'stopping'; this.#state = 'stopped'; }
  status() { return { state: this.#state }; }
}
```

Make `start` await shutdown on `SIGINT` and `SIGTERM`, then exit zero. CLI output is JSON. `start` must not detach, fork, or use daemon APIs.

- [ ] **Step 4: Run checks**

Run: `npm run typecheck; npm test -- tests/runtime.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit and open the milestone PR**

Commit `feat: add foreground runtime lifecycle` on `phase-0-2-lifecycle`, push it, and open `Phase 0.2: foreground lifecycle` with Step 4 results.

### Task 3: Configuration and identity (Milestone 0.3)

**Files:**
- Create: `src/core/config.ts`, `schemas/runtime-config.schema.json`, `tests/config.test.ts`
- Modify: `src/core/runtime.ts`, `PROGRESS.md`

**Interfaces:**
- Produces: `RuntimeConfig`, `loadConfig(env: NodeJS.ProcessEnv): RuntimeConfig`, and `ConfigError` with code `CONFIG_INVALID`.
- Consumes: `CoreRuntime` constructor accepts `RuntimeConfig`.

- [ ] **Step 1: Write the failing configuration test**

```ts
test('configuration applies environment overrides and rejects an invalid port', () => {
  assert.equal(loadConfig({ RUNTIME_IDENTITY: 'unit', RUNTIME_API_PORT: '4311' }).api.port, 4311);
  assert.throws(() => loadConfig({ RUNTIME_API_PORT: '70000' }), { code: 'CONFIG_INVALID' });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- tests/config.test.ts`

Expected: FAIL because `loadConfig` does not exist.

- [ ] **Step 3: Implement schema-validated configuration**

Use Zod to validate `{ identity, api: { host, port }, log: { level } }`. Defaults are identity from `package.json` metadata, host `127.0.0.1`, port `4310`, and log level `info`; environment variables are `RUNTIME_IDENTITY`, `RUNTIME_API_HOST`, `RUNTIME_API_PORT`, and `RUNTIME_LOG_LEVEL`. Generate the committed JSON Schema without embedding a product name.

- [ ] **Step 4: Run checks**

Run: `npm run typecheck; npm test -- tests/config.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit and open the milestone PR**

Commit `feat: add validated runtime configuration` on `phase-0-3-config`, push it, and open `Phase 0.3: configuration` with Step 4 results.

### Task 4: Structured logging and typed event bus (Milestones 0.4 and 0.5)

**Files:**
- Create: `src/observability/logger.ts`, `src/events/event-bus.ts`, `tests/event-bus.test.ts`, `tests/logger.test.ts`
- Modify: `src/core/runtime.ts`, `PROGRESS.md`

**Interfaces:**
- Produces: `EventEnvelope<T>`, `EventBus.publish<T>()`, `EventBus.subscribe<T>()`, `EventBus.unsubscribe()`, and `createLogger(config)`.
- Consumes: `CoreRuntime` publishes `core.starting`, `core.started`, `core.stopping`, and `core.stopped`.

- [ ] **Step 1: Write failing event and log tests**

```ts
test('subscribers receive typed events and unsubscribe stops delivery', async () => {
  const bus = new EventBus(); const seen: string[] = [];
  const unsubscribe = bus.subscribe('core.started', event => seen.push(event.type));
  await bus.publish({ type: 'core.started', source: 'unit', timestamp: new Date().toISOString() });
  unsubscribe();
  await bus.publish({ type: 'core.started', source: 'unit', timestamp: new Date().toISOString() });
  assert.deepEqual(seen, ['core.started']);
});
```

- [ ] **Step 2: Run the tests to verify failure**

Run: `npm test -- tests/event-bus.test.ts tests/logger.test.ts`

Expected: FAIL because event bus and logger modules do not exist.

- [ ] **Step 3: Implement bounded primitives in milestone order**

First configure Pino for JSON records with `timestamp`, `level`, `component`, `event`, optional `request_id`, and structured `error`; complete the 0.4 PR. Only after that PR is open, implement the in-memory `Map<string, Set<handler>>` bus with sequential awaited delivery and publish lifecycle events; complete the 0.5 PR.

- [ ] **Step 4: Run checks**

Run: `npm run typecheck; npm test -- tests/event-bus.test.ts tests/logger.test.ts tests/runtime.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit and open milestone PRs in sequence**

Commit only logger files as `feat: add structured JSON logging` on `phase-0-4-logging`, push it, and open `Phase 0.4: structured logging`. After that PR is open, commit the event bus files as `feat: add typed event bus` on `phase-0-5-event-bus`, push it, and open `Phase 0.5: typed event bus`.

### Task 5: Component registry (Milestone 0.6)

**Files:**
- Create: `src/components/contracts.ts`, `src/components/registry.ts`, `src/components/example-component.ts`, `tests/registry.test.ts`
- Modify: `src/core/runtime.ts`, `PROGRESS.md`

**Interfaces:**
- Produces: `RuntimeComponent`, `ComponentRegistry.register()`, `startAll()`, `stopAll()`, and `list()`.
- Consumes: event bus for `component.registered` and `component.failed`.

- [ ] **Step 1: Write failing isolation tests**

```ts
test('an optional component failure degrades health without stopping required components', async () => {
  const registry = new ComponentRegistry(bus);
  registry.register(requiredComponent); registry.register(failingOptionalComponent);
  await registry.startAll();
  assert.equal(registry.list()[0].state, 'running');
  assert.equal(registry.list()[1].state, 'failed');
});
```

- [ ] **Step 2: Run the tests to verify failure**

Run: `npm test -- tests/registry.test.ts`

Expected: FAIL because registry and health modules do not exist.

- [ ] **Step 3: Implement lifecycle ownership and health**

Define component metadata `{ id, name, version, required }`, `health()`, `start()`, and `stop()`. Reject duplicate IDs. Start in registration order; stop successfully started components in reverse order. Throw a typed `COMPONENT_START_FAILED` for required failure. Register one optional `example-component` that starts cleanly. Capture optional failures in registry state for the later 0.8 health milestone rather than adding the health service before the 0.7 API milestone.

- [ ] **Step 4: Run checks**

Run: `npm run typecheck; npm test -- tests/registry.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit and open milestone PRs**

Commit only the registry and example component as `feat: add component registry` on `phase-0-6-component-registry`, push it, and open `Phase 0.6: component registry`. Defer `HealthService` implementation and its PR until after the 0.7 local API PR.

### Task 6: Local API and agent CLI (Milestone 0.7)

**Files:**
- Create: `src/api/server.ts`, `src/cli/client.ts`, `tests/api.test.ts`, `tests/cli.test.ts`
- Modify: `src/cli/main.ts`, `src/core/runtime.ts`, `PROGRESS.md`

**Interfaces:**
- Produces: `LocalApiServer.start()`, `stop()`, and JSON routes `GET /health`, `/status`, `/components`, `/version`.
- Consumes: `ComponentRegistry`, `CoreRuntime`, and `VersionInfo`.

- [ ] **Step 1: Write failing API test**

```ts
test('GET /health returns a typed healthy envelope', async () => {
  const response = await fetch(`${baseUrl}/health`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true, data: { state: 'healthy', subsystems: [] } });
});
```

- [ ] **Step 2: Run the tests to verify failure**

Run: `npm test -- tests/api.test.ts tests/cli.test.ts`

Expected: FAIL because the server and client do not exist.

- [ ] **Step 3: Implement JSON-only localhost API and CLI client**

Bind Node `http` only to configured localhost host. Set `content-type: application/json`. Until milestone 0.8, `/health` returns the runtime's direct state and component records; that endpoint is enriched with aggregate health after the 0.8 PR. Return `404` with `ROUTE_NOT_FOUND` envelope for unknown routes. Have CLI `status` and `health` call the local API and print the received JSON. On connection refusal, emit `LOCAL_API_UNAVAILABLE` with remediation `Start the runtime first` and exit code 2.

- [ ] **Step 4: Run checks**

Run: `npm run typecheck; npm test -- tests/api.test.ts tests/cli.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit and open milestone PR**

Commit `feat: expose local JSON API and CLI` on `phase-0-7-local-api`, push it, and open `Phase 0.7: local API` with Step 4 results.

### Task 7: Health aggregation (Milestone 0.8)

**Files:**
- Create: `src/observability/health.ts`, `tests/health.test.ts`
- Modify: `src/api/server.ts`, `PROGRESS.md`

**Interfaces:**
- Consumes: `ComponentRegistry.list()` component state records.
- Produces: `HealthService.status(): { state: HealthState; subsystems: Array<{ id: string; state: HealthState; reason?: string }> }`.

- [ ] **Step 1: Write the failing health test**

```ts
test('optional component failure produces degraded aggregate health', () => {
  const health = new HealthService(registry).status();
  assert.equal(health.state, 'degraded');
  assert.equal(health.subsystems[0].id, 'example-component');
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- tests/health.test.ts`

Expected: FAIL because `HealthService` does not exist.

- [ ] **Step 3: Implement aggregate health and enrich `/health`**

Map a failed optional component to `degraded`; map a failed required component or failed runtime state to `unhealthy`; otherwise return `healthy`. Include each responsible subsystem and a structured reason. Replace the provisional direct `/health` response with this contract.

- [ ] **Step 4: Run checks**

Run: `npm run typecheck; npm test -- tests/health.test.ts tests/api.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit and open the milestone PR**

Commit `feat: add aggregate health reporting` on `phase-0-8-health`, push it, and open `Phase 0.8: health system` with Step 4 results.

### Task 8: End-to-end verification and completion record (Milestone 0.9)

**Files:**
- Create: `tests/runtime.integration.test.ts`
- Modify: `README.md`, `ARCHITECTURE.md`, `PROGRESS.md`

**Interfaces:**
- Consumes: all public modules and local API routes.
- Produces: verified Phase 0 completion record.

- [ ] **Step 1: Write the failing integration test**

```ts
test('runtime exposes degraded health and shuts down cleanly', async () => {
  const runtime = await startRuntimeWithOptionalFailure();
  assert.equal((await getJson('/health')).data.state, 'degraded');
  await runtime.stop('integration-test');
  assert.equal(runtime.status().state, 'stopped');
});
```

- [ ] **Step 2: Run the test to verify the uncovered behavior**

Run: `npm test -- tests/runtime.integration.test.ts`

Expected: FAIL until all lifecycle, registry, health, and API wiring is complete.

- [ ] **Step 3: Wire only missing integration behavior and document use**

Add no new subsystem. Ensure runtime starts the API after components, derives health from the registry, and stops API before final stopped state. Document JSON command examples using the neutral executable identity and record every verified completion criterion in `PROGRESS.md`.

- [ ] **Step 4: Run the complete verification suite**

Run: `npm run typecheck; npm test; npm run build`

Expected: all commands PASS with no network, hardware, or AI dependency.

- [ ] **Step 5: Commit and open the final milestone PR**

Commit `test: verify Phase 0 runtime completion` on `phase-0-9-verification`, push it, and open `Phase 0.9: automated verification and completion`. The PR body lists the ten Phase 0 completion criteria and the exact Step 4 results.

## Plan self-review

- Spec coverage: Tasks 1–8 cover project setup, lifecycle, configuration, logging, events, components, API, health, tests, documentation, and milestone PR checkpoints.
- Placeholder scan: no incomplete requirements are present; all task steps name files, interfaces, checks, and commit boundaries.
- Type consistency: `HealthState`, `RuntimeError`, `ApiEnvelope`, `RuntimeConfig`, `CoreRuntime`, `EventBus`, `ComponentRegistry`, and `HealthService` are introduced before later tasks consume them.
