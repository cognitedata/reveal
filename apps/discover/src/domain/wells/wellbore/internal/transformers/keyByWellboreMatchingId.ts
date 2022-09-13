import keyBy from 'lodash/keyBy';

export const keyByWellboreMatchingId = <T extends { matchingId: string }>(
  items: T[]
): Record<string, T> => keyBy(items, 'matchingId');
