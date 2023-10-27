import { ValueType } from '@fdx/shared/types/filters';
import isString from 'lodash/isString';
import { useDebounce } from 'use-debounce';

export const useDeboucedValue = (value?: ValueType) => {
  const [debouncedValue] = useDebounce(value, 300);

  if (isString(debouncedValue)) {
    return debouncedValue;
  }

  return '';
};
