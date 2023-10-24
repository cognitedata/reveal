import has from 'lodash/has';
import isString from 'lodash/isString';
import isUndefined from 'lodash/isUndefined';

import { OptionType } from '@cognite/cogs.js';

import { NIL_FILTER_VALUE } from '@data-exploration-lib/domain-layer';

import { OptionValue } from '../types';

export const isNilOption = <ValueType>({ value }: OptionType<ValueType>) => {
  if (!isUndefined(value) && isString(value) && value === NIL_FILTER_VALUE) {
    return true;
  }
  return false;
};

export const formatValue = <ValueType>(
  value?: ValueType[] | OptionValue<ValueType>[]
): OptionType<ValueType>[] | undefined => {
  return value?.map((el) => {
    if (has(el, 'value')) {
      return el as OptionType<ValueType>;
    }

    return {
      label: String(el),
      value: el,
    } as OptionType<ValueType>;
  });
};
