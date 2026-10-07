# Perf counter benchmarks

Deterministic renderer counters, checked in CI by the `perf` Playwright project next to the visual tests.
CI renders with software GL (SwiftShader), so these are **counts, never timings**: nothing here says anything about GPU performance.

```
pnpm test:perf          # compare against perf-baseline.json
pnpm test:perf:update   # rewrite perf-baseline.json after an intentional change, then commit it
```

## How it works

- `PrimitivesLoad.PerfTest.ts` loads the local `primitives` CAD model through the normal fixture, renders the default fit-to-model view once and publishes the counters on `window.__revealPerf`.
- `../PerfTest.playwright.ts` runs the benchmark twice in fresh browser contexts and fails if the two runs differ (a count that wobbles is noise, not a regression). Sector requests and bytes come from network responses for `/primitives/*.glb`.
- A counter **above** its baseline fails the test. A counter **below** its baseline only warns; run `pnpm test:perf:update` and commit to lock the improvement in.
- The latest measurement is written to `perf-result.json` (gitignored, uploaded as a CI artifact).

## Counters

| Counter                         | What it stands for                                                                                                                 | Status                                            |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| `drawCalls`                     | CPU cost per frame while navigating                                                                                                | link to frame time on a real GPU not yet verified |
| `triangles`                     | GPU cost per frame                                                                                                                 | link to frame time on a real GPU not yet verified |
| `programsCompiled`              | Freeze the first time new content is shown (shader compile)                                                                        | link to a real GPU not yet verified               |
| `sectorRequests`, `sectorBytes` | Payload guard for the fixture. **Constant by construction:** `primitives` is a single sector, so this is not a streaming benchmark | n/a                                               |

A counter that cannot be shown to track something users feel gets deleted.

## Not covered yet

Frames to full detail, level-of-detail and streaming (both local fixtures are single-node; the point cloud loaded signal is a timeout), time to first full-detail frame, and frame time during interaction.
