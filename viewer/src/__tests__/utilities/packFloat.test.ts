/*!
 * Copyright 2020 Cognite AS
 */

import { packFloat, unpackFloat4 } from '../../utilities/packFloatToVec4';
import * as THREE from 'three';

describe('Pack & unpack floats to 4 byte channels', () => {
  test('packing (0) should return correct byte representation', () => {
    const packedFloat = packFloat(0);

    expect(packedFloat.x).toEqual(0);
    expect(packedFloat.y).toEqual(0);
    expect(packedFloat.z).toEqual(0);
    expect(packedFloat.w).toEqual(0);
  });

  test('packing (1) should return correct byte representation', () => {
    const packedFloat = packFloat(1.0);

    expect(packedFloat.x).toEqual(63);
    expect(packedFloat.y).toEqual(128);
    expect(packedFloat.z).toEqual(0);
    expect(packedFloat.w).toEqual(0);
  });

  test('packing (Math.PI) should return correct byte representation', () => {
    const packedFloat = packFloat(Math.PI);

    expect(packedFloat.x).toEqual(64);
    expect(packedFloat.y).toEqual(73);
    expect(packedFloat.z).toEqual(15);
    expect(packedFloat.w).toEqual(218);
  });

  test('packing (-1) should return correct byte representation', () => {
    const packedFloat = packFloat(-1.0);

    expect(packedFloat.x).toEqual(191);
    expect(packedFloat.y).toEqual(128);
    expect(packedFloat.z).toEqual(0);
    expect(packedFloat.w).toEqual(0);
  });

  test('packing (-Math.PI) should return correct byte representation', () => {
    const packedFloat = packFloat(-Math.PI);

    expect(packedFloat.x).toEqual(192);
    expect(packedFloat.y).toEqual(73);
    expect(packedFloat.z).toEqual(15);
    expect(packedFloat.w).toEqual(218);
  });

  test('unpacking (0, 0, 0, 0) should return (0)', () => {
    const unpackedFloat = unpackFloat4(new THREE.Vector4(0, 0, 0, 0));

    expect(unpackedFloat).toEqual(0);
  });

  test('unpacking (63, 128, 0, 0) should return (1)', () => {
    const unpackedFloat = unpackFloat4(new THREE.Vector4(63, 128, 0, 0));

    expect(unpackedFloat).toEqual(1.0);
  });

  test('unpacking (64, 73, 15, 218) should return (Math.PI)', () => {
    const unpackedFloat = unpackFloat4(new THREE.Vector4(64, 73, 15, 218));

    //Double precision causes float encoding to lose precision
    expect(Math.abs(unpackedFloat - Math.PI)).toBeLessThan(0.000001);
  });

  test('unpacking (191, 128, 0, 0) should return (-1)', () => {
    const unpackedFloat = unpackFloat4(new THREE.Vector4(191, 128, 0, 0));

    expect(unpackedFloat).toEqual(-1.0);
  });

  test('unpacking (192, 73, 15, 218) should return (-Math.PI)', () => {
    const unpackedFloat = unpackFloat4(new THREE.Vector4(192, 73, 15, 218));

    //Double precision causes float encoding to lose precision
    expect(Math.abs(unpackedFloat + Math.PI)).toBeLessThan(0.000001);
  });
});
