/*!
 * Copyright 2026 Cognite AS
 */

import { Vector4 } from 'three';
import { CadPickBuffer } from './CadPickBuffer';

const WIDTH = 4;
const HEIGHT = 2;

function writePixel(pixels: Uint8Array, pixel: number, rgba: [number, number, number, number]): void {
  pixels.set(rgba, 4 * pixel);
}

function treeIndexRgba(treeIndex: number, modelIndex: number): [number, number, number, number] {
  return [Math.floor(treeIndex / (255 * 255)), Math.floor(treeIndex / 255) % 255, treeIndex % 255, modelIndex + 1];
}

function pixelCenterNdc(x: number, y: number): { x: number; y: number } {
  return { x: ((x + 0.5) / WIDTH) * 2 - 1, y: ((y + 0.5) / HEIGHT) * 2 - 1 };
}

describe(CadPickBuffer.name, () => {
  test('decodeTreeIndex inverts packIntToColor', () => {
    const pixels = new Uint8Array(treeIndexRgba(1_234_567, 0));
    expect(CadPickBuffer.decodeTreeIndex(pixels, 0)).toBe(1_234_567);
  });

  test('decodeModelIndex reads model index + 1 from alpha, 0 meaning no hit', () => {
    expect(CadPickBuffer.decodeModelIndex(new Uint8Array([1, 2, 3, 0]), 0)).toBeUndefined();
    expect(CadPickBuffer.decodeModelIndex(new Uint8Array([1, 2, 3, 1]), 0)).toBe(0);
    expect(CadPickBuffer.decodeModelIndex(new Uint8Array([1, 2, 3, 254]), 0)).toBe(253);
  });

  test('unpackDepth matches the unpackRGBAToDepth vector formulation', () => {
    const pixels = new Uint8Array([12, 200, 37, 99]);
    const expected = new Vector4()
      .fromArray(pixels)
      .multiplyScalar(1 / 255)
      .dot(new Vector4(255 / 256, 255 / 256 / 256, 255 / 256 / (256 * 256), 1 / (256 * 256 * 256)));
    expect(CadPickBuffer.unpackDepth(pixels, 0)).toBeCloseTo(expected, 12);
  });

  test('getHit returns undefined for pixels without any hit', () => {
    const buffer = new CadPickBuffer(WIDTH, HEIGHT);
    expect(buffer.getHit({ x: 0, y: 0 })).toBeUndefined();
  });

  test('getHit returns model, tree index and depth of the pixel under the given coordinates', () => {
    const buffer = new CadPickBuffer(WIDTH, HEIGHT);
    // Pixel (3, 1) -> index 7.
    writePixel(buffer.treeIndexPixels, 7, treeIndexRgba(42, 2));
    writePixel(buffer.depthPixels, 7, [128, 0, 0, 0]);

    const hit = buffer.getHit(pixelCenterNdc(3, 1));

    expect(hit).toEqual({ modelIndex: 2, treeIndex: 42, depth: CadPickBuffer.unpackDepth(buffer.depthPixels, 28) });
    expect(buffer.getHit(pixelCenterNdc(3, 0))).toBeUndefined();
  });

  test('getHit clamps coordinates on the edge of the frame', () => {
    const buffer = new CadPickBuffer(WIDTH, HEIGHT);
    writePixel(buffer.treeIndexPixels, WIDTH * HEIGHT - 1, treeIndexRgba(3, 0));

    expect(buffer.getHit({ x: 1, y: 1 })?.treeIndex).toBe(3);
  });

  test('tree index 0 is a valid hit', () => {
    const buffer = new CadPickBuffer(WIDTH, HEIGHT);
    writePixel(buffer.treeIndexPixels, 0, treeIndexRgba(0, 0));

    expect(buffer.getHit(pixelCenterNdc(0, 0))).toMatchObject({ modelIndex: 0, treeIndex: 0 });
  });
});
