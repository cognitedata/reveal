import isArray from 'lodash/isArray';
import includes from 'lodash/includes';
import { COMMON_FILTER_KEYS, InternalCommonFilters } from '../types';

const isCommonKey = (key: string) => includes(COMMON_FILTER_KEYS, key);

export const getCategoryValues = <T>(newValue: T) => {
  return Object.entries(newValue as Record<string, unknown>)?.reduce(
    (accumulator, [key, value]) => {
      const categoryKey = isCommonKey(key) ? 'common' : 'specific';

      return {
        ...accumulator,
        [categoryKey]: {
          ...accumulator[categoryKey],
          [key]: isArray(value) && value.length === 0 ? undefined : value,
        },
      };
    },
    {} as {
      common?: InternalCommonFilters;
      specific?: T;
    }
  );
};
