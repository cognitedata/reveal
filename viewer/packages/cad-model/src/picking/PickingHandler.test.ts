/*!
 * Copyright 2021 Cognite AS
 */

import type { WebGLRenderer } from 'three';
import { PerspectiveCamera, Vector2 } from 'three';

import type { CadMaterialManager } from '@reveal/rendering';
import { forEachMaterial, RenderMode } from '@reveal/rendering';
import type { IntersectInput } from '@reveal/model-base';

import { PickingHandler } from './PickingHandler';
import { It, Mock } from 'moq.ts';
import { SceneHandler } from '@reveal/utilities';
import { createCadModel, autoMockWebGLRenderer } from '../../../../test-utilities';

// Points the camera straight down -Z through the (0,0,0)-(1,1,1) default test bounding box
// used by createCadModel/createCadNode, so candidates actually intersect the pick ray.
function createHitCamera(): PerspectiveCamera {
  const hitCamera = new PerspectiveCamera();
  hitCamera.position.set(0.5, 0.5, 5);
  hitCamera.updateMatrixWorld();
  return hitCamera;
}

// Serves one 4-byte pixel readback per call to readRenderTargetPixelsAsync, in order (repeating
// the last entry if there are more calls than entries), and tracks how many calls were made.
function mockPixelReadbacks(renderer: Mock<WebGLRenderer>, pixelSequence: number[][]): { callCount: () => number } {
  let callIndex = 0;
  renderer
    .setup(instance =>
      instance.readRenderTargetPixelsAsync(It.IsAny(), It.IsAny(), It.IsAny(), It.IsAny(), It.IsAny(), It.IsAny())
    )
    .callback(({ args }) => {
      const buffer = args[5] as Uint8Array;
      const bytes = pixelSequence[Math.min(callIndex, pixelSequence.length - 1)];
      buffer.set(bytes);
      callIndex++;
      return Promise.resolve(buffer);
    });
  return { callCount: () => callIndex };
}

// An arbitrary mid-range packed depth value - decodes to a finite point/distance without needing
// to hand-derive an exact value, for tests that only assert on cadNode/treeIndex.
const ARBITRARY_DEPTH_PIXEL = [128, 0, 0, 0];

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

  test('no-hit sentinel still returns empty array with multiple intersecting candidates visible', async () => {
    const nodes = [createCadModel(10, 1).cadNode, createCadModel(11, 1).cadNode, createCadModel(12, 1).cadNode];
    const hitInput: IntersectInput = { ...input, camera: createHitCamera(), normalizedCoords: new Vector2(0, 0) };

    const intersections = await pickingHandler.intersectCadNodes(nodes, hitInput);

    expect(intersections).toHaveLength(0);
  });

  test('combined pass renders once regardless of candidate model count', async () => {
    const nodes = [createCadModel(20, 1).cadNode, createCadModel(21, 1).cadNode, createCadModel(22, 1).cadNode];
    const hitInput: IntersectInput = { ...input, camera: createHitCamera(), normalizedCoords: new Vector2(0, 0) };

    const rendererMock = autoMockWebGLRenderer(new Mock<WebGLRenderer>());
    const readback = mockPixelReadbacks(rendererMock, [
      [0, 0, 42, 2], // tree-index pass: modelIndex=1, treeIndex=42
      ARBITRARY_DEPTH_PIXEL
    ]);
    const handler = new PickingHandler(
      rendererMock.object(),
      new Mock<CadMaterialManager>()
        .setup(p => p.getRenderMode())
        .returns(RenderMode.Color)
        .setup(p => p.setRenderMode(It.IsAny()))
        .returns()
        .object(),
      new SceneHandler()
    );

    const intersections = await handler.intersectCadNodes(nodes, {
      ...hitInput,
      renderer: rendererMock.object()
    });

    expect(readback.callCount()).toBe(2);
    expect(intersections).toHaveLength(1);
  });

  test('attributes the hit to the correct model when multiple models overlap', async () => {
    const nodes = [createCadModel(30, 1).cadNode, createCadModel(31, 1).cadNode, createCadModel(32, 1).cadNode];
    const hitInput: IntersectInput = { ...input, camera: createHitCamera(), normalizedCoords: new Vector2(0, 0) };

    const rendererMock = autoMockWebGLRenderer(new Mock<WebGLRenderer>());
    mockPixelReadbacks(rendererMock, [
      [0, 0, 42, 2], // tree-index pass: modelIndex=1 -> nodes[1], treeIndex=42
      ARBITRARY_DEPTH_PIXEL
    ]);
    const handler = new PickingHandler(
      rendererMock.object(),
      new Mock<CadMaterialManager>()
        .setup(p => p.getRenderMode())
        .returns(RenderMode.Color)
        .setup(p => p.setRenderMode(It.IsAny()))
        .returns()
        .object(),
      new SceneHandler()
    );

    const intersections = await handler.intersectCadNodes(nodes, {
      ...hitInput,
      renderer: rendererMock.object()
    });

    expect(intersections).toHaveLength(1);
    expect(intersections[0].cadNode).toBe(nodes[1]);
    expect(intersections[0].treeIndex).toBe(42);
  });

  test('falls back to the sequential path when candidates exceed the combined-pass limit', async () => {
    const nodes = [createCadModel(40, 1).cadNode, createCadModel(41, 1).cadNode];
    const hitInput: IntersectInput = { ...input, camera: createHitCamera(), normalizedCoords: new Vector2(0, 0) };

    const rendererMock = autoMockWebGLRenderer(new Mock<WebGLRenderer>());
    // First candidate's tree-index pass misses, forcing the sequential loop to also try the
    // second candidate - proving more than the combined path's 2 total calls occur.
    const readback = mockPixelReadbacks(rendererMock, [
      [0, 0, 0, 0], // node[0] tree-index pass: no hit
      [0, 0, 7, 1], // node[1] tree-index pass: modelIndex=0 (irrelevant in sequential path), treeIndex=7
      ARBITRARY_DEPTH_PIXEL // node[1] depth pass
    ]);
    const handler = new PickingHandler(
      rendererMock.object(),
      new Mock<CadMaterialManager>()
        .setup(p => p.getRenderMode())
        .returns(RenderMode.Color)
        .setup(p => p.setRenderMode(It.IsAny()))
        .returns()
        .object(),
      new SceneHandler()
    );

    const original = (PickingHandler as unknown as { MAX_COMBINED_PICK_MODELS: number }).MAX_COMBINED_PICK_MODELS;
    (PickingHandler as unknown as { MAX_COMBINED_PICK_MODELS: number }).MAX_COMBINED_PICK_MODELS = 1;
    try {
      const intersections = await handler.intersectCadNodes(nodes, {
        ...hitInput,
        renderer: rendererMock.object()
      });

      expect(readback.callCount()).toBeGreaterThan(2);
      expect(intersections).toHaveLength(1);
      expect(intersections[0].cadNode).toBe(nodes[1]);
      expect(intersections[0].treeIndex).toBe(7);
    } finally {
      (PickingHandler as unknown as { MAX_COMBINED_PICK_MODELS: number }).MAX_COMBINED_PICK_MODELS = original;
    }
  });

  test('restores node visibility after a combined pick', async () => {
    const nodes = [createCadModel(50, 1).cadNode, createCadModel(51, 1).cadNode];
    const hitInput: IntersectInput = { ...input, camera: createHitCamera(), normalizedCoords: new Vector2(0, 0) };

    await pickingHandler.intersectCadNodes(nodes, hitInput);

    nodes.forEach(node => expect(node.visible).toBe(true));
  });

  test('sets a distinct modelIndex uniform per candidate before the combined render', async () => {
    const nodes = [createCadModel(60, 1).cadNode, createCadModel(61, 1).cadNode];
    const hitInput: IntersectInput = { ...input, camera: createHitCamera(), normalizedCoords: new Vector2(0, 0) };

    const rendererMock = autoMockWebGLRenderer(new Mock<WebGLRenderer>());
    mockPixelReadbacks(rendererMock, [
      [0, 0, 0, 0], // no hit is fine - we only care about the uniforms set before the render
      ARBITRARY_DEPTH_PIXEL
    ]);
    const handler = new PickingHandler(
      rendererMock.object(),
      new Mock<CadMaterialManager>()
        .setup(p => p.getRenderMode())
        .returns(RenderMode.Color)
        .setup(p => p.setRenderMode(It.IsAny()))
        .returns()
        .object(),
      new SceneHandler()
    );

    await handler.intersectCadNodes(nodes, { ...hitInput, renderer: rendererMock.object() });

    const modelIndices = nodes.map(node => {
      let value: number | undefined;
      forEachMaterial(node.cadMaterial.materials, material => {
        value = material.uniforms.modelIndex.value;
      });
      return value;
    });
    expect(new Set(modelIndices).size).toBe(nodes.length);
  });
});
