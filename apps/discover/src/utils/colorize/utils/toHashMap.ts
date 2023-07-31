import { HashMap } from '../types';

import { hashString } from './hashString';

export const toHashMap = (properties: string[]): HashMap => {
  return properties.reduce<HashMap>((hashMap, property) => {
    const hashValue = hashString(property);
    const currentProperties = hashMap[hashValue] || [];

    return {
      ...hashMap,
      [hashValue]: [...currentProperties, property],
    };
  }, {});
};
