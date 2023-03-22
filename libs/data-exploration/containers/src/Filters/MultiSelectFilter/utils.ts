import { OptionType } from '@cognite/cogs.js';
import { NIL_FILTER_VALUE } from '@data-exploration-lib/domain-layer';

import isString from 'lodash/isString';
import isUndefined from 'lodash/isUndefined';
import has from 'lodash/has';

// TODO: Add unit tests
export const isNilOption = <ValueType>({ value }: OptionType<ValueType>) => {
  if (!isUndefined(value) && isString(value) && value === NIL_FILTER_VALUE) {
    return true;
  }
  return false;
};

// TODO: Add unit tests
export const formatValue = <ValueType>(
  value?:
    | ValueType[]
    | OptionType<ValueType>[]
    | { label?: string; value: ValueType }[]
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
