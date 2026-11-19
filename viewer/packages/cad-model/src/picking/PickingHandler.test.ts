/*!
 * Copyright 2021 Cognite AS
 */

import type { WebGLRenderer } from 'three';
import { PerspectiveCamera, Vector2, Vector3 } from 'three';
import { vi } from 'vitest';

import type { CadMaterialManager } from '@reveal/rendering';
import { RenderMode } from '@reveal/rendering';
import type { IntersectInput } from '@reveal/model-base';

import { PickingHandler } from './PickingHandler';
import { It, Mock } from 'moq.ts';
import { SceneHandler } from '@reveal/utilities';
import { createCadModel, autoMockWebGLRenderer } from '../../../../test-utilities';
import {
  createPickInput,
  createPickMaterialManager,
  createPickRenderer,
  getModelIndexUniforms,
  writePickHit
} from '../../../../test-utilities/src/cadPickTestUtils';
import type { CadPickCache } from './CadPickCache';
import type { IntersectCadNodesResult } from './types';

describe(PickingHandler.name, () => {
  let pickingHandler: PickingHandler;

  const camera = new PerspectiveCamera();

  const renderer = autoMockWebGLRenderer(new Mock<WebGLRenderer>()).object();

  const input: IntersectInput = {
    normalizedCoords: new Vector2(0.5, 0.5),
    renderer,
    camera,
    clippingPlanes: [],
    domElement: document.createElement('canvas')
  };
  const cadNode = createCadModel(1, 2).cadNode;

  beforeEach(() => {
    const materialManagerMock = new Mock<CadMaterialManager>()
      .setup(p => p.getRenderMode())
      .returns(RenderMode.Color)
      .setup(p => p.setRenderMode(It.IsAny()))
      .returns()
      .setup(p => p.updateViewLighting(It.IsAny()))
      .returns();
    pickingHandler = new PickingHandler(renderer, materialManagerMock.object(), new SceneHandler());
  });

  test('no nodes, returns empty array', async () => {
    const intersections = await pickingHandler.intersectCadNodes([], input);
    expect(intersections).toHaveLength(0);
  });

  test('single node that does not intersect, returns empty array', async () => {
    const intersections = await pickingHandler.intersectCadNodes([cadNode], input);
    expect(intersections).toHaveLength(0);
  });

  describe('with the full-frame pick cache', () => {
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

    function createCachedPickingHandler(pickRenderer: WebGLRenderer): PickingHandler {
      return new PickingHandler(pickRenderer, createPickMaterialManager(), new SceneHandler(), fakeCache);
    }

    beforeEach(() => {
      vi.clearAllMocks();
      // By default the cache cannot answer, so the handler picks each model separately
      intersect.mockResolvedValue(undefined);
      pickCamera = new PerspectiveCamera();
      cadNode.cadModelMetadata.scene.root.subtreeBoundingBox.getCenter(pickCamera.position);
      pickCamera.updateMatrixWorld();
    });

    test('returns the cached intersection as the only result without per-model picking', async () => {
      const { renderer: pickRenderer, singlePixelReadCount } = createPickRenderer();
      const cachedResult: IntersectCadNodesResult = {
        distance: 2,
        point: new Vector3(1, 2, 3),
        treeIndex: 5,
        object: cadNode,
        cadNode
      };
      intersect.mockResolvedValue(cachedResult);

      const results = await createCachedPickingHandler(pickRenderer).intersectCadNodes(
        [cadNode],
        createPickInput(pickRenderer, pickCamera)
      );

      expect(results).toEqual([cachedResult]);
      expect(singlePixelReadCount()).toBe(0);
    });

    test('picks all models in one combined pass when the cache cannot answer', async () => {
      const { renderer: pickRenderer, singlePixelReadCount } = createPickRenderer({
        singlePixel: (index, pixels) => writePickHit(pixels, index, { treeIndex: 9, modelIndex: 0, depthByte: 128 }, 0)
      });
      const otherCadNode = createCadModel(3, 4).cadNode;

      const results = await createCachedPickingHandler(pickRenderer).intersectCadNodes(
        [cadNode, otherCadNode],
        createPickInput(pickRenderer, pickCamera)
      );

      // One tree index and one depth readback, regardless of the number of models
      expect(singlePixelReadCount()).toBe(2);
      expect(results.map(result => result.treeIndex)).toEqual([9]);
      expect(results[0].cadNode).toBe(cadNode);
    });

    test('returns the model whose index is read from the combined pass', async () => {
      const { renderer: pickRenderer } = createPickRenderer({
        singlePixel: (index, pixels) => writePickHit(pixels, index, { treeIndex: 9, modelIndex: 1, depthByte: 128 }, 0)
      });
      const otherCadNode = createCadModel(3, 4).cadNode;

      const results = await createCachedPickingHandler(pickRenderer).intersectCadNodes(
        [cadNode, otherCadNode],
        createPickInput(pickRenderer, pickCamera)
      );

      expect(results.map(result => result.cadNode)).toEqual([otherCadNode]);
      expect(getModelIndexUniforms(cadNode).every(modelIndex => modelIndex === 0)).toBe(true);
      expect(getModelIndexUniforms(otherCadNode).every(modelIndex => modelIndex === 1)).toBe(true);
    });

    test('returns no result when the combined pass hits nothing', async () => {
      const { renderer: pickRenderer, singlePixelReadCount } = createPickRenderer();

      const results = await createCachedPickingHandler(pickRenderer).intersectCadNodes(
        [cadNode],
        createPickInput(pickRenderer, pickCamera)
      );

      expect(results).toHaveLength(0);
      expect(singlePixelReadCount()).toBe(2);
    });

    test('returns no result when the combined pass reads a model index outside the picked models', async () => {
      const { renderer: pickRenderer } = createPickRenderer({
        singlePixel: (index, pixels) => writePickHit(pixels, index, { treeIndex: 9, modelIndex: 5, depthByte: 128 }, 0)
      });

      const results = await createCachedPickingHandler(pickRenderer).intersectCadNodes(
        [cadNode],
        createPickInput(pickRenderer, pickCamera)
      );

      expect(results).toHaveLength(0);
    });

    test('does not render when no model can be under the picked pixel', async () => {
      const { renderer: pickRenderer, singlePixelReadCount } = createPickRenderer();
      pickCamera.position.z -= 1e6;
      pickCamera.updateMatrixWorld();

      const results = await createCachedPickingHandler(pickRenderer).intersectCadNodes(
        [cadNode],
        createPickInput(pickRenderer, pickCamera)
      );

      expect(results).toHaveLength(0);
      expect(singlePixelReadCount()).toBe(0);
    });

    describe('with more models than one combined pass can tell apart', () => {
      const combinedPassModelLimit = 255;
      const cadNodes = Array.from({ length: combinedPassModelLimit + 1 }, () => createCadModel(3, 4).cadNode);

      afterEach(() => {
        cadNodes.forEach(node => (node.visible = true));
      });

      test('hides models while picking only above the limit of visible models', () => {
        const handler = createCachedPickingHandler(createPickRenderer().renderer);

        expect(handler.hidesModelsWhilePicking(cadNodes.slice(0, combinedPassModelLimit))).toBe(false);
        expect(handler.hidesModelsWhilePicking(cadNodes)).toBe(true);

        cadNodes[0].visible = false;
        expect(handler.hidesModelsWhilePicking(cadNodes)).toBe(false);
      });

      test('picks each model separately and shows all the models again', async () => {
        const { renderer: pickRenderer, singlePixelReadCount } = createPickRenderer({
          singlePixel: (index, pixels) =>
            writePickHit(pixels, index, { treeIndex: 9, modelIndex: 0, depthByte: 128 }, 0)
        });
        cadNodes[0].cadModelMetadata.scene.root.subtreeBoundingBox.getCenter(pickCamera.position);
        pickCamera.updateMatrixWorld();

        const results = await createCachedPickingHandler(pickRenderer).intersectCadNodes(
          cadNodes,
          createPickInput(pickRenderer, pickCamera)
        );

        // One tree index and one depth readback per model
        expect(singlePixelReadCount()).toBe(2 * cadNodes.length);
        expect(results.map(result => result.cadNode)).toEqual(cadNodes);
        expect(cadNodes.every(node => node.visible)).toBe(true);
      });
    });

    test('lets the cache pick among the visible models only, passing on the input and the async flag', async () => {
      const { renderer: pickRenderer } = createPickRenderer();
      const hiddenCadNode = createCadModel(3, 4).cadNode;
      hiddenCadNode.visible = false;
      const pickInput = createPickInput(pickRenderer, pickCamera);

      await createCachedPickingHandler(pickRenderer).intersectCadNodes([cadNode, hiddenCadNode], pickInput, false);

      expect(intersect).toHaveBeenCalledExactlyOnceWith([cadNode], pickInput, false);
    });

    test('invalidates and disposes the cache together with the handler', () => {
      const handler = createCachedPickingHandler(createPickRenderer().renderer);

      handler.invalidatePickCache();
      handler.dispose();

      expect(invalidate).toHaveBeenCalledTimes(1);
      expect(dispose).toHaveBeenCalledTimes(1);
    });
  });
});
