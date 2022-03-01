/**
 * Replacement for usage of `Math.min` and `Math.max`.
 * When an array has too many elements, it is throwing a `Maximum call stack size exceeded` error.
 * Lodash `min` and `max` also throwing the same error.
 * In such cases, the following functions can be used.
 */

/**
 * Returns the minimum value of an array.
 */
export const min = (array: number[]): number => {
  return array.reduce(
    (min, value) => Math.min(min, value),
    Number.POSITIVE_INFINITY
  );
};

/**
 * Returns the maximum value of an array.
 */
export const max = (array: number[]): number => {
  return array.reduce(
    (max, value) => Math.max(max, value),
    Number.NEGATIVE_INFINITY
  );
};

/**
 * Returns both minimum and maximum value of an array.
 * Returned as an array [minimum, maximum] respectively.
 */
export const minMax = (array: number[]): [number, number] => {
  return array.reduce(
    ([min, max], value) => [Math.min(min, value), Math.max(max, value)],
    [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]
  );
};
