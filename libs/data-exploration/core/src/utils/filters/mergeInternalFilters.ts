import isArray from 'lodash/isArray';
import mergeWith from 'lodash/mergeWith';

import { InternalFilters } from '../../types';

export const internalFilter1 = {
  labels: ['Label 1', 'Label 2'],
  type: 'Type 1',
  sybtype: 'Subtype 1',
};

export const mergeInternalFilters = <T extends InternalFilters>(
  objectFilter: T,
  sourceFilter: T
) => {
  const resultFilter = { ...objectFilter };

  return mergeWith(resultFilter, sourceFilter, (objectValue, sourceValue) => {
    if (isArray(objectValue)) {
      return objectValue.concat(sourceValue);
    }
    return sourceValue;
  });
};
