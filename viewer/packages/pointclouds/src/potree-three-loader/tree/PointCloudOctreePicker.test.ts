/*!
 * Copyright 2024 Cognite AS
 */
import * as THREE from 'three';
import { Mock, It } from 'moq.ts';
import { jest } from '@jest/globals';

import { PointCloudOctreePicker } from './PointCloudOctreePicker';
import { PointCloudOctree } from './PointCloudOctree';
import { PointCloudOctreePickerHelper, IPickState } from './PointCloudOctreePickerHelper';
import { PointCloudMaterial } from '@reveal/rendering';

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
    jest.restoreAllMocks();
  });

  test('picking returns null immediately for empty octrees array', async () => {
    const picker = new PointCloudOctreePicker(createMockRenderer());
    const camera = new THREE.PerspectiveCamera();
    const ray = new THREE.Ray();

    const result = await picker.pick(camera, ray, []);

    expect(result).toBeNull();
  });

  test('picking resets GL state synchronously before awaiting GPU readback', async () => {
    jest.spyOn(PointCloudOctreePickerHelper, 'getPickState').mockReturnValue(createMockPickState());
    jest.spyOn(PointCloudOctreePickerHelper, 'updatePickRenderTarget').mockImplementation(() => {});
    jest.spyOn(PointCloudOctreePickerHelper, 'findHit').mockReturnValue(null);
    jest.spyOn(PointCloudOctreePickerHelper, 'getPickPoint').mockReturnValue(null);
    jest.spyOn(PointCloudOctreePickerHelper.prototype, 'prepareRender').mockImplementation(() => {});
    jest.spyOn(PointCloudOctreePickerHelper.prototype, 'render').mockReturnValue([]);

    let resolveReadPixels!: (pixels: Uint8Array) => void;
    const readPixelsPromise = new Promise<Uint8Array>(resolve => {
      resolveReadPixels = resolve;
    });
    jest.spyOn(PointCloudOctreePickerHelper.prototype, 'readPixelsAsync').mockReturnValue(readPixelsPromise);

    let resetStateCalledBeforeResolve = false;
    jest.spyOn(PointCloudOctreePickerHelper.prototype, 'resetState').mockImplementation(() => {
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
    await pickPromise;
  });
});
