/**
 * Calculates the `granularity` for a timeseries request
 *
 * @param domain Domain [utc int, utc int]
 * @param pps points to show
 */

import { DateRange } from '../../../types';

export const calculateGranularity = (
  dateRange: DateRange | undefined,
  pps: number
) => {
  if (!dateRange) {
    return 'day';
  }

  const diff = dateRange[1].valueOf() - dateRange[0].valueOf();

  for (let i = 1; i <= 60; i += 1) {
    const points = diff / (1000 * i);
    if (points < pps) {
      return `${i === 1 ? '' : i}s`;
    }
  }
  for (let i = 1; i <= 60; i += 1) {
    const points = diff / (1000 * 60 * i);
    if (points < pps) {
      return `${i === 1 ? '' : i}m`;
    }
  }
  for (let i = 1; i < 24; i += 1) {
    const points = diff / (1000 * 60 * 60 * i);
    if (points < pps) {
      return `${i === 1 ? '' : i}h`;
    }
  }
  for (let i = 1; i < 100; i += 1) {
    const points = diff / (1000 * 60 * 60 * 24 * i);
    if (points < pps) {
      return `${i === 1 ? '' : i}day`;
    }
  }
  return 'day';
};
