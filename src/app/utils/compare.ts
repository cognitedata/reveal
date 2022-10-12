import isObject from 'lodash/isObject';
import isEmpty from 'lodash/isEmpty';
import { isArray } from 'lodash';

export const isObjectEmpty = (object: any) => {
  if (isEmpty(object)) {
    return true;
  }

  const isAllPropertiesInObjectEmpty = Object.keys(object).every(key => {
    const value = object[key];

    return (
      value === undefined ||
      value === null ||
      ((isObject(value) || isArray(value)) && isEmpty(value))
    );
  });

  return isAllPropertiesInObjectEmpty;
};
