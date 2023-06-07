import isArray from 'lodash/isArray';
import isEmpty from 'lodash/isEmpty';
import isObject from 'lodash/isObject';

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
