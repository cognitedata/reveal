import { HashMap } from '../types';

import { hashString } from './hashString';

export const toHashMap = (strings: string[]): HashMap => {
  return strings.reduce<HashMap>((hashMap, string) => {
    const hashValue = hashString(string);

    return {
      ...hashMap,
      [hashValue]: string,
    };
  }, {});
};
