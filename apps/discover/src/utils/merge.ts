import isArray from 'lodash/isArray';
import isNaN from 'lodash/isNaN';
import mergeWith from 'lodash/mergeWith';

/**
 * Merges properties from source and target into a single object.
 *
 * Cases where properties are arrays, source and target values are merged and
 * common values are "squashed" (i.e., removes duplicated values)
 *
 * @param source object
 * @param target object
 * @returns source and target merged
 */
export const mergeUniqueArray = <T extends Record<any, any>>(
  source: T,
  target?: T
) => {
  return mergeWith(source, target, (objValue, srcValue) => {
    if (isArray(objValue)) {
      return [...new Set(objValue.concat(srcValue))];
    }

    if (!isNaN(Number(objValue)) && !isNaN(Number(srcValue))) {
      return Number(objValue) + Number(srcValue);
    }

    return undefined;
  });
};
