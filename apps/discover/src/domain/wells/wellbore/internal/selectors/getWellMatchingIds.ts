import uniq from 'lodash/uniq';

export const getWellMatchingIds = <T extends { wellMatchingId: string }>(
  items: T[]
) => {
  return uniq(items.map(({ wellMatchingId }) => wellMatchingId));
};
