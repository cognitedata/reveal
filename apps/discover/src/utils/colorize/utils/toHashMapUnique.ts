import { HashMapUnique } from '../types';

import { hashString } from './hashString';

export const toHashMapUnique = (properties: string[]): HashMapUnique => {
  return properties.reduce<HashMapUnique>((hashMap, property) => {
    const hashValue = hashString(property);

    return {
      ...hashMap,
      [hashValue]: property,
    };
  }, {});
};
