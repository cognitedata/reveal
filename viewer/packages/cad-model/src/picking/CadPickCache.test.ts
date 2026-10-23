/*!
 * Copyright 2026 Cognite AS
 */

import { PerspectiveCamera, Vector2 } from 'three';
import { vi } from 'vitest';
import type { IntersectInput } from '@reveal/model-base';
import { SceneHandler } from '@reveal/utilities';
import { createCadModel } from '../../../../test-utilities';
import {
  PICKED_PIXEL_OFFSET,
  createPickInput,
  createPickMaterialManager,
  createPickRenderer,
  getModelIndexUniforms,
  writePickHit
} from '../../../../test-utilities/src/cadPickTestUtils';
import { CadPickCache } from './CadPickCache';

describe(CadPickCache.name, () => {
  let pickCamera: PerspectiveCamera;

  // Picks within the rebuild holdoff of an invalidation are not answered by the cache
  const WITHIN_HOLDOFF_MS = 10_010;
  const AFTER_HOLDOFF_MS = 10_100;

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(10_000);
    pickCamera = new PerspectiveCamera();
    pickCamera.updateMatrixWorld();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function createCache(renderer: ReturnType<typeof createPickRenderer>['renderer']): CadPickCache {
    return new CadPickCache(renderer, createPickMaterialManager(), new SceneHandler());
  }

  function hitAtPickedPixel(modelIndex = 0) {
    return (index: number, pixels: Uint8Array) =>
      writePickHit(pixels, index, { treeIndex: 5, modelIndex, depthByte: 128 }, PICKED_PIXEL_OFFSET);
  }

  test('first pick builds the cache full-frame, subsequent picks reuse it without GPU work', async () => {
    const { renderer, fullFrameReadCount } = createPickRenderer();
    const cache = createCache(renderer);
    const node = createCadModel(1, 2).cadNode;

    await cache.intersect([node], createPickInput(renderer, pickCamera), true);
    expect(fullFrameReadCount()).toBe(2);

    await cache.intersect([node], createPickInput(renderer, pickCamera), true);
    await cache.intersect([node], createPickInput(renderer, pickCamera, { normalizedCoords: new Vector2() }), true);
    expect(fullFrameReadCount()).toBe(2);
  });

  test('renders all models in one pass and returns the model, tree index and point under the cursor', async () => {
    const { renderer, fullFrameReadCount } = createPickRenderer({ fullFrame: hitAtPickedPixel(1) });
    const cache = createCache(renderer);
    const node0 = createCadModel(1, 2).cadNode;
    const node1 = createCadModel(3, 4).cadNode;

    const result = await cache.intersect([node0, node1], createPickInput(renderer, pickCamera), true);

    expect(fullFrameReadCount()).toBe(2);
    assert(result !== undefined);
    expect(result.treeIndex).toBe(5);
    expect(result.cadNode).toBe(node1);
    expect(result.distance).toBeCloseTo(result.point.distanceTo(pickCamera.position));
    expect(getModelIndexUniforms(node0).every(value => value === 0)).toBe(true);
    expect(getModelIndexUniforms(node1).every(value => value === 1)).toBe(true);
    expect([node0.visible, node1.visible]).toEqual([true, true]);
  });

  test('returns nothing for a pixel no model covers', async () => {
    const { renderer } = createPickRenderer({ fullFrame: hitAtPickedPixel() });
    const cache = createCache(renderer);
    const node = createCadModel(1, 2).cadNode;
    const otherPixel = createPickInput(renderer, pickCamera, { normalizedCoords: new Vector2(-0.5, -0.5) });

    expect(await cache.intersect([node], otherPixel, true)).toBeUndefined();
  });

  test('cannot answer within the holdoff after an invalidation, rebuilds after it', async () => {
    const { renderer, fullFrameReadCount } = createPickRenderer({ fullFrame: hitAtPickedPixel() });
    const cache = createCache(renderer);
    const node = createCadModel(1, 2).cadNode;
    await cache.intersect([node], createPickInput(renderer, pickCamera), true);

    cache.invalidate();
    vi.setSystemTime(WITHIN_HOLDOFF_MS);
    expect(await cache.intersect([node], createPickInput(renderer, pickCamera), true)).toBeUndefined();
    expect(fullFrameReadCount()).toBe(2);

    vi.setSystemTime(AFTER_HOLDOFF_MS);
    expect(await cache.intersect([node], createPickInput(renderer, pickCamera), true)).toBeDefined();
    expect(fullFrameReadCount()).toBe(4);
  });

  test('camera movement alone does not rebuild the cache, as the invalidator reports camera changes', async () => {
    const { renderer, fullFrameReadCount } = createPickRenderer();
    const cache = createCache(renderer);
    const node = createCadModel(1, 2).cadNode;
    await cache.intersect([node], createPickInput(renderer, pickCamera), true);

    pickCamera.position.set(10, 0, 0);
    pickCamera.updateMatrixWorld();
    await cache.intersect([node], createPickInput(renderer, pickCamera), true);

    expect(fullFrameReadCount()).toBe(2);
  });

  test('changing the set of models triggers a rebuild', async () => {
    const { renderer, fullFrameReadCount } = createPickRenderer();
    const cache = createCache(renderer);
    const node0 = createCadModel(1, 2).cadNode;
    const node1 = createCadModel(3, 4).cadNode;

    await cache.intersect([node0], createPickInput(renderer, pickCamera), true);
    await cache.intersect([node0, node1], createPickInput(renderer, pickCamera), true);

    expect(fullFrameReadCount()).toBe(4);
  });

  test.each([
    ['camera is in motion', { cameraInMotion: true }, true],
    ['windowed pick is forced', { forceWindowedPick: true }, true],
    ['readback is synchronous', {}, false]
  ])('never builds the cache when %s', async (_, overrides: Partial<IntersectInput>, shouldRunAsync: boolean) => {
    const { renderer, fullFrameReadCount } = createPickRenderer();
    const cache = createCache(renderer);
    const node = createCadModel(1, 2).cadNode;

    const result = await cache.intersect([node], createPickInput(renderer, pickCamera, overrides), shouldRunAsync);

    expect(result).toBeUndefined();
    expect(fullFrameReadCount()).toBe(0);
  });

  test('a cache that is invalidated while it is being built is not served', async () => {
    const { renderer, fullFrameReadCount } = createPickRenderer({
      fullFrame: (index, pixels) => {
        hitAtPickedPixel()(index, pixels);
        if (index === 1) {
          cache.invalidate();
        }
      }
    });
    const cache = createCache(renderer);
    const node = createCadModel(1, 2).cadNode;

    await cache.intersect([node], createPickInput(renderer, pickCamera), true);
    vi.setSystemTime(AFTER_HOLDOFF_MS);
    await cache.intersect([node], createPickInput(renderer, pickCamera), true);

    expect(fullFrameReadCount()).toBe(4);
  });

  test.each([
    [255, 2],
    [256, 0]
  ])('with %i models, builds the combined pass with %i full-frame reads', async (modelCount, expectedReads) => {
    const { renderer, fullFrameReadCount } = createPickRenderer({ fullFrame: hitAtPickedPixel(254) });
    const cache = createCache(renderer);
    const nodes = Array.from({ length: modelCount }, (_, i) => createCadModel(i, i, 1, 1).cadNode);

    const result = await cache.intersect(nodes, createPickInput(renderer, pickCamera), true);

    expect(fullFrameReadCount()).toBe(expectedReads);
    expect(result?.cadNode).toBe(expectedReads > 0 ? nodes[254] : undefined);
  });

  test('fails loudly for a CAD material without the modelIndex uniform', async () => {
    const { renderer, fullFrameReadCount } = createPickRenderer();
    const cache = createCache(renderer);
    const node = createCadModel(1, 2).cadNode;
    delete node.cadMaterial.materials.box.uniforms.modelIndex;

    await expect(cache.intersect([node], createPickInput(renderer, pickCamera), true)).rejects.toThrow(
      'has no modelIndex uniform'
    );
    expect(fullFrameReadCount()).toBe(0);
  });
});
