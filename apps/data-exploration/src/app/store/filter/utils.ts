import { globalFilterAtom } from '@data-exploration-app/store/filter';
import {
  GlobalFilter,
  GlobalFilterKeys,
} from '@data-exploration-app/store/filter/types';
import { InternalCommonFilters } from '@data-exploration-lib/core';
import { COMMON_FILTER_KEYS } from '@data-exploration-lib/domain-layer';
import includes from 'lodash/includes';
import isArray from 'lodash/isArray';
import { DefaultValue, GetRecoilValue, SetRecoilState } from 'recoil';

const isCommonKey = (key: string) => includes(COMMON_FILTER_KEYS, key);

const getCategoryValues = <T>(newValue: T) => {
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

const updateFilters = <T>(
  currentFilters: GlobalFilter,
  key: GlobalFilterKeys,
  newValue: T
) => {
  return {
    ...currentFilters,
    filters: {
      ...currentFilters.filters,
      [key]: {
        ...currentFilters.filters[key],
        ...newValue,
      },
    },
  };
};

const clearFilters = (currentFilters: GlobalFilter, key: GlobalFilterKeys) => {
  return {
    ...currentFilters,
    filters: {
      ...currentFilters.filters,
      [key]: {},
    },
  };
};

export const defaultFilterSetter =
  (id: GlobalFilterKeys) =>
  <T>(
    { set, get }: { set: SetRecoilState; get: GetRecoilValue },
    newValue: T
  ) => {
    const currentFilters = get(globalFilterAtom);

    if (newValue instanceof DefaultValue) {
      return set(globalFilterAtom, clearFilters(currentFilters, id));
    }

    const { common, specific } = getCategoryValues(newValue);

    if (common) {
      set(globalFilterAtom, updateFilters(currentFilters, 'common', common));
    }

    if (specific) {
      set(globalFilterAtom, updateFilters(currentFilters, id, specific));
    }
  };
