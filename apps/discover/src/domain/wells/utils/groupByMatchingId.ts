import groupBy from 'lodash/groupBy';

export const groupByMatchingId = <T extends { matchingId: string }>(
  items: T[]
) => {
  return groupBy(items, 'matchingId');
};
