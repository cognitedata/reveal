/*!
 * Copyright 2024 Cognite AS
 */
import type { WebGLRenderTarget, WebGLRenderer } from 'three';
import { BufferAttribute, BufferGeometry, PerspectiveCamera, Points, Ray, Scene, Vector2, Vector3 } from 'three';
import { Mock, It } from 'moq.ts';
import { vi } from 'vitest';
import type { MockInstance } from 'vitest';

import { PointCloudOctreePicker } from './PointCloudOctreePicker';
import type { PointCloudOctree } from './PointCloudOctree';
import type { IPointCloudTreeNode } from './IPointCloudTreeNode';
import type { IPickState, RenderedNode } from './PointCloudOctreePickerHelper';
import { PointCloudOctreePickerHelper } from './PointCloudOctreePickerHelper';
import type { PointCloudMaterial } from '@reveal/rendering';

const RENDER_TARGET_WIDTH = 128;
const RENDER_TARGET_HEIGHT = 64;
const MINIMAL_PIXEL_BUFFER_SIZE = 4;

function createMockPickState(): IPickState {
  return {
    renderTarget: new Mock<WebGLRenderTarget>()
      .setup(t => t.dispose())
      .returns(undefined)
      .object(),
    material: new Mock<PointCloudMaterial>()
      .setup(m => m.dispose())
      .returns(undefined)
      .object(),
    scene: new Scene()
  };
}

function createMockRenderer(): WebGLRenderer {
  return new Mock<WebGLRenderer>()
    .setup(r => r.getDrawingBufferSize(It.IsAny()))
    .returns(new Vector2(RENDER_TARGET_WIDTH, RENDER_TARGET_HEIGHT))
    .object();
}

function createFakeOctree(numPoints: number = 1000): PointCloudOctree {
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(new Float32Array([0, 0, 0]), 3));
  const sceneNode = new Points(geometry);
  const node = new Mock<IPointCloudTreeNode>()
    .setup(n => n.sceneNode)
    .returns(sceneNode)
    .setup(n => n.numPoints)
    .returns(numPoints)
    .object();
  return new Mock<PointCloudOctree>()
    .setup(o => o.visibleNodes)
    .returns([node])
    .object();
}

function setupPickerHelperMocks(renderedNodes: RenderedNode[] = []) {
  vi.spyOn(PointCloudOctreePickerHelper, 'getPickState').mockReturnValue(createMockPickState());
  vi.spyOn(PointCloudOctreePickerHelper, 'updatePickRenderTarget').mockImplementation(() => {});
  vi.spyOn(PointCloudOctreePickerHelper.prototype, 'prepareRender').mockImplementation(() => {});
  vi.spyOn(PointCloudOctreePickerHelper.prototype, 'resetState').mockImplementation(() => {});
  const renderSpy = vi.spyOn(PointCloudOctreePickerHelper.prototype, 'render').mockReturnValue(renderedNodes);
  const readPixelsSpy = vi
    .spyOn(PointCloudOctreePickerHelper.prototype, 'readPixelsAsync')
    .mockImplementation((_x, _y, width, height, _renderTarget, pixels) =>
      Promise.resolve(pixels ?? new Uint8Array(4 * width * height))
    );
  return { renderSpy, readPixelsSpy };
}

describe(PointCloudOctreePicker.name, () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('picking returns null immediately for empty octrees array', async () => {
    const picker = new PointCloudOctreePicker(createMockRenderer());
    const camera = new PerspectiveCamera();
    const ray = new Ray();

    const result = await picker.pick(camera, ray, []);

    expect(result).toBeNull();
  });

  test('picking resets GL state synchronously before awaiting GPU readback', async () => {
    vi.spyOn(PointCloudOctreePickerHelper, 'getPickState').mockReturnValue(createMockPickState());
    vi.spyOn(PointCloudOctreePickerHelper, 'updatePickRenderTarget').mockImplementation(() => {});
    vi.spyOn(PointCloudOctreePickerHelper, 'findHit').mockReturnValue(null);
    vi.spyOn(PointCloudOctreePickerHelper, 'getPickPoint').mockReturnValue(null);
    vi.spyOn(PointCloudOctreePickerHelper.prototype, 'prepareRender').mockImplementation(() => {});
    vi.spyOn(PointCloudOctreePickerHelper.prototype, 'render').mockReturnValue([]);

    let resolveReadPixels!: (pixels: Uint8Array) => void;
    const readPixelsPromise = new Promise<Uint8Array>(resolve => {
      resolveReadPixels = resolve;
    });
    const readPixelsSpy = vi
      .spyOn(PointCloudOctreePickerHelper.prototype, 'readPixelsAsync')
      .mockReturnValue(readPixelsPromise);

    let resetStateCalledBeforeResolve = false;
    vi.spyOn(PointCloudOctreePickerHelper.prototype, 'resetState').mockImplementation(() => {
      resetStateCalledBeforeResolve = true;
    });

    const picker = new PointCloudOctreePicker(createMockRenderer());
    // An octree with no visible nodes cannot populate the full-frame cache, so the pick takes
    // the windowed path.
    const octree = new Mock<PointCloudOctree>()
      .setup(o => o.visibleNodes)
      .returns([])
      .object();
    const camera = new PerspectiveCamera();
    const ray = new Ray();

    // pick() calls resetState() right after starting the readback and before awaiting it,
    // so GL state is restored while the readback is still in flight.
    const pickPromise = picker.pick(camera, ray, [octree]);
    await vi.waitFor(() => expect(readPixelsSpy).toHaveBeenCalled());

    expect(resetStateCalledBeforeResolve).toBe(true);

    resolveReadPixels(new Uint8Array(MINIMAL_PIXEL_BUFFER_SIZE));
    const result = await pickPromise;
    expect(result).toBeNull();
  });

  describe('full-frame pick cache', () => {
    let nowSpy: MockInstance<() => number>;
    let camera: PerspectiveCamera;
    let ray: Ray;
    let octree: PointCloudOctree;
    let renderedNodes: RenderedNode[];

    beforeEach(() => {
      nowSpy = vi.spyOn(performance, 'now').mockReturnValue(10_000);
      camera = new PerspectiveCamera();
      camera.updateMatrixWorld();
      ray = new Ray(new Vector3(), new Vector3(0, 0, -1));
      octree = createFakeOctree();
      renderedNodes = [{ node: octree.visibleNodes[0], octree }];
    });

    test('first pick builds the cache full-frame, subsequent picks reuse it without GPU work', async () => {
      const { renderSpy, readPixelsSpy } = setupPickerHelperMocks(renderedNodes);
      const picker = new PointCloudOctreePicker(createMockRenderer());

      await picker.pick(camera, ray, [octree]);

      expect(renderSpy).toHaveBeenCalledTimes(1);
      // Full-frame pass: no ray is passed so node culling is disabled.
      expect(renderSpy.mock.calls[0][3]).toBeUndefined();
      expect(readPixelsSpy).toHaveBeenCalledWith(
        0,
        0,
        RENDER_TARGET_WIDTH,
        RENDER_TARGET_HEIGHT,
        expect.anything(),
        undefined
      );

      await picker.pick(camera, ray, [octree]);
      await picker.pick(camera, ray, [octree]);

      expect(renderSpy).toHaveBeenCalledTimes(1);
      expect(readPixelsSpy).toHaveBeenCalledTimes(1);
    });

    test('falls back to the windowed pick when invalidated within the holdoff, rebuilds after it', async () => {
      const { renderSpy } = setupPickerHelperMocks(renderedNodes);
      const picker = new PointCloudOctreePicker(createMockRenderer());

      await picker.pick(camera, ray, [octree]);
      expect(renderSpy.mock.calls[0][3]).toBeUndefined();

      picker.invalidateCache();
      nowSpy.mockReturnValue(10_010);
      await picker.pick(camera, ray, [octree]);
      // Within the holdoff: windowed, ray-culled pick.
      expect(renderSpy).toHaveBeenCalledTimes(2);
      expect(renderSpy.mock.calls[1][3]).toBe(ray);

      nowSpy.mockReturnValue(10_100);
      await picker.pick(camera, ray, [octree]);
      // Past the holdoff: full-frame rebuild.
      expect(renderSpy).toHaveBeenCalledTimes(3);
      expect(renderSpy.mock.calls[2][3]).toBeUndefined();
    });

    test('camera movement makes the cache unusable and triggers a rebuild', async () => {
      const { renderSpy } = setupPickerHelperMocks(renderedNodes);
      const picker = new PointCloudOctreePicker(createMockRenderer());

      await picker.pick(camera, ray, [octree]);
      expect(renderSpy).toHaveBeenCalledTimes(1);

      camera.position.set(10, 0, 0);
      camera.updateMatrixWorld();
      await picker.pick(camera, ray, [octree]);

      expect(renderSpy).toHaveBeenCalledTimes(2);
      expect(renderSpy.mock.calls[1][3]).toBeUndefined();
    });

    test('dispose() clears the cache so a subsequent pick triggers a rebuild', async () => {
      const { renderSpy } = setupPickerHelperMocks(renderedNodes);
      const picker = new PointCloudOctreePicker(createMockRenderer());

      await picker.pick(camera, ray, [octree]);
      expect(renderSpy).toHaveBeenCalledTimes(1);

      picker.dispose();
      await picker.pick(camera, ray, [octree]);

      expect(renderSpy).toHaveBeenCalledTimes(2);
      expect(renderSpy.mock.calls[1][3]).toBeUndefined();
    });

    test('camera projection change makes the cache unusable and triggers a rebuild', async () => {
      const { renderSpy } = setupPickerHelperMocks(renderedNodes);
      const picker = new PointCloudOctreePicker(createMockRenderer());

      await picker.pick(camera, ray, [octree]);
      expect(renderSpy).toHaveBeenCalledTimes(1);

      // Same position/orientation, but a changed projection (e.g. fov/zoom) changes
      // projectionMatrix without touching matrixWorld.
      camera.fov = 30;
      camera.updateProjectionMatrix();
      await picker.pick(camera, ray, [octree]);

      expect(renderSpy).toHaveBeenCalledTimes(2);
      expect(renderSpy.mock.calls[1][3]).toBeUndefined();
    });

    test('renderer resize makes the cache unusable and triggers a rebuild', async () => {
      const { renderSpy } = setupPickerHelperMocks(renderedNodes);
      let width = RENDER_TARGET_WIDTH;
      const renderer = new Mock<WebGLRenderer>()
        .setup(webgl => webgl.getDrawingBufferSize)
        .returns((target: Vector2) => target.set(width, RENDER_TARGET_HEIGHT))
        .object();
      const picker = new PointCloudOctreePicker(renderer);

      await picker.pick(camera, ray, [octree]);
      expect(renderSpy).toHaveBeenCalledTimes(1);

      width = RENDER_TARGET_WIDTH + 1;
      await picker.pick(camera, ray, [octree]);

      expect(renderSpy).toHaveBeenCalledTimes(2);
      expect(renderSpy.mock.calls[1][3]).toBeUndefined();
    });

    test('a different set of octrees makes the cache unusable and triggers a rebuild', async () => {
      const { renderSpy } = setupPickerHelperMocks(renderedNodes);
      const picker = new PointCloudOctreePicker(createMockRenderer());

      await picker.pick(camera, ray, [octree]);
      expect(renderSpy).toHaveBeenCalledTimes(1);

      const otherOctree = createFakeOctree();
      await picker.pick(camera, ray, [otherOctree]);

      expect(renderSpy).toHaveBeenCalledTimes(2);
      expect(renderSpy.mock.calls[1][3]).toBeUndefined();
    });

    test('a node unloaded by LOD updates since the cache was built makes the cache unusable and triggers a rebuild', async () => {
      const { renderSpy } = setupPickerHelperMocks(renderedNodes);
      const picker = new PointCloudOctreePicker(createMockRenderer());

      await picker.pick(camera, ray, [octree]);
      expect(renderSpy).toHaveBeenCalledTimes(1);

      // Simulate an LOD update unloading the node's geometry after the cache was built - hits
      // in the stale cache could then not be resolved back to a position.
      (renderedNodes[0].node.sceneNode as unknown as { geometry: undefined }).geometry = undefined;
      await picker.pick(camera, ray, [octree]);

      expect(renderSpy).toHaveBeenCalledTimes(2);
      expect(renderSpy.mock.calls[1][3]).toBeUndefined();
    });

    test('buildCache declines when the node/point count cannot be bit-packed, falls back to windowed', async () => {
      const hugeOctree = createFakeOctree(20_000_000);
      const { renderSpy } = setupPickerHelperMocks([{ node: hugeOctree.visibleNodes[0], octree: hugeOctree }]);
      const picker = new PointCloudOctreePicker(createMockRenderer());

      await picker.pick(camera, ray, [hugeOctree]);

      // Bit-packing overflow: the cache is never built, so the pick falls back to the
      // ray-culled windowed path.
      expect(renderSpy).toHaveBeenCalledTimes(1);
      expect(renderSpy.mock.calls[0][3]).toBe(ray);
    });

    test('invalidation while the cache readback is in flight discards the result and falls back', async () => {
      const { renderSpy, readPixelsSpy } = setupPickerHelperMocks(renderedNodes);
      const picker = new PointCloudOctreePicker(createMockRenderer());

      let resolveReadPixels!: (pixels: Uint8Array) => void;
      readPixelsSpy.mockReturnValueOnce(
        new Promise<Uint8Array>(resolve => {
          resolveReadPixels = resolve;
        })
      );

      const pickPromise = picker.pick(camera, ray, [octree]);
      picker.invalidateCache();
      resolveReadPixels(new Uint8Array(4 * RENDER_TARGET_WIDTH * RENDER_TARGET_HEIGHT));
      await pickPromise;

      // The stale cache build is not served; the pick is answered by the windowed path.
      expect(renderSpy).toHaveBeenCalledTimes(2);
      expect(renderSpy.mock.calls[1][3]).toBe(ray);
    });

    test('custom pick parameters bypass the cache', async () => {
      const { renderSpy } = setupPickerHelperMocks(renderedNodes);
      const picker = new PointCloudOctreePicker(createMockRenderer());
      const params = { onBeforePickRender: () => {} };

      await picker.pick(camera, ray, [octree], params);
      await picker.pick(camera, ray, [octree], params);

      expect(renderSpy).toHaveBeenCalledTimes(2);
      expect(renderSpy.mock.calls[0][3]).toBe(ray);
      expect(renderSpy.mock.calls[1][3]).toBe(ray);
    });

    test('cameraInMotion skips the rebuild even after the holdoff elapses', async () => {
      const { renderSpy } = setupPickerHelperMocks(renderedNodes);
      const picker = new PointCloudOctreePicker(createMockRenderer());

      await picker.pick(camera, ray, [octree]);
      expect(renderSpy.mock.calls[0][3]).toBeUndefined();

      picker.invalidateCache();
      nowSpy.mockReturnValue(10_100); // past REBUILD_HOLDOFF_MS
      await picker.pick(camera, ray, [octree], { cameraInMotion: true });

      // A known-in-motion camera never triggers a rebuild, regardless of the holdoff, so the
      // pick falls back to the windowed, ray-culled path.
      expect(renderSpy).toHaveBeenCalledTimes(2);
      expect(renderSpy.mock.calls[1][3]).toBe(ray);
    });

    test('forceWindowedPick bypasses the cache', async () => {
      const { renderSpy } = setupPickerHelperMocks(renderedNodes);
      const picker = new PointCloudOctreePicker(createMockRenderer());
      const params = { forceWindowedPick: true };

      await picker.pick(camera, ray, [octree], params);
      await picker.pick(camera, ray, [octree], params);

      expect(renderSpy).toHaveBeenCalledTimes(2);
      expect(renderSpy.mock.calls[0][3]).toBe(ray);
      expect(renderSpy.mock.calls[1][3]).toBe(ray);
    });
  });
});
