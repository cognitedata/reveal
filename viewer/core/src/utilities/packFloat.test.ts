/*!
 * Copyright 2021 Cognite AS
 */

import { packFloat, unpackFloat4 } from './packFloat';

describe('packFloat', () => {
  test('packing (0) should return correct byte representation', () => {
    const packedFloat = packFloat(0);
    expect(packedFloat).toEqual([0, 0, 0, 0]);
  });

  test('packing (1) should return correct byte representation', () => {
    const packedFloat = packFloat(1.0);
    expect(packedFloat).toEqual([63, 128, 0, 0]);
  });

  test('packing (Math.PI) should return correct byte representation', () => {
    const packedFloat = packFloat(Math.PI);
    expect(packedFloat).toEqual([64, 73, 15, 218]);
  });

  test('packing (-1) should return correct byte representation', () => {
    const packedFloat = packFloat(-1.0);
    expect(packedFloat).toEqual([191, 128, 0, 0]);
  });

  test('packing (-Math.PI) should return correct byte representation', () => {
    const packedFloat = packFloat(-Math.PI);
    expect(packedFloat).toEqual([192, 73, 15, 218]);
  });
});

describe('unpackFloat4', () => {
  test('unpacking (0, 0, 0, 0) should return (0)', () => {
    const unpackedFloat = unpackFloat4([0, 0, 0, 0]);

    expect(unpackedFloat).toEqual(0);
  });

  test('unpacking (63, 128, 0, 0) should return (1)', () => {
    const unpackedFloat = unpackFloat4([63, 128, 0, 0]);

    expect(unpackedFloat).toEqual(1.0);
  });

  test('unpacking (64, 73, 15, 218) should return (Math.PI)', () => {
    const unpackedFloat = unpackFloat4([64, 73, 15, 218]);

    //Double precision causes float encoding to lose precision
    expect(Math.abs(unpackedFloat - Math.PI)).toBeLessThan(0.000001);
  });

  test('unpacking (191, 128, 0, 0) should return (-1)', () => {
    const unpackedFloat = unpackFloat4([191, 128, 0, 0]);

    expect(unpackedFloat).toEqual(-1.0);
  });

  test('unpacking (192, 73, 15, 218) should return (-Math.PI)', () => {
    const unpackedFloat = unpackFloat4([192, 73, 15, 218]);

    //Double precision causes float encoding to lose precision
    expect(Math.abs(unpackedFloat + Math.PI)).toBeLessThan(0.000001);
  });
});
