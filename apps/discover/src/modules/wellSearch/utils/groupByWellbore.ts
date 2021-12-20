import groupBy from 'lodash/groupBy';

export const groupByWellbore = <T extends { wellboreMatchingId: string }>(
  items: T[]
) => groupBy(items, 'wellboreMatchingId');
