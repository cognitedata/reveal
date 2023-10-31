import isArray from 'lodash/isArray';
import isEmpty from 'lodash/isEmpty';
import isObject from 'lodash/isObject';

export function toFlatPropertyMap(object: object, keySeparator = '.') {
  const flattenRecursive = (
    object: object,
    parentProperty?: string,
    accumulator: Record<string, unknown> = {}
  ): Record<string, unknown> => {
    for (const [key, value] of Object.entries(object)) {
      const property = parentProperty
        ? `${parentProperty}${keySeparator}${key}`
        : key;

      if ((value && typeof value === 'object') || Array.isArray(value)) {
        flattenRecursive(value, property, accumulator);
      } else {
        accumulator[property] = value;
      }
    }
    return accumulator;
  };

  return flattenRecursive(object);
}

export const isObjectEmpty = (
  object?: Record<string, unknown>
): object is undefined => {
  if (isEmpty(object) || object === undefined || !isObject(object)) {
    return true;
  }

  const isAllPropertiesInObjectEmpty = Object.keys(object).every((key) => {
    const value = object[key];

    return (
      value === undefined ||
      value === null ||
      ((isObject(value) || isArray(value)) && isEmpty(value))
    );
  });

  return isAllPropertiesInObjectEmpty;
};
