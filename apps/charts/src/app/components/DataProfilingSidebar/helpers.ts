/**
 * Data Profiling helpers
 */

export const convertMillisecondsToSeconds = (
  value: number,
  precision: number = 2,
  unit: string = 's'
): string => `${(value / 1000).toFixed(precision).replace(/\.0+$/, '')}${unit}`;
