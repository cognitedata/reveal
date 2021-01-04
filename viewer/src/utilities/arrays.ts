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
  if (array.length === 0) {
    return [];
  }

  const offsets = new Array<number>(array.length);
  offsets[0] = 0;
  for (let i = 1; i < array.length; i++) {
    offsets[i] = offsets[i - 1] + array[i - 1];
  }
  return offsets;
}
