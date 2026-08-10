# Core Runtime Architecture

## Decision

The runtime uses TypeScript on Node.js 22 or later.

## Rationale

Node.js provides a mature asynchronous runtime and local networking primitives. TypeScript provides explicit contracts for the machine-readable lifecycle, health, event, and API boundaries required by agent consumers.

## Phase 0 boundaries

The process remains foreground-only. It will provide configuration, structured logs, an in-process event bus, a component registry, local API, health reporting, and tests. Model, voice, memory, device, satellite, and automation concerns remain outside this phase.

## Identity

Runtime-facing identity is supplied by configuration or package metadata. Contracts must not embed a product-specific name.
