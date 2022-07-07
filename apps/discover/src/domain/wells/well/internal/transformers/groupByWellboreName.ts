import groupBy from 'lodash/groupBy';

export const groupByWellboreName = <T extends { wellboreName: string }>(
  items: T[]
): Record<string, T[]> => groupBy(items, 'wellboreName');

export const groupByWellboreMatchingId = <
  T extends { wellboreMatchingId: string }
>(
  items: T[]
): Record<string, T[]> => groupBy(items, 'wellboreMatchingId');
