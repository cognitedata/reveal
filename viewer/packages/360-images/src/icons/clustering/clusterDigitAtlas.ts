/*!
 * Copyright 2026 Cognite AS
 */

export const CLUSTER_DIGIT_GLYPHS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '+'] as const;
export const CLUSTER_DIGIT_PLUS_INDEX = 10;
export const CLUSTER_DIGIT_UNUSED = 11;
export const CLUSTER_ATLAS_COLUMNS = 4;
export const CLUSTER_DIGIT_CELL_SIZE = 256;
export const CLUSTER_COUNT_CAP = 999;

export type EncodedClusterDigits = {
  digits: [number, number, number, number];
  digitCount: number;
};

/**
 * Packs a cluster count into atlas glyph indices.
 * Counts above 999 become `999+`.
 */
export function encodeClusterDigits(clusterSize: number): EncodedClusterDigits {
  if (!Number.isFinite(clusterSize) || clusterSize <= 0) {
    return { digits: [0, CLUSTER_DIGIT_UNUSED, CLUSTER_DIGIT_UNUSED, CLUSTER_DIGIT_UNUSED], digitCount: 1 };
  }

  if (clusterSize > CLUSTER_COUNT_CAP) {
    return { digits: [9, 9, 9, CLUSTER_DIGIT_PLUS_INDEX], digitCount: 4 };
  }

  const n = Math.floor(clusterSize);
  if (n >= 100) {
    return {
      digits: [Math.floor(n / 100), Math.floor(n / 10) % 10, n % 10, CLUSTER_DIGIT_UNUSED],
      digitCount: 3
    };
  }
  if (n >= 10) {
    return {
      digits: [Math.floor(n / 10), n % 10, CLUSTER_DIGIT_UNUSED, CLUSTER_DIGIT_UNUSED],
      digitCount: 2
    };
  }
  return { digits: [n, CLUSTER_DIGIT_UNUSED, CLUSTER_DIGIT_UNUSED, CLUSTER_DIGIT_UNUSED], digitCount: 1 };
}

export function createDigitAtlasCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = CLUSTER_ATLAS_COLUMNS * CLUSTER_DIGIT_CELL_SIZE;
  canvas.height = CLUSTER_ATLAS_COLUMNS * CLUSTER_DIGIT_CELL_SIZE;
  return canvas;
}

export function atlasCellOrigin(glyphIndex: number): { x: number; y: number } {
  return {
    x: (glyphIndex % CLUSTER_ATLAS_COLUMNS) * CLUSTER_DIGIT_CELL_SIZE,
    y: Math.floor(glyphIndex / CLUSTER_ATLAS_COLUMNS) * CLUSTER_DIGIT_CELL_SIZE
  };
}
