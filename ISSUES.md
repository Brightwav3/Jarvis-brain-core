# Known Issues

- Phase 0 is foreground-only. Background or service operation does not exist.

- Health aggregation does not weight components by importance. A degraded component
  contributes the same as any other, which is deliberate for Phase 0 — see
  [ADR 0001](docs/decisions/0001-lifecycle-and-health-are-different-questions.md).

- `WORKPLAN.md` was named `workplan.md` until 2026-08-15. The lowercase name was
  invisible on Windows and would have been a missing file on a case-sensitive host.
