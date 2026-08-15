# Core Runtime — rules for agents

This file is loaded automatically. It carries rules, not description.
`README.md` says what this repository owns. `ARCHITECTURE.md` says how it is
shaped. [`docs/decisions/`](docs/decisions/README.md) says why.

`AGENTS.md` is a byte-identical copy of this file. Change both or change neither.

Core Runtime is Phase 0: lifecycle, configuration, structured logging, an
in-process event bus, a component registry, a local JSON API, and health
aggregation. No AI, voice, devices, memory, automation, or model integration.

## Ecosystem invariants that govern this repository

None currently. When one is added to [`INVARIANTS.md`](../INVARIANTS.md) naming
this repository, quote its sentence verbatim here and in `AGENTS.md`.

## Rules in this repository

1. **Lifecycle state and health state stay separate.** Lifecycle records what the
   runtime did — `registered`, `running`, `failed`, `stopped`. Health records the
   component's service condition — `healthy`, `degraded`, `unhealthy`. Merging them
   makes a started-but-broken component report as fine.
   [ADR 0001](docs/decisions/0001-lifecycle-and-health-are-different-questions.md)
2. **The registry owns lifecycle; the component owns health.** A component does not
   report its own lifecycle state.
3. **A failed lifecycle state wins aggregation.** Do not soften it to `degraded`;
   failing to start is not partial service.
4. **Identity comes from configuration or package metadata.** No contract embeds a
   product-specific name.
5. **Phase 0 stays foreground-only.** Model, voice, memory, device, satellite, and
   automation concerns are out of scope — do not add a seam for them here "while we
   are in the area".
6. **`.worktrees/` is not part of the repository.** Two abandoned directories are
   present and `git worktree list` no longer knows them. Do not read documentation
   from there; three competing copies of each document exist.

## Before you finish

- Changed a boundary, chose between two homes for something, or rejected an
  approach a next agent would try? Write an ADR. The six triggers and the
  template are in [../docs/decisions/README.md](../docs/decisions/README.md).
- Edited this file? Copy it to `AGENTS.md` in the same change. They must stay
  byte-identical — Claude Code reads one, Codex reads the other, and a structure
  test compares them.
- Reasoning belongs in `docs/decisions/`, not in `ARCHITECTURE.md`.
