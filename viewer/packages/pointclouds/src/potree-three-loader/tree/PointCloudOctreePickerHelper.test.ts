/*!
 * Copyright 2022 Cognite AS
 */
import * as THREE from 'three';
import { PointCloudOctreePickerHelper, RenderedNode } from './PointCloudOctreePickerHelper';
import { PointCloudHit } from '../types/types';
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

  describe('estimateNormalFromPickBuffer', () => {
    function makePixelBuffer(
      pickWndSize: number,
      hits: { u: number; v: number; pcIndex: number; pIndex: number }[]
    ): Uint8Array {
      const pixels = new Uint8Array(4 * pickWndSize * pickWndSize);
      const ibuffer = new Uint32Array(pixels.buffer);
      for (const { u, v, pcIndex, pIndex } of hits) {
        const offset = u + v * pickWndSize;
        ibuffer[offset] = pIndex;
        pixels[4 * offset + 3] = pcIndex;
      }
      return pixels;
    }

    test('returns undefined when neighbor pixels are empty', () => {
      const pickWndSize = 15;
      const halfWnd = 7;
      // Only center pixel populated, neighbors are empty
      const pixels = makePixelBuffer(pickWndSize, [{ u: halfWnd, v: halfWnd, pcIndex: 1, pIndex: 0 }]);

      const centerHit: PointCloudHit = { pcIndex: 0, pIndex: 0 };
      const dummyNode = new Mock<RenderedNode>().object();
      jest.spyOn(PointCloudOctreePickerHelper, 'getPointPosition').mockReturnValue(new THREE.Vector3(0, 0, 0));

      const result = PointCloudOctreePickerHelper.estimateNormalFromPickBuffer(
        pixels,
        centerHit,
        pickWndSize,
        [dummyNode],
        new THREE.Vector3(0, 0, 10)
      );
      expect(result).toBeUndefined();
    });

    test('returns normal facing camera from flat XZ surface samples', () => {
      const pickWndSize = 15;
      const halfWnd = 7;
      const offset = PointCloudOctreePickerHelper.NormalSampleOffset;

      // Center at origin, right neighbor at (1,0,0), up neighbor at (0,0,-1) — flat XZ plane
      const pixels = makePixelBuffer(pickWndSize, [
        { u: halfWnd, v: halfWnd, pcIndex: 1, pIndex: 0 }, // center
        { u: halfWnd + offset, v: halfWnd, pcIndex: 1, pIndex: 1 }, // right
        { u: halfWnd, v: halfWnd + offset, pcIndex: 1, pIndex: 2 } // up
      ]);

      const centerHit: PointCloudHit = { pcIndex: 0, pIndex: 0 };
      const dummyNode = new Mock<RenderedNode>().object();
      jest.spyOn(PointCloudOctreePickerHelper, 'getPointPosition').mockImplementation((_nodes, _pcIndex, pIndex) => {
        if (pIndex === 0) return new THREE.Vector3(0, 0, 0);
        if (pIndex === 1) return new THREE.Vector3(1, 0, 0);
        return new THREE.Vector3(0, 0, -1);
      });

      const cameraPos = new THREE.Vector3(0, 10, 0); // camera above
      const result = PointCloudOctreePickerHelper.estimateNormalFromPickBuffer(
        pixels,
        centerHit,
        pickWndSize,
        [dummyNode],
        cameraPos
      );

      expect(result).not.toBeUndefined();
      // Normal should point upward (toward camera)
      expect(result!.y).toBeGreaterThan(0.9);
    });
  });

  test('readPixelsAsync uses readRenderTargetPixelsAsync (not sync readRenderTargetPixels)', async () => {
    const rendererMock = new Mock<THREE.WebGLRenderer>();
    const renderTargetMock = new Mock<THREE.WebGLRenderTarget>();

    rendererMock
      .setup(r => r.readRenderTargetPixelsAsync(It.IsAny(), It.IsAny(), It.IsAny(), It.IsAny(), It.IsAny(), It.IsAny()))
      .returns(Promise.resolve(new Uint8Array(4)));

    const helper = new PointCloudOctreePickerHelper(rendererMock.object());
    const result = await helper.readPixelsAsync(0, 0, 1, renderTargetMock.object());

    expect(result).toBeInstanceOf(Uint8Array);
    rendererMock.verify(
      r => r.readRenderTargetPixelsAsync(It.IsAny(), It.IsAny(), It.IsAny(), It.IsAny(), It.IsAny(), It.IsAny()),
      Times.Once()
    );
  });
});
