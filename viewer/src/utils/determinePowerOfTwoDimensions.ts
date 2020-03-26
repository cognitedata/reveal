/*!
 * Copyright 2020 Cognite AS
 */

/**
 * Computes minimal power-of-two width and height that holds at least the number of elements provided.
 * This is useful to compute texture sizes.
 */
export function determinePowerOfTwoDimensions(elementCount: number): { width: number; height: number } {
  const width = Math.max(1, ceilToPowerOfTwo(Math.sqrt(elementCount)));
  const height = Math.max(1, ceilToPowerOfTwo(elementCount / width));
  return { width, height };
}

const log2 = Math.log(2);
function ceilToPowerOfTwo(v: number): number {
  return Math.pow(2, Math.ceil(Math.log(v) / log2));
}
