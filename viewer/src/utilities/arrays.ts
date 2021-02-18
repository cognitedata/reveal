/*!
 * Copyright 2021 Cognite AS
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

/**
 * Shifts values in an array to the right. The far right elements of the array is lost.
 * @param array Array to shift values inplace.
 * @param index First element to shift to the right
 * @param shiftCount How far to shift all affected elements.
 * @returns The input array which has been modified.
 */
export function shiftValuesRight<T>(array: T[], index: number, shiftCount: number): T[] {
  if (index + shiftCount >= array.length) {
    throw new Error('Cannot shift values outside the array');
  }
  if (index < 0) {
    throw new Error('Negative index');
  }
  if (shiftCount < 0) {
    throw new Error('Cannot shift values with a negative offset');
  }

  for (let i = array.length - shiftCount - 1; i >= index; --i) {
    array[i + shiftCount] = array[i];
  }
  return array;
}

export function binarySearch(haystack: number[], needle: number, haystackCount?: number): number {
  let low = 0;
  const lastHaystackIndex =
    haystackCount === undefined ? haystack.length - 1 : Math.min(haystackCount - 1, haystack.length - 1);
  let high = lastHaystackIndex;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2.0);
    const guess = haystack[mid];

    if (guess === needle) {
      return mid;
    }

    if (guess > needle) {
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }

  return -low - 1; //if not found
}

export function binarySearchLastIndexOf(haystack: number[], needle: number, haystackCount?: number): number {
  const lastHaystackIndex =
    haystackCount === undefined ? haystack.length - 1 : Math.min(haystackCount - 1, haystack.length - 1);
  let index = binarySearch(haystack, needle, haystackCount);
  // When there are a series of equal values we want to return the last index
  while (index >= 0 && index <= lastHaystackIndex && haystack[index + 1] === needle) {
    index++;
  }
  return index;
}

export function binarySearchFirstIndexOf(haystack: number[], needle: number, haystackCount?: number): number {
  let index = binarySearch(haystack, needle, haystackCount);
  // When there are a series of equal values we want to return the first index
  while (index > 0 && haystack[index - 1] === needle) {
    index--;
  }
  return index;
}
