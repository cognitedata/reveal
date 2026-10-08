/*!
 * Copyright 2026 Cognite AS
 */

import type { Node } from './lru';
import { LRU } from './lru';

describe(LRU.name, () => {
  test('forgetUnloaded drops released nodes from the point count', () => {
    const lru = new LRU();
    const released = { id: 1, loaded: true, numPoints: 100 } as Node;
    const kept = { id: 2, loaded: true, numPoints: 50 } as Node;

    lru.touch(released);
    lru.touch(kept);
    released.loaded = false;

    lru.forgetUnloaded();

    expect(lru.numPoints).toBe(50);
    expect(lru.has(kept)).toBe(true);
    expect(lru.has(released)).toBe(false);
  });
});
