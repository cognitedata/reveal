import keyBy from 'lodash/keyBy';

export const keyByMatchingId = <T extends { matchingId: string }>(
  items: T[]
) => {
  return keyBy(items, 'matchingId');
};
