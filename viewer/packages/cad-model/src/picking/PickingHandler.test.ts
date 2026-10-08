/*!
 * Copyright 2021 Cognite AS
 */

import type { WebGLRenderer } from 'three';
import { PerspectiveCamera, Vector2 } from 'three';
import { vi } from 'vitest';

import type { CadMaterialManager } from '@reveal/rendering';
import { BasicPipelineExecutor, RenderMode } from '@reveal/rendering';
import type { IntersectInput } from '@reveal/model-base';

import { PickingHandler } from './PickingHandler';
import { It, Mock } from 'moq.ts';
import { SceneHandler } from '@reveal/utilities';
import { createCadModel, createCadNode, autoMockWebGLRenderer } from '../../../../test-utilities';

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

  test('hides other nodes only while rendering, not while waiting for the readback', async () => {
    const nodes = [createCadNode(), createCadNode()];
    const insideCamera = new PerspectiveCamera();
    nodes[0].cadModelMetadata.scene.root.subtreeBoundingBox.getCenter(insideCamera.position);
    insideCamera.updateMatrixWorld();
    const visibilityDuringRender: boolean[][] = [];
    const renderSpy = vi
      .spyOn(BasicPipelineExecutor.prototype, 'render')
      .mockImplementation(() => visibilityDuringRender.push(nodes.map(node => node.visible)));
    const pendingReadbacks: (() => void)[] = [];
    const readbackRenderer = autoMockWebGLRenderer(new Mock<WebGLRenderer>()).object();
    readbackRenderer.readRenderTargetPixelsAsync = vi.fn(
      () => new Promise<Uint8Array>(resolve => pendingReadbacks.push(() => resolve(new Uint8Array(4))))
    );

    try {
      const intersections = pickingHandler.intersectCadNodes(nodes, {
        ...input,
        renderer: readbackRenderer,
        camera: insideCamera,
        normalizedCoords: new Vector2(0, 0)
      });

      for (const pickedNode of [0, 1]) {
        await vi.waitFor(() => expect(pendingReadbacks).toHaveLength(1));
        expect(visibilityDuringRender.at(-1)).toEqual(nodes.map((_, index) => index === pickedNode));
        expect(nodes.map(node => node.visible)).toEqual([true, true]);
        pendingReadbacks.pop()!();
      }

      expect(await intersections).toHaveLength(0);
      expect(renderSpy).toHaveBeenCalledTimes(2);
      expect(nodes.map(node => node.visible)).toEqual([true, true]);
    } finally {
      renderSpy.mockRestore();
    }
  });
});
