/*!
 * Copyright 2026 Cognite AS
 */

import {
  atlasCellOrigin,
  CLUSTER_ATLAS_COLUMNS,
  CLUSTER_COUNT_CAP,
  CLUSTER_DIGIT_CELL_SIZE,
  CLUSTER_DIGIT_PLUS_INDEX,
  CLUSTER_DIGIT_UNUSED,
  createDigitAtlasCanvas,
  encodeClusterDigits
} from './clusterDigitAtlas';

describe(encodeClusterDigits.name, () => {
  test('encodes single, double, and triple digit counts', () => {
    expect(encodeClusterDigits(1)).toEqual({
      digits: [1, CLUSTER_DIGIT_UNUSED, CLUSTER_DIGIT_UNUSED, CLUSTER_DIGIT_UNUSED],
      digitCount: 1
    });
    expect(encodeClusterDigits(9)).toEqual({
      digits: [9, CLUSTER_DIGIT_UNUSED, CLUSTER_DIGIT_UNUSED, CLUSTER_DIGIT_UNUSED],
      digitCount: 1
    });
    expect(encodeClusterDigits(10)).toEqual({
      digits: [1, 0, CLUSTER_DIGIT_UNUSED, CLUSTER_DIGIT_UNUSED],
      digitCount: 2
    });
    expect(encodeClusterDigits(42)).toEqual({
      digits: [4, 2, CLUSTER_DIGIT_UNUSED, CLUSTER_DIGIT_UNUSED],
      digitCount: 2
    });
    expect(encodeClusterDigits(100)).toEqual({
      digits: [1, 0, 0, CLUSTER_DIGIT_UNUSED],
      digitCount: 3
    });
    expect(encodeClusterDigits(CLUSTER_COUNT_CAP)).toEqual({
      digits: [9, 9, 9, CLUSTER_DIGIT_UNUSED],
      digitCount: 3
    });
  });

  test('caps counts above 999 as 999+', () => {
    expect(encodeClusterDigits(1000)).toEqual({
      digits: [9, 9, 9, CLUSTER_DIGIT_PLUS_INDEX],
      digitCount: 4
    });
    expect(encodeClusterDigits(1500)).toEqual({
      digits: [9, 9, 9, CLUSTER_DIGIT_PLUS_INDEX],
      digitCount: 4
    });
  });

  test('falls back to 0 for non-positive or non-finite values', () => {
    const zero = { digits: [0, CLUSTER_DIGIT_UNUSED, CLUSTER_DIGIT_UNUSED, CLUSTER_DIGIT_UNUSED], digitCount: 1 };
    expect(encodeClusterDigits(0)).toEqual(zero);
    expect(encodeClusterDigits(-4)).toEqual(zero);
    expect(encodeClusterDigits(Number.NaN)).toEqual(zero);
  });
});

describe(atlasCellOrigin.name, () => {
  test('lays glyphs out in a 4x4 atlas', () => {
    expect(atlasCellOrigin(0)).toEqual({ x: 0, y: 0 });
    expect(atlasCellOrigin(3)).toEqual({ x: 3 * CLUSTER_DIGIT_CELL_SIZE, y: 0 });
    expect(atlasCellOrigin(4)).toEqual({ x: 0, y: CLUSTER_DIGIT_CELL_SIZE });
    expect(atlasCellOrigin(10)).toEqual({
      x: (10 % CLUSTER_ATLAS_COLUMNS) * CLUSTER_DIGIT_CELL_SIZE,
      y: Math.floor(10 / CLUSTER_ATLAS_COLUMNS) * CLUSTER_DIGIT_CELL_SIZE
    });
  });
});

describe(createDigitAtlasCanvas.name, () => {
  test('creates a square atlas large enough for 11 glyphs', () => {
    const canvas = createDigitAtlasCanvas();
    expect(canvas.width).toBe(CLUSTER_ATLAS_COLUMNS * CLUSTER_DIGIT_CELL_SIZE);
    expect(canvas.height).toBe(CLUSTER_ATLAS_COLUMNS * CLUSTER_DIGIT_CELL_SIZE);
  });
});
