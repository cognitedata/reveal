/* eslint-disable @typescript-eslint/no-explicit-any */
import isEqual from 'lodash/isEqual';
import isPlainObject from 'lodash/isPlainObject';

// Handles deep equality comparisons while considering missing properties as undefined
export const deepEqualWithMissingProperties = (
  obj1: any,
  obj2: any
): boolean => {
  if (isEqual(obj1, obj2)) return true;

  if (Array.isArray(obj1) && Array.isArray(obj2)) {
    if (obj1.length !== obj2.length) return false;
    return obj1.every((item1, index) =>
      deepEqualWithMissingProperties(item1, obj2[index])
    );
  }

  if (!isPlainObject(obj1) || !isPlainObject(obj2)) return false;

  return Object.keys({ ...obj1, ...obj2 }).every((key) =>
    deepEqualWithMissingProperties(obj1[key], obj2[key])
  );
};
