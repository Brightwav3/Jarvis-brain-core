# Core Runtime

Infrastructure repository for the first, model-independent foundation of a long-term runtime system.

Phase 0 defines only a headless core runtime: lifecycle, configuration, structured logging, an event bus, component registry, local API, health reporting, and automated tests. It intentionally excludes AI, voice, devices, automation, and memory.

Status: Phase 0 is complete after automated verification.

## Agent commands

All commands emit JSON.

```text
core-runtime start
core-runtime status
core-runtime health
```

`start` is a foreground process. Use `RUNTIME_IDENTITY`, `RUNTIME_API_HOST`, `RUNTIME_API_PORT`, `RUNTIME_LOG_LEVEL`, and `RUNTIME_VERSION` to configure it. The default local API listens on `127.0.0.1:4310`.

The complete scope and delivery rules are in [workplan.md](workplan.md). Architecture decisions are in [ARCHITECTURE.md](ARCHITECTURE.md), and verified delivery state is in [PROGRESS.md](PROGRESS.md).

