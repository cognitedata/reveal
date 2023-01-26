import { OptionType } from '@cognite/cogs.js';
import { NIL_FILTER_VALUE } from '@data-exploration-lib/domain-layer';

import isString from 'lodash/isString';
import isUndefined from 'lodash/isUndefined';
import { OptionValue } from '../SearchNew/Filters/types';

export const isNilOption = <ValueType>({ value }: OptionType<ValueType>) => {
  if (!isUndefined(value) && isString(value) && value === NIL_FILTER_VALUE) {
    return true;
  }
  return false;
};

export const getValue = <ValueType>(
  value?: OptionValue<ValueType>[],
  values?: ValueType[]
): OptionType<ValueType>[] | undefined => {
  if (value) {
    return value as OptionType<ValueType>[];
  }

  return values?.map((el) => ({
    label: String(el),
    value: el,
  }));
};
