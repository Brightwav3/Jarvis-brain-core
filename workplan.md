# Jarvis Core — Phase 0 Workplan

## Goal

Build the first independent component of the long-term Jarvis system:

an always-on, headless Jarvis Core runtime that future voice, AI, tools, devices, memory, and automation systems can connect to.

This phase is infrastructure only.

Do not implement voice, LLM integration, Home Assistant, memory, displays, or physical satellites yet.

⸻

## Architecture principle

Jarvis Core must remain independent from any particular AI model.

Future architecture:

```text
Room satellites
      |
      v
 Jarvis Core
      |
      +-- Events
      +-- State
      +-- Devices
      +-- Sessions
      +-- Tools
      +-- Permissions
      |
      v
 Agent / AI layer
```

Phase 0 implements only the foundation of Jarvis Core.

⸻

## Phase 0 — Headless Runtime

### Milestone 0.1 — Repository foundation

Set up a clean project structure suitable for a long-running service.

Expected high-level layout:

```text
jarvis-core/
├── src/
├── tests/
├── docs/
├── README.md
├── ARCHITECTURE.md
└── PROGRESS.md
```

Choose the implementation language and dependency strategy based on suitability for:

* long-running background services;
* async/event-driven workloads;
* networking;
* strong testing;
* future hardware integrations;
* cross-platform development where practical.

Document the decision before significant implementation.

⸻

### Milestone 0.2 — Core lifecycle

Implement a Jarvis Core process that can:

* start;
* remain running;
* expose its current status;
* shut down cleanly;
* handle startup failures predictably.

No AI functionality.

Target conceptual commands:

```text
jarvis start
jarvis status
jarvis health
```

⸻

### Milestone 0.3 — Configuration

Create structured configuration with:

* sensible defaults;
* environment overrides;
* validation;
* explicit errors for invalid configuration.

Secrets must not be hardcoded.

⸻

### Milestone 0.4 — Structured logging

Provide machine-readable logging suitable for a permanent service.

Logs should support fields such as:

```text
timestamp
level
component
event
request_id
error
```

Avoid relying on arbitrary print statements.

⸻

### Milestone 0.5 — Event bus

Implement the first internal primitive that later Jarvis components will share.

Support:

```text
publish(event)
subscribe(event_type)
unsubscribe(...)
```

Events must be typed/structured.

Example:

```json
{
  "type": "core.started",
  "source": "jarvis-core",
  "timestamp": "..."
}
```

Initial events may include:

```text
core.starting
core.started
core.stopping
core.stopped
component.registered
component.failed
```

Keep the implementation simple. Do not build distributed messaging yet.

⸻

### Milestone 0.6 — Component registry

Allow future subsystems to register with Jarvis Core.

Each component should expose basic metadata and health.

Conceptually:

```text
component.id
component.name
component.version
component.health()
component.start()
component.stop()
```

Jarvis Core should own component lifecycle.

⸻

### Milestone 0.7 — Local API

Expose a minimal local API for other software and future coding agents.

Initial endpoints/capabilities:

```text
health
status
components
version
```

Do not design a massive public API yet.

The API must be usable without a GUI.

⸻

### Milestone 0.8 — Health system

Jarvis Core should distinguish between:

```text
healthy
degraded
unhealthy
```

A failing optional component should not necessarily crash the entire runtime.

Health output must identify the responsible subsystem.

⸻

### Milestone 0.9 — Testing

Create automated tests for:

* startup;
* shutdown;
* configuration;
* event delivery;
* component lifecycle;
* API health;
* degraded states;
* failure isolation.

No test should require:

* AI APIs;
* internet;
* microphones;
* Home Assistant;
* special hardware.

⸻

## Explicit non-goals

Do NOT implement yet:

```text
LLMs
STT
TTS
wake words
microphones
speakers
room satellites
displays
Home Assistant
memory
tool calling
agent loops
automations
presence
computer control
cloud model APIs
```

Do not prematurely design these systems in detail.

Only preserve clean extension points for them.

⸻

## Definition of Done

Phase 0 is complete when:

1. Jarvis Core starts as a headless service.
2. It remains running reliably.
3. It loads validated configuration.
4. Components can register and expose health.
5. Components communicate through a basic event bus.
6. A local client can query health and status.
7. Shutdown is graceful.
8. Component failure is observable and isolated where possible.
9. The entire system is covered by automated tests.
10. Nothing depends on an AI model.

At completion, stop implementation.

Update PROGRESS.md with the verified state and prepare the architecture for review before beginning any voice or agent work.

⸻

## Coding-agent rules

Before coding:

1. inspect the repository;
2. read this file;
3. propose a concrete implementation plan;
4. document major architecture choices;
5. only then implement.

Prefer mature dependencies over custom infrastructure where appropriate.

Keep abstractions proportional to current requirements.

Do not implement speculative future functionality.

Do not proceed beyond Phase 0 without explicit instruction.

