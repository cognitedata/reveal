import keyBy from 'lodash/keyBy';

export const keyByWellboreName = <T extends { wellboreName: string }>(
  items: T[]
): Record<string, T> => keyBy(items, 'wellboreName');
