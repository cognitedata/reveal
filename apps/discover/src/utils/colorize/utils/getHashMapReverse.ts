import { HashMap, HashMapReverse } from '../types';

export const getHashMapReverse = (hashMap: HashMap): HashMapReverse => {
  return Object.entries(hashMap).reduce<HashMapReverse>(
    (reverseMap, [hashValue, properties]) => {
      return {
        ...reverseMap,
        ...reverseHashMapKeyValuePair(Number(hashValue), properties),
      };
    },
    {}
  );
};

export const reverseHashMapKeyValuePair = (
  hashValue: number,
  properties: string[]
): HashMapReverse => {
  return properties.reduce<HashMapReverse>((reverseMap, property) => {
    return {
      ...reverseMap,
      [property]: hashValue,
    };
  }, {});
};
