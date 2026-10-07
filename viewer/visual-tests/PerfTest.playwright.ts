/*!
 * Copyright 2026 Cognite AS
 */

import { test, expect } from '@playwright/test';
import type { Browser } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const BENCHMARK = 'primitives-load';
const FIXTURE = 'PrimitivesLoad.PerfTest';

const baselinePath = path.resolve(__dirname, 'perf/perf-baseline.json');
const resultPath = path.resolve(__dirname, 'perf/perf-result.json');

type Counters = Record<string, number>;

async function measure(browser: Browser): Promise<Counters> {
  // Fresh context per run so nothing is served from the HTTP cache
  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 1,
    baseURL: 'http://localhost:8080'
  });
  try {
    const page = await context.newPage();

    let sectorRequests = 0;
    let sectorBytes = 0;
    const pending: Promise<void>[] = [];
    page.on('response', response => {
      if (!/\/primitives\/.*\.glb$/.test(new URL(response.url()).pathname)) {
        return;
      }
      sectorRequests++;
      pending.push(response.body().then(body => void (sectorBytes += body.length)));
    });

    await page.goto('/', { waitUntil: 'load' });
    await page.evaluate(async (name: string) => {
      await (window as any).render(name);
    }, FIXTURE);
    await Promise.all(pending);

    const frame: Counters = await page.evaluate(() => (window as any).__revealPerf);
    return { ...frame, sectorRequests, sectorBytes };
  } finally {
    await context.close();
  }
}

test(BENCHMARK, async ({ browser }, testInfo) => {
  // Determinism guard: a count that differs between two identical runs is noise, not a regression.
  const first = await measure(browser);
  const second = await measure(browser);
  expect(second, 'counters differ between two identical runs - benchmark is not deterministic').toEqual(first);

  const serialized = JSON.stringify({ [BENCHMARK]: first }, null, 2) + '\n';
  fs.writeFileSync(resultPath, serialized);

  if (process.env.PERF_UPDATE_BASELINE) {
    fs.writeFileSync(baselinePath, serialized);
    return;
  }

  const baseline: Counters = JSON.parse(fs.readFileSync(baselinePath, 'utf-8'))[BENCHMARK] ?? {};

  const regressions: string[] = [];
  for (const [counter, actual] of Object.entries(first)) {
    const expected = baseline[counter];
    if (expected === undefined || actual > expected) {
      regressions.push(`${counter}: baseline ${expected ?? 'missing'} -> ${actual}`);
    } else if (actual < expected) {
      const message = `${counter} improved: baseline ${expected} -> ${actual}. Run 'pnpm test:perf:update' and commit to lock it in.`;
      testInfo.annotations.push({ type: 'perf-improved', description: message });
      console.warn(`[perf] ${message}`);
    }
  }
  expect(regressions, `perf counters rose above baseline:\n${regressions.join('\n')}`).toEqual([]);
});
