import { HashMap, HashMapUnique } from '../types';

export const getHashValuesFromHashMap = (
  hashMap: HashMap | HashMapUnique
): number[] => {
  return Object.keys(hashMap).map(Number);
};
