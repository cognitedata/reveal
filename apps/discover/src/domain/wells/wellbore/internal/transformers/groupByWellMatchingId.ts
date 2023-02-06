import groupBy from 'lodash/groupBy';

export const groupByWellMatchingId = <T extends { wellMatchingId: string }>(
  items: T[]
) => {
  return groupBy(items, 'wellMatchingId');
};
