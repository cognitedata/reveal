/*!
 * Copyright 2021 Cognite AS
 */

import type { WebGLRenderer } from 'three';
import { PerspectiveCamera, Vector2, Vector3 } from 'three';
import { vi } from 'vitest';
import { Mock } from 'moq.ts';

import type { IntersectInput } from '@reveal/model-base';
import { SceneHandler } from '@reveal/utilities';
import {
  autoMockWebGLRenderer,
  createCadModel,
  createPickInput,
  createPickMaterialManager,
  createPickRenderer,
  writePickHit
} from '../../../../test-utilities';
import type { CadNode } from '../wrappers/CadNode';
import type { CadPickCache } from './CadPickCache';
import { PickingHandler } from './PickingHandler';
import type { IntersectCadNodesResult } from './types';

describe(PickingHandler.name, () => {
  const intersect = vi.fn<CadPickCache['intersect']>();
  const invalidate = vi.fn<CadPickCache['invalidate']>();
  const dispose = vi.fn<CadPickCache['dispose']>();
  const fakeCache = new Mock<CadPickCache>()
    .setup(cache => cache.intersect)
    .returns(intersect)
    .setup(cache => cache.invalidate)
    .returns(invalidate)
    .setup(cache => cache.dispose)
    .returns(dispose)
    .object();

  let pickCamera: PerspectiveCamera;

  function createHandler(renderer: WebGLRenderer): PickingHandler {
    return new PickingHandler(renderer, createPickMaterialManager(), new SceneHandler(), fakeCache);
  }

  function createCachedResult(cadNode: CadNode): IntersectCadNodesResult {
    return { distance: 2, point: new Vector3(1, 2, 3), treeIndex: 5, object: cadNode, cadNode };
  }

  beforeEach(() => {
    vi.clearAllMocks();
    // By default the cache cannot answer, so the handler picks each model separately
    intersect.mockResolvedValue(undefined);

    pickCamera = new PerspectiveCamera();
    createCadModel(1, 2).cadNode.cadModelMetadata.scene.root.subtreeBoundingBox.getCenter(pickCamera.position);
    pickCamera.updateMatrixWorld();
  });

  test('no nodes, returns empty array without consulting the cache', async () => {
    const { renderer } = createPickRenderer();
    const handler = createHandler(renderer);

    const intersections = await handler.intersectCadNodes([], createPickInput(renderer, pickCamera));

    expect(intersections).toHaveLength(0);
    expect(intersect).not.toHaveBeenCalled();
  });

  test('single node that does not intersect, returns empty array', async () => {
    const renderer = autoMockWebGLRenderer(new Mock<WebGLRenderer>()).object();
    const handler = createHandler(renderer);
    const node = createCadModel(1, 2).cadNode;

    const intersections = await handler.intersectCadNodes([node], {
      normalizedCoords: new Vector2(0.5, 0.5),
      renderer,
      camera: new PerspectiveCamera(),
      clippingPlanes: [],
      domElement: document.createElement('canvas')
    });

    expect(intersections).toHaveLength(0);
  });

  describe('with a cache', () => {
    test('returns the cached intersection as the only result without per-model picking', async () => {
      const { renderer, singlePixelReadCount } = createPickRenderer();
      const handler = createHandler(renderer);
      const node = createCadModel(1, 2).cadNode;
      const cachedResult = createCachedResult(node);
      intersect.mockResolvedValue(cachedResult);

      const results = await handler.intersectCadNodes([node], createPickInput(renderer, pickCamera));

      expect(results).toEqual([cachedResult]);
      expect(singlePixelReadCount()).toBe(0);
    });

    test('picks each model separately when the cache cannot answer', async () => {
      const { renderer, singlePixelReadCount } = createPickRenderer({
        singlePixel: (index, pixels) => writePickHit(pixels, index, { treeIndex: 9, modelIndex: 0, depthByte: 128 }, 0)
      });
      const handler = createHandler(renderer);
      const node0 = createCadModel(1, 2).cadNode;
      const node1 = createCadModel(3, 4).cadNode;

      const results = await handler.intersectCadNodes([node0, node1], createPickInput(renderer, pickCamera));

      // One tree index and one depth readback per model.
      expect(singlePixelReadCount()).toBe(4);
      expect(results.map(result => result.treeIndex)).toEqual([9, 9]);
      expect(node0.visible).toBe(true);
      expect(node1.visible).toBe(true);
    });

    test('returns no intersection and skips the depth readback when nothing is hit', async () => {
      const { renderer, singlePixelReadCount } = createPickRenderer();
      const handler = createHandler(renderer);
      const node = createCadModel(1, 2).cadNode;

      const results = await handler.intersectCadNodes([node], createPickInput(renderer, pickCamera));

      expect(results).toHaveLength(0);
      expect(singlePixelReadCount()).toBe(1);
    });

    test('lets the cache pick among the visible models only, passing on the input and the async flag', async () => {
      const { renderer } = createPickRenderer();
      const handler = createHandler(renderer);
      const visibleNode = createCadModel(1, 2).cadNode;
      const hiddenNode = createCadModel(3, 4).cadNode;
      hiddenNode.visible = false;
      const input: IntersectInput = createPickInput(renderer, pickCamera);

      await handler.intersectCadNodes([visibleNode, hiddenNode], input, false);

      expect(intersect).toHaveBeenCalledExactlyOnceWith([visibleNode], input, false);
      expect(hiddenNode.visible).toBe(false);
    });

    test('returns no intersection without per-model picking when no model is visible', async () => {
      const { renderer, singlePixelReadCount } = createPickRenderer();
      const handler = createHandler(renderer);
      const hiddenNode = createCadModel(1, 2).cadNode;
      hiddenNode.visible = false;

      const results = await handler.intersectCadNodes([hiddenNode], createPickInput(renderer, pickCamera));

      expect(results).toHaveLength(0);
      expect(singlePixelReadCount()).toBe(0);
    });
  });

  test('invalidatePickCache invalidates the cache', () => {
    const { renderer } = createPickRenderer();
    const handler = createHandler(renderer);

    handler.invalidatePickCache();

    expect(invalidate).toHaveBeenCalledTimes(1);
  });

  test('dispose disposes the cache', () => {
    const { renderer } = createPickRenderer();
    const handler = createHandler(renderer);

    handler.dispose();

    expect(dispose).toHaveBeenCalledTimes(1);
  });
});
