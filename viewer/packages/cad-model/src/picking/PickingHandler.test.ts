/*!
 * Copyright 2021 Cognite AS
 */

import type { WebGLRenderer } from 'three';
import { PerspectiveCamera, Vector2 } from 'three';
import { vi } from 'vitest';
import type { MockInstance } from 'vitest';

import type { CadMaterialManager } from '@reveal/rendering';
import { RenderMode, forEachMaterial } from '@reveal/rendering';
import type { IntersectInput } from '@reveal/model-base';

import { PickingHandler } from './PickingHandler';
import type { CadNode } from '../wrappers/CadNode';
import { It, Mock } from 'moq.ts';
import { SceneHandler } from '@reveal/utilities';
import { createCadModel, autoMockWebGLRenderer } from '../../../../test-utilities';

const CANVAS_WIDTH = 4;
const CANVAS_HEIGHT = 2;
// Pixel (3, 1) of the 4x2 pick buffer, i.e. the one under normalized coordinates (0.5, 0.5).
const PICKED_PIXEL_OFFSET = 4 * (3 + 1 * CANVAS_WIDTH);

type ReadFill = (readIndex: number, pixels: Uint8Array) => void;

function createMaterialManager(): CadMaterialManager {
  return new Mock<CadMaterialManager>()
    .setup(p => p.getRenderMode())
    .returns(RenderMode.Color)
    .setup(p => p.setRenderMode(It.IsAny()))
    .returns()
    .setup(p => p.updateViewLighting(It.IsAny()))
    .returns()
    .object();
}

function createRenderer(fills: { fullFrame?: ReadFill; singlePixel?: ReadFill } = {}) {
  let fullFrameReads = 0;
  let singlePixelReads = 0;
  const recordRead = (width: number, height: number, pixels: Uint8Array) => {
    if (width === CANVAS_WIDTH && height === CANVAS_HEIGHT) {
      fills.fullFrame?.(fullFrameReads, pixels);
      fullFrameReads++;
    } else {
      fills.singlePixel?.(singlePixelReads, pixels);
      singlePixelReads++;
    }
  };

  const recordReadArgs = (args: unknown[]): Uint8Array => {
    const [, , , width, height, pixels] = args;
    if (typeof width !== 'number' || typeof height !== 'number' || !(pixels instanceof Uint8Array)) {
      throw new Error('Unexpected readRenderTargetPixels arguments');
    }
    recordRead(width, height, pixels);
    return pixels;
  };

  const renderer = autoMockWebGLRenderer(new Mock<WebGLRenderer>())
    .setup(r => r.readRenderTargetPixelsAsync(It.IsAny(), It.IsAny(), It.IsAny(), It.IsAny(), It.IsAny(), It.IsAny()))
    .callback(({ args }) => {
      return Promise.resolve(recordReadArgs(args));
    })
    .setup(r => r.readRenderTargetPixels(It.IsAny(), It.IsAny(), It.IsAny(), It.IsAny(), It.IsAny(), It.IsAny()))
    .callback(({ args }) => {
      recordReadArgs(args);
    })
    .object();

  return { renderer, fullFrameReadCount: () => fullFrameReads, singlePixelReadCount: () => singlePixelReads };
}

function createCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  Object.defineProperty(canvas, 'clientWidth', { value: CANVAS_WIDTH });
  Object.defineProperty(canvas, 'clientHeight', { value: CANVAS_HEIGHT });
  return canvas;
}

function createInput(renderer: WebGLRenderer, camera: PerspectiveCamera, overrides?: Partial<IntersectInput>) {
  return {
    normalizedCoords: new Vector2(0.5, 0.5),
    renderer,
    camera,
    clippingPlanes: [],
    domElement: createCanvas(),
    ...overrides
  } satisfies IntersectInput;
}

function writeHit(
  pixels: Uint8Array,
  readIndex: number,
  hit: { treeIndex: number; modelIndex: number; depthByte: number },
  offset: number
) {
  if (readIndex % 2 === 0) {
    pixels.set([0, 0, hit.treeIndex, hit.modelIndex + 1], offset);
  } else {
    pixels.set([hit.depthByte, 0, 0, 0], offset);
  }
}

function getModelIndexUniforms(cadNode: CadNode): number[] {
  const values: number[] = [];
  forEachMaterial(cadNode.cadMaterial.materials, material => values.push(material.uniforms.modelIndex.value));
  return values;
}

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
    pickingHandler = new PickingHandler(renderer, createMaterialManager(), new SceneHandler());
  });

  test('no nodes, returns empty array', async () => {
    const intersections = await pickingHandler.intersectCadNodes([], input);
    expect(intersections).toHaveLength(0);
  });

  test('single node that does not intersect, returns empty array', async () => {
    const intersections = await pickingHandler.intersectCadNodes([cadNode], input);
    expect(intersections).toHaveLength(0);
  });

  describe('per-model picking', () => {
    let pickCamera: PerspectiveCamera;

    beforeEach(() => {
      pickCamera = new PerspectiveCamera();
      cadNode.cadModelMetadata.scene.root.subtreeBoundingBox.getCenter(pickCamera.position);
      pickCamera.updateMatrixWorld();
    });

    test('picks each candidate model separately when the cache is skipped', async () => {
      const { renderer, singlePixelReadCount, fullFrameReadCount } = createRenderer({
        singlePixel: (index, pixels) => writeHit(pixels, index, { treeIndex: 9, modelIndex: 0, depthByte: 128 }, 0)
      });
      const handler = new PickingHandler(renderer, createMaterialManager(), new SceneHandler());
      const node0 = createCadModel(1, 2).cadNode;
      const node1 = createCadModel(3, 4).cadNode;

      const results = await handler.intersectCadNodes(
        [node0, node1],
        createInput(renderer, pickCamera, { cameraInMotion: true })
      );

      expect(fullFrameReadCount()).toBe(0);
      // One tree index and one depth readback per model.
      expect(singlePixelReadCount()).toBe(4);
      expect(results).toHaveLength(2);
      expect(results.map(r => r.treeIndex)).toEqual([9, 9]);
      expect(node0.visible).toBe(true);
      expect(node1.visible).toBe(true);
    });

    test('returns no intersection and skips the depth readback when nothing is hit', async () => {
      const { renderer, singlePixelReadCount } = createRenderer();
      const handler = new PickingHandler(renderer, createMaterialManager(), new SceneHandler());
      const node = createCadModel(1, 2).cadNode;

      const results = await handler.intersectCadNodes([node], createInput(renderer, pickCamera), false);

      expect(results).toHaveLength(0);
      expect(singlePixelReadCount()).toBe(1);
    });

    test('uses the cache for as many models as the alpha byte can address', async () => {
      const { renderer, fullFrameReadCount, singlePixelReadCount } = createRenderer();
      const handler = new PickingHandler(renderer, createMaterialManager(), new SceneHandler());
      const nodes = Array.from({ length: 255 }, (_, i) => createCadModel(i, i, 1, 1).cadNode);

      await handler.intersectCadNodes(nodes, createInput(renderer, pickCamera));

      expect(fullFrameReadCount()).toBe(2);
      expect(singlePixelReadCount()).toBe(0);
      expect(getModelIndexUniforms(nodes[254]).every(value => value === 254)).toBe(true);
    });

    test('does not use the cache beyond the combined pass limit', async () => {
      const { renderer, fullFrameReadCount, singlePixelReadCount } = createRenderer();
      const handler = new PickingHandler(renderer, createMaterialManager(), new SceneHandler());
      const nodes = Array.from({ length: 256 }, (_, i) => createCadModel(i, i, 1, 1).cadNode);

      await handler.intersectCadNodes(nodes, createInput(renderer, pickCamera));

      expect(fullFrameReadCount()).toBe(0);
      expect(singlePixelReadCount()).toBe(256);
      expect(nodes.every(node => node.visible)).toBe(true);
    });
  });

  describe('full-frame pick cache', () => {
    let nowSpy: MockInstance<() => number>;
    let pickCamera: PerspectiveCamera;

    beforeEach(() => {
      nowSpy = vi.spyOn(Date, 'now').mockReturnValue(10_000);
      pickCamera = new PerspectiveCamera();
      pickCamera.updateMatrixWorld();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    test('first pick builds the cache full-frame, subsequent picks reuse it without GPU work', async () => {
      const { renderer, fullFrameReadCount } = createRenderer();
      const handler = new PickingHandler(renderer, createMaterialManager(), new SceneHandler());
      const node = createCadModel(1, 2).cadNode;

      await handler.intersectCadNodes([node], createInput(renderer, pickCamera));
      expect(fullFrameReadCount()).toBe(2);

      await handler.intersectCadNodes([node], createInput(renderer, pickCamera));
      await handler.intersectCadNodes([node], createInput(renderer, pickCamera, { normalizedCoords: new Vector2() }));
      expect(fullFrameReadCount()).toBe(2);
    });

    test('returns the tree index, model and point of the pixel under the cursor', async () => {
      const { renderer } = createRenderer({
        fullFrame: (index, pixels) =>
          writeHit(pixels, index, { treeIndex: 5, modelIndex: 0, depthByte: 128 }, PICKED_PIXEL_OFFSET)
      });
      const handler = new PickingHandler(renderer, createMaterialManager(), new SceneHandler());
      const node = createCadModel(1, 2).cadNode;

      const results = await handler.intersectCadNodes([node], createInput(renderer, pickCamera));

      expect(results).toHaveLength(1);
      expect(results[0].treeIndex).toBe(5);
      expect(results[0].cadNode).toBe(node);
      expect(results[0].distance).toBeCloseTo(results[0].point.distanceTo(pickCamera.position));
      expect(node.visible).toBe(true);
    });

    test('returns no intersection for a pixel no model covers', async () => {
      const { renderer } = createRenderer({
        fullFrame: (index, pixels) =>
          writeHit(pixels, index, { treeIndex: 5, modelIndex: 0, depthByte: 128 }, PICKED_PIXEL_OFFSET)
      });
      const handler = new PickingHandler(renderer, createMaterialManager(), new SceneHandler());
      const node = createCadModel(1, 2).cadNode;

      const results = await handler.intersectCadNodes(
        [node],
        createInput(renderer, pickCamera, { normalizedCoords: new Vector2(-0.5, -0.5) })
      );

      expect(results).toHaveLength(0);
    });

    test('renders all visible models in one combined pass and resolves the model from the pixel', async () => {
      const { renderer, fullFrameReadCount } = createRenderer({
        fullFrame: (index, pixels) =>
          writeHit(pixels, index, { treeIndex: 7, modelIndex: 1, depthByte: 10 }, PICKED_PIXEL_OFFSET)
      });
      const handler = new PickingHandler(renderer, createMaterialManager(), new SceneHandler());
      const node0 = createCadModel(1, 2).cadNode;
      const node1 = createCadModel(3, 4).cadNode;
      const hiddenNode = createCadModel(5, 6).cadNode;
      hiddenNode.visible = false;

      const results = await handler.intersectCadNodes([node0, node1, hiddenNode], createInput(renderer, pickCamera));

      expect(fullFrameReadCount()).toBe(2);
      expect(results).toHaveLength(1);
      expect(results[0].treeIndex).toBe(7);
      expect(results[0].cadNode).toBe(node1);
      expect(getModelIndexUniforms(node0).every(value => value === 0)).toBe(true);
      expect(getModelIndexUniforms(node1).every(value => value === 1)).toBe(true);
      expect(node0.visible).toBe(true);
      expect(node1.visible).toBe(true);
      expect(hiddenNode.visible).toBe(false);
    });

    test('falls back to per-model picking when invalidated within the holdoff, rebuilds after it', async () => {
      const { renderer, fullFrameReadCount, singlePixelReadCount } = createRenderer();
      const handler = new PickingHandler(renderer, createMaterialManager(), new SceneHandler());
      const node = createCadModel(1, 2).cadNode;

      await handler.intersectCadNodes([node], createInput(renderer, pickCamera));
      expect(fullFrameReadCount()).toBe(2);
      expect(singlePixelReadCount()).toBe(0);

      handler.invalidatePickCache();
      nowSpy.mockReturnValue(10_010);
      await handler.intersectCadNodes([node], createInput(renderer, pickCamera));
      expect(fullFrameReadCount()).toBe(2);
      // The per-model path ran instead: one tree index readback, no depth readback as nothing is hit.
      expect(singlePixelReadCount()).toBe(1);

      nowSpy.mockReturnValue(10_100);
      await handler.intersectCadNodes([node], createInput(renderer, pickCamera));
      expect(fullFrameReadCount()).toBe(4);
    });

    test('camera movement makes the cache unusable and triggers a rebuild', async () => {
      const { renderer, fullFrameReadCount } = createRenderer();
      const handler = new PickingHandler(renderer, createMaterialManager(), new SceneHandler());
      const node = createCadModel(1, 2).cadNode;

      await handler.intersectCadNodes([node], createInput(renderer, pickCamera));
      pickCamera.position.set(10, 0, 0);
      pickCamera.updateMatrixWorld();
      await handler.intersectCadNodes([node], createInput(renderer, pickCamera));

      expect(fullFrameReadCount()).toBe(4);
    });

    test('changing the set of visible models triggers a rebuild', async () => {
      const { renderer, fullFrameReadCount } = createRenderer();
      const handler = new PickingHandler(renderer, createMaterialManager(), new SceneHandler());
      const node0 = createCadModel(1, 2).cadNode;
      const node1 = createCadModel(3, 4).cadNode;

      await handler.intersectCadNodes([node0], createInput(renderer, pickCamera));
      await handler.intersectCadNodes([node0, node1], createInput(renderer, pickCamera));

      expect(fullFrameReadCount()).toBe(4);
    });

    test.each([
      ['camera is in motion', { cameraInMotion: true }, true],
      ['windowed pick is forced', { forceWindowedPick: true }, true],
      ['readback is synchronous', {}, false]
    ])('never builds the cache when %s', async (_, overrides: Partial<IntersectInput>, shouldRunAsync: boolean) => {
      const { renderer, fullFrameReadCount } = createRenderer();
      const handler = new PickingHandler(renderer, createMaterialManager(), new SceneHandler());
      const node = createCadModel(1, 2).cadNode;

      await handler.intersectCadNodes([node], createInput(renderer, pickCamera, overrides), shouldRunAsync);

      expect(fullFrameReadCount()).toBe(0);
    });

    test('forceWindowedPick bypasses an already built cache', async () => {
      const { renderer } = createRenderer({
        fullFrame: (index, pixels) =>
          writeHit(pixels, index, { treeIndex: 5, modelIndex: 0, depthByte: 128 }, PICKED_PIXEL_OFFSET)
      });
      const handler = new PickingHandler(renderer, createMaterialManager(), new SceneHandler());
      const node = createCadModel(1, 2).cadNode;

      const cached = await handler.intersectCadNodes([node], createInput(renderer, pickCamera));
      expect(cached).toHaveLength(1);

      const windowed = await handler.intersectCadNodes(
        [node],
        createInput(renderer, pickCamera, { forceWindowedPick: true })
      );
      expect(windowed).toHaveLength(0);
    });

    test('a cache built while a new frame was rendered is not served', async () => {
      const { renderer, fullFrameReadCount } = createRenderer({
        fullFrame: (index, pixels) => {
          writeHit(pixels, index, { treeIndex: 5, modelIndex: 0, depthByte: 128 }, PICKED_PIXEL_OFFSET);
          if (index === 1) {
            handler.invalidatePickCache();
          }
        }
      });
      const handler = new PickingHandler(renderer, createMaterialManager(), new SceneHandler());
      const node = createCadModel(1, 2).cadNode;

      await handler.intersectCadNodes([node], createInput(renderer, pickCamera));
      nowSpy.mockReturnValue(10_100);
      await handler.intersectCadNodes([node], createInput(renderer, pickCamera));

      expect(fullFrameReadCount()).toBe(4);
    });

    test('fails loudly for a CAD material without the modelIndex uniform', async () => {
      const { renderer, fullFrameReadCount } = createRenderer();
      const handler = new PickingHandler(renderer, createMaterialManager(), new SceneHandler());
      const node = createCadModel(1, 2).cadNode;
      delete node.cadMaterial.materials.box.uniforms.modelIndex;

      await expect(handler.intersectCadNodes([node], createInput(renderer, pickCamera))).rejects.toThrow(
        'has no modelIndex uniform'
      );
      expect(fullFrameReadCount()).toBe(0);
      expect(node.visible).toBe(true);
    });
  });
});
