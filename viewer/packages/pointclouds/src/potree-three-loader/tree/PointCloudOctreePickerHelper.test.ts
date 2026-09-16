/*!
 * Copyright 2022 Cognite AS
 */
import type { WebGLRenderTarget, WebGLRenderer } from 'three';
import { PerspectiveCamera, Vector3 } from 'three';
import type { RenderedNode } from './PointCloudOctreePickerHelper';
import { PointCloudOctreePickerHelper } from './PointCloudOctreePickerHelper';

import { Mock, It, Times } from 'moq.ts';

import { vi } from 'vitest';

describe('PointCloudOctreePickerHelper', () => {
  test('findHit() returns point data from pixel buffer with 1 non-zero value', () => {
    const dummyNode: RenderedNode = new Mock<RenderedNode>().object();

    const pickWindowSize = 2;
    // 2x2 pixel buffer with 1 non-zero value and two "kinds" of zero values (with 0 and 1 alpha)
    const dummyPixels: Uint8Array = new Uint8Array([15, 0, 0, 2, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 0]);
    const dummyCamera = new PerspectiveCamera();
    dummyCamera.position.set(1, 0, 0);

    vi.spyOn(PointCloudOctreePickerHelper, 'getPointPosition').mockImplementation(() => {
      return new Vector3();
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
    const dummyCamera = new PerspectiveCamera();
    dummyCamera.position.set(1, 0, 0);

    vi.spyOn(PointCloudOctreePickerHelper, 'getPointPosition').mockImplementation((_nodes, _pcIndex, pIndex) => {
      const result = new Vector3();
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
    const rendererMock = new Mock<WebGLRenderer>();
    const renderTargetMock = new Mock<WebGLRenderTarget>();
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
    const result = await helper.readPixelsAsync(pickX, pickY, pickWndSize, pickWndSize, renderTargetMock.object());

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

  test('computeBitSplit() returns the legacy 8 bits for small node sets', () => {
    expect(PointCloudOctreePickerHelper.computeBitSplit(10, 1000)).toBe(8);
    expect(PointCloudOctreePickerHelper.computeBitSplit(254, 16_000_000)).toBe(8);
  });

  test('computeBitSplit() grows the node bits when the node set exceeds the legacy capacity', () => {
    expect(PointCloudOctreePickerHelper.computeBitSplit(255, 1000)).toBe(9);
    expect(PointCloudOctreePickerHelper.computeBitSplit(1000, 4_000_000)).toBe(10);
  });

  test('computeBitSplit() returns undefined when node and point counts cannot share 32 bits', () => {
    // 1000 nodes need 10 node bits, leaving 22 bits = 4_194_304 points per node.
    expect(PointCloudOctreePickerHelper.computeBitSplit(1000, 4_194_304)).toBe(10);
    expect(PointCloudOctreePickerHelper.computeBitSplit(1000, 4_194_305)).toBeUndefined();
  });

  test('decodePackedPixel() roundtrips, including values with the sign bit set', () => {
    expect(PointCloudOctreePickerHelper.decodePackedPixel(pack(1, 2, 8), 8)).toEqual({ nodeIndex: 1, pointIndex: 2 });
    expect(PointCloudOctreePickerHelper.decodePackedPixel(pack(200, 12345, 8), 8)).toEqual({
      nodeIndex: 200,
      pointIndex: 12345
    });
    expect(PointCloudOctreePickerHelper.decodePackedPixel(pack(600, 5, 10), 10)).toEqual({
      nodeIndex: 600,
      pointIndex: 5
    });
    expect(PointCloudOctreePickerHelper.decodePackedPixel(pack(4000, 1_000_000, 12), 12)).toEqual({
      nodeIndex: 4000,
      pointIndex: 1_000_000
    });
  });

  test('findHit() decodes node indices wider than 8 bits', () => {
    const dummyNode: RenderedNode = new Mock<RenderedNode>().object();
    const nodeIndexBits = 10;
    const pickWindowSize = 3;
    const ibuffer = new Uint32Array(pickWindowSize * pickWindowSize);
    ibuffer[4] = pack(600, 5, nodeIndexBits);
    const pixels = new Uint8Array(ibuffer.buffer);
    const dummyCamera = new PerspectiveCamera();

    vi.spyOn(PointCloudOctreePickerHelper, 'getPointPosition').mockImplementation(() => new Vector3());

    expect(
      PointCloudOctreePickerHelper.findHit(pixels, pickWindowSize, [dummyNode], dummyCamera, nodeIndexBits)
    ).toStrictEqual({
      pIndex: 5,
      pcIndex: 599
    });
  });

  test('findHitInBuffer() finds hits in a window of a larger buffer and ignores hits outside it', () => {
    const dummyNode: RenderedNode = new Mock<RenderedNode>().object();
    const width = 16;
    const height = 8;
    const ibuffer = new Uint32Array(width * height);
    ibuffer[0] = pack(2, 7, 8); // Outside the search window.
    ibuffer[10 + 5 * width] = pack(1, 3, 8);
    const dummyCamera = new PerspectiveCamera();

    vi.spyOn(PointCloudOctreePickerHelper, 'getPointPosition').mockImplementation(() => new Vector3());

    const hit = PointCloudOctreePickerHelper.findHitInBuffer(
      ibuffer,
      width,
      height,
      10,
      5,
      5,
      [dummyNode],
      dummyCamera,
      8
    );

    expect(hit).toStrictEqual({ pIndex: 3, pcIndex: 0 });
  });

  test('findHitInBuffer() clamps the search window to the buffer bounds', () => {
    const dummyNode: RenderedNode = new Mock<RenderedNode>().object();
    const width = 16;
    const height = 8;
    const ibuffer = new Uint32Array(width * height);
    ibuffer[0] = pack(1, 0, 8);
    const dummyCamera = new PerspectiveCamera();

    vi.spyOn(PointCloudOctreePickerHelper, 'getPointPosition').mockImplementation(() => new Vector3());

    const hit = PointCloudOctreePickerHelper.findHitInBuffer(
      ibuffer,
      width,
      height,
      0,
      0,
      5,
      [dummyNode],
      dummyCamera,
      8
    );

    expect(hit).toStrictEqual({ pIndex: 0, pcIndex: 0 });
  });
});

function pack(nodeIndex: number, pointIndex: number, nodeIndexBits: number): number {
  return nodeIndex * 2 ** (32 - nodeIndexBits) + pointIndex;
}
