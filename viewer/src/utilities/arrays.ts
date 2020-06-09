/*!
 * Copyright 2020 Cognite AS
 */

export function createOffsets(array: Float64Array): Float64Array {
  const offsets = new Float64Array(array.length);
  array.forEach((_, idx) => {
    offsets[idx] = idx > 0 ? offsets[idx - 1] + array[idx - 1] : 0;
  });
  return offsets;
}

export function createOffsetsArray(array: number[]): number[] {
  const offsets = new Array<number>(array.length);
  array.forEach((_, idx) => {
    offsets[idx] = idx > 0 ? offsets[idx - 1] + array[idx - 1] : 0;
  });
  return offsets;
}
