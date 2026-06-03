/*!
 * Copyright 2024 Cognite AS
 */
import * as THREE from 'three';
import { Mock, It } from 'moq.ts';
import { vi } from 'vitest';

import { PointCloudOctreePicker } from './PointCloudOctreePicker';
import type { PointCloudOctree } from './PointCloudOctree';
import type { IPickState } from './PointCloudOctreePickerHelper';
import { PointCloudOctreePickerHelper } from './PointCloudOctreePickerHelper';
import type { PointCloudMaterial } from '@reveal/rendering';

const RENDER_TARGET_WIDTH = 128;
const RENDER_TARGET_HEIGHT = 64;
const MINIMAL_PIXEL_BUFFER_SIZE = 4;

function createMockPickState(): IPickState {
  return {
    renderTarget: new Mock<THREE.WebGLRenderTarget>().object(),
    material: new Mock<PointCloudMaterial>().object(),
    scene: new THREE.Scene()
  };
}

function createMockRenderer(): THREE.WebGLRenderer {
  return new Mock<THREE.WebGLRenderer>()
    .setup(r => r.getDrawingBufferSize(It.IsAny()))
    .returns(new THREE.Vector2(RENDER_TARGET_WIDTH, RENDER_TARGET_HEIGHT))
    .object();
}

describe(PointCloudOctreePicker.name, () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('picking returns null immediately for empty octrees array', async () => {
    const picker = new PointCloudOctreePicker(createMockRenderer());
    const camera = new THREE.PerspectiveCamera();
    const ray = new THREE.Ray();

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
    vi.spyOn(PointCloudOctreePickerHelper.prototype, 'readPixelsAsync').mockReturnValue(readPixelsPromise);

    let resetStateCalledBeforeResolve = false;
    vi.spyOn(PointCloudOctreePickerHelper.prototype, 'resetState').mockImplementation(() => {
      resetStateCalledBeforeResolve = true;
    });

    const picker = new PointCloudOctreePicker(createMockRenderer());
    const octree = new Mock<PointCloudOctree>().object();
    const camera = new THREE.PerspectiveCamera();
    const ray = new THREE.Ray();

    // Starting pick() runs the function synchronously up to the first `await readPixelsPromise`.
    // resetState() and readPixelsAsync() are both called before that await.
    const pickPromise = picker.pick(camera, ray, [octree]);

    expect(resetStateCalledBeforeResolve).toBe(true);

    resolveReadPixels(new Uint8Array(MINIMAL_PIXEL_BUFFER_SIZE));
    const result = await pickPromise;
    expect(result).toBeNull();
  });
});
