import { HashMap } from '../types';

export const getHashValuesFromHashMap = (hashMap: HashMap): number[] => {
  return Object.keys(hashMap).map(Number);
};
