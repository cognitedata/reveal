/*!
 * Copyright 2026 Cognite AS
 */

import type { StreamingTestFixtureComponents } from '../test-fixtures/StreamingVisualTestFixture';
import { StreamingVisualTestFixture } from '../test-fixtures/StreamingVisualTestFixture';

/**
 * Loads the local `primitives` CAD model, renders the default fit-to-model view once and
 * publishes renderer counters on `window.__revealPerf`. Sector requests and bytes are
 * captured from the network by PerfTest.playwright.ts.
 */
export default class PrimitivesLoadPerfTest extends StreamingVisualTestFixture {
  constructor() {
    super('primitives');
  }

  public setup({ renderer }: StreamingTestFixtureComponents): Promise<void> {
    this.render();

    Object.assign(window, {
      __revealPerf: {
        drawCalls: renderer.info.render.calls,
        triangles: renderer.info.render.triangles,
        programsCompiled: renderer.info.programs?.length ?? 0
      }
    });

    return Promise.resolve();
  }
}
