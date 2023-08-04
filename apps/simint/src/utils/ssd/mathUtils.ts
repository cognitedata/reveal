/**
 * Performs Linear Interpolation to predict an intermediary datapoint.
 *
 * @param {number} x0 The x value of the first datapoint.
 * @param {number} y0 The y value of the first datapoint.
 * @param {number} x1 The x value of the second datapoint.
 * @param {number} y1 The y value of the second datapoint.
 * @param {number} xp The x value of the intermediary datapoint.
 * @returns {number} The y value of the intermediary datapoint.
 */
export const linearInterpolation = (
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  xp: number
): number => y0 + ((y1 - y0) / (x1 - x0)) * (xp - x0);

/**
 * Generates an array of equally spaced values.
 *
 * @param {number} start The start value.
 * @param {number} end The end value.
 * @param {number} step The step value.
 * @returns {number[]} The array of equally spaced values.
 */
export const linspace = (start: number, end: number, step: number): number[] =>
  Array.from(
    { length: Math.floor((end - start) / step + 1) },
    (_, index) => start + step * index
  );

/**
 * Constrains a value to not exceed a maximum and minimum value.
 *
 * @param {number} value The value to constrain.
 * @param {number} min The minimum value.
 * @param {number} max The maximum value.
 * @returns {number} The constrained value.
 */
export const constrain = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

/**
 * Calculates the sum of the values in an array.
 *
 * @param {number[]} values The array.
 * @returns {number} The sum of the values.
 */
export const sum = (values: number[]): number =>
  values.reduce((partialSum, value) => partialSum + value, 0);

/**
 * Calculates the mean of the values in an array.
 *
 * @param {number[]} values The array.
 * @returns {number} The mean of the values.
 */
export const mean = (values: number[]): number =>
  values.length ? sum(values) / values.length : 0;

/**
 * Calculates the standard deviation of the values in an array.
 *
 * @param {number[]} values The array.
 * @returns {number} The standard deviation of the values.
 */
export function standardDeviation(values: number[]): number {
  if (!values.length) {
    // Avoid division by 0
    return 0;
  }
  const meanValue: number = mean(values);
  const std = values.reduce(
    (stdSum, value) => stdSum + (value - meanValue) ** 2,
    0
  );
  return Math.sqrt(std / values.length);
}

/**
 * Calculates the slope of the best fit line for the provided x and y arrays.
 *
 * @param {number[]} x The x values.
 * @param {number[]} y The y values.
 * @returns {number} The slope of the best fit line.
 */
export function getLineSlope(x: number[], y: number[]): number {
  const n = y.length;
  if (!n) {
    // Avoid division by 0
    return 0;
  }
  if (x.length !== y.length) {
    throw new Error(
      `Array lengths do not match (x: ${x.length}, y: ${x.length})`
    );
  }
  const sumX = sum(x);
  const sumY = sum(y);
  const sumXtimesY = x.reduce(
    (partialSum, value, index) => partialSum + value * y[index],
    0
  );
  const sumXtimesX = x.reduce(
    (partialSum, value) => partialSum + value * value,
    0
  );

  return (n * sumXtimesY - sumX * sumY) / (n * sumXtimesX - sumX * sumX);
}
