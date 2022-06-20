import groupBy from 'lodash/groupBy';

export const groupByWellName = <T extends { wellName: string }>(
  items: T[]
): Record<string, T[]> => groupBy(items, 'wellName');
