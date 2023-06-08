import isEmpty from 'lodash/isEmpty';
import unset from 'lodash/unset';

import { ValueByDataType } from '../types';

export const removeFilter = (
  currentValue: ValueByDataType,
  removedFilter: { dataType: string; field: string }
): ValueByDataType => {
  const { dataType, field } = removedFilter;

  const newValue = { ...currentValue };

  unset(newValue, `${dataType}.${field}`);

  if (isEmpty(newValue[dataType])) {
    unset(newValue, dataType);
  }

  return newValue;
};
