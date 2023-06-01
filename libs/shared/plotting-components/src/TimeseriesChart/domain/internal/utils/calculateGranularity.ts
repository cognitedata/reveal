/**
 * Calculates the `granularity` for a timeseries request
 *
 * @param domain Domain [utc int, utc int]
 * @param pps points to show
 */

import { DateRange } from '../../../types';

export const calculateGranularity = (
  domain: DateRange | undefined,
  pointsPerSeries: number
) => {
  if (!domain) {
    return '100d';
  }

  const domainMinValue = domain[0].valueOf();
  const domainMaxValue = domain[1].valueOf();

  const timeDifferenceSeconds = (domainMaxValue - domainMinValue) / 1000;
  const targetGranularitySeconds = Math.ceil(
    timeDifferenceSeconds / pointsPerSeries
  );
  const targetGranularityMinutes = Math.ceil(targetGranularitySeconds / 60);
  const targetGranularityHours = Math.ceil(targetGranularityMinutes / 60);
  const targetGranularityDays = Math.ceil(targetGranularityHours / 24);

  // Seconds
  if (targetGranularitySeconds <= 60) {
    return `${targetGranularitySeconds}s`;
  }

  // Minutes
  if (targetGranularityMinutes <= 60) {
    return `${targetGranularityMinutes}m`;
  }

  // Hours
  if (targetGranularityHours <= 24) {
    return `${targetGranularityHours}h`;
  }

  // Days
  if (targetGranularityDays <= 100) {
    return `${targetGranularityDays}d`;
  }

  return '100d';
};
