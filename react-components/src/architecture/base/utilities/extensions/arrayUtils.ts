import { every } from 'lodash';

/*
 * Utility function for missing array methods
 * Use there function in order top increase the readability of your code
 */

/**
 * Clears an array and keeps the array reference (i.e. does not create a new array).
 *
 * @param array
 */
export function clear<T>(array: T[]): void {
  array.splice(0, array.length);
}

/**
 * Copy array from another array.
 *
 * @param array
 * @param from
 */
export function copy<T>(array: T[], from: T[]): void {
  clear(array);
  array.push(...from);
}

/**
 * Inserts an element at a specific index in an array.
 *
 * @param array
 * @param index
 * @param element
 */
export function insertAt<T>(array: T[], index: number, element: T): void {
  array.splice(index, 0, element);
}

/**
 * Replace the last element in an array.
 *
 * @param array
 * @param element
 */
export function replaceLast<T>(array: T[], element: T): void {
  if (array.length >= 1) {
    array[array.length - 1] = element;
  }
}

/**
 * Removes an element from an array. Return true if removed, otherwise false
 *
 * @param array
 * @param element
 */
export function remove<T>(array: T[], element: T): boolean {
  const index = array.indexOf(element);
  if (index < 0) {
    return false;
  }
  removeAt(array, index);
  return true;
}

/**
 * Removes an element by the index from an array.
 *
 * @param array
 * @param index
 */
export function removeAt<T>(array: T[], index: number): void {
  array.splice(index, 1);
}

/**
 * Swaps two elements in an array in index `i` and `j`.
 *
 * @param array
 * @param i
 * @param j
 */
export function swap(array: unknown[], i: number, j: number): void {
  [array[i], array[j]] = [array[j], array[i]];
}

/**
 * Returns the first element of an array or undefined if empty array.
 *
 * @param array
 * @returns
 */
export function firstElement<T>(array: readonly T[]): T | undefined {
  const length = array.length;
  if (length === 0) {
    return undefined;
  }
  return array[0];
}

/**
 * Returns the last element of an array or undefined if empty array.
 *
 * @param array
 * @returns
 */
export function lastElement<T>(array: readonly T[]): T | undefined {
  const length = array.length;
  if (length === 0) {
    return undefined;
  }
  return array[length - 1];
}

/**
 * Returns true if the two arrays contain the same elements (ignoring order).
 *
 * @param array1
 * @param array2
 * @returns
 */
export function containsTheSameSet<T>(array1: readonly T[], array2: readonly T[]): boolean {
  if (array1.length !== array2.length) {
    return false;
  }
  const set2 = new Set(array2);
  return every(array1, (element) => set2.has(element));
}

/**
 * Counts the number of elements in the given array that satisfy the specified predicate.
 *
 * @param array - The array to search through.
 * @param predicate - A function that tests each element for a condition.
 * @returns The number of elements in the array that satisfy the predicate.
 */
export function count<T>(array: readonly T[], predicate: (t: T) => boolean): number {
  let count = 0;
  for (const item of array) {
    if (predicate(item)) {
      count++;
    }
  }
  return count;
}
