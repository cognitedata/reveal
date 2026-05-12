/*!
 * Copyright 2022 Cognite AS
 */
import * as THREE from 'three';
import { PointCloudOctreePickerHelper, RenderedNode } from './PointCloudOctreePickerHelper';

import { Mock, It, Times } from 'moq.ts';

import { jest } from '@jest/globals';

describe('PointCloudOctreePickerHelper', () => {
  test('findHit() returns point data from pixel buffer with 1 non-zero value', () => {
    const dummyNode: RenderedNode = new Mock<RenderedNode>().object();

    const pickWindowSize = 2;
    // 2x2 pixel buffer with 1 non-zero value and two "kinds" of zero values (with 0 and 1 alpha)
    const dummyPixels: Uint8Array = new Uint8Array([15, 0, 0, 2, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 0]);
    const dummyCamera = new THREE.PerspectiveCamera();
    dummyCamera.position.set(1, 0, 0);

    jest.spyOn(PointCloudOctreePickerHelper, 'getPointPosition').mockImplementation(() => {
      return new THREE.Vector3();
    });

    expect(PointCloudOctreePickerHelper.findHit(dummyPixels, pickWindowSize, [dummyNode], dummyCamera)).toStrictEqual({
      pIndex: 15,
      pcIndex: 1
    });
  });
  test('findHit() returns point closest to pick window center and to the camera', () => {
    const dummyNode: RenderedNode = new Mock<RenderedNode>().object();

    const pickWindowSize = 3;
    // 3x3 pixel buffer with 3 non-zero values
    const dummyPixels: Uint8Array = new Uint8Array([
      1, 0, 0, 22, 0, 0, 0, 255, 0, 0, 0, 255, 3, 0, 0, 22, 2, 0, 0, 22, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0,
      0, 255
    ]);
    const dummyCamera = new THREE.PerspectiveCamera();
    dummyCamera.position.set(1, 0, 0);

    jest.spyOn(PointCloudOctreePickerHelper, 'getPointPosition').mockImplementation((_nodes, _pcIndex, pIndex) => {
      const result = new THREE.Vector3();
      switch (pIndex) {
        case 1:
          result.set(-3, 0, 0);
          break;
        case 2:
          result.set(-2, 0, 0);
          break;
        case 3:
          result.set(-1, 0, 0); // Closest to camera
          break;
        default:
          break;
      }
      return result;
    });

    expect(PointCloudOctreePickerHelper.findHit(dummyPixels, pickWindowSize, [dummyNode], dummyCamera)).toStrictEqual({
      pIndex: 3,
      pcIndex: 21
    });
  });

  test('readPixelsAsync passes correct x, y, size and renderTarget to readRenderTargetPixelsAsync', async () => {
    const pickX = 5;
    const pickY = 10;
    const pickWndSize = 3;
    const rendererMock = new Mock<THREE.WebGLRenderer>();
    const renderTargetMock = new Mock<THREE.WebGLRenderTarget>();
    const expectedPixelCount = 4 * pickWndSize * pickWndSize;

    rendererMock
      .setup(r =>
        r.readRenderTargetPixelsAsync(
          It.Is(v => v === renderTargetMock.object()),
          It.Is(v => v === pickX),
          It.Is(v => v === pickY),
          It.Is(v => v === pickWndSize),
          It.Is(v => v === pickWndSize),
          It.Is(v => v instanceof Uint8Array && v.length === expectedPixelCount)
        )
      )
      .returns(Promise.resolve(new Uint8Array(expectedPixelCount)));

    const helper = new PointCloudOctreePickerHelper(rendererMock.object());
    const result = await helper.readPixelsAsync(pickX, pickY, pickWndSize, renderTargetMock.object());

    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.length).toBe(expectedPixelCount);
    rendererMock.verify(
      r =>
        r.readRenderTargetPixelsAsync(
          It.Is(v => v === renderTargetMock.object()),
          It.Is(v => v === pickX),
          It.Is(v => v === pickY),
          It.Is(v => v === pickWndSize),
          It.Is(v => v === pickWndSize),
          It.IsAny()
        ),
      Times.Once()
    );
  });
});
