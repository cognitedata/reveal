import { useReducer } from 'react';

import {
  FilterResourceType,
  FilterState,
  getCategoryValues,
} from '@data-exploration-lib/core';

const initialState: FilterState = {
  common: {},
  asset: {},
  timeseries: {},
  file: {},
  document: {},
  sequence: {},
  event: {},
};

type Action = {
  type: keyof FilterState;
  clear?: boolean;
  value: FilterState[keyof FilterState];
};

function updateFilters<T>(
  currentFilter: FilterState,
  key: keyof FilterState,
  newValue: T
) {
  return {
    ...currentFilter,
    [key]: {
      ...currentFilter[key],
      ...newValue,
    },
  };
}

function clearFilter(currentFilter: FilterState, key: keyof FilterState) {
  return {
    ...currentFilter,
    [key]: {},
  };
}

function reducer(state: FilterState, action: Action) {
  const { value: nextValue, type, clear } = action;

  if (clear) return clearFilter(state, type);

  const { common, specific } = getCategoryValues(nextValue);

  if (common) return updateFilters(state, 'common', common);
  else return updateFilters(state, type, specific);
}

export const useFilterState = (initialFilter: Partial<FilterState> = {}) => {
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    ...initialFilter,
  });

  const setter = (
    resourceType: FilterResourceType,
    nextValue: FilterState[keyof FilterState]
  ) => {
    return dispatch({ value: nextValue, type: resourceType as any });
  };

  const resetter = (resourceType: FilterResourceType) => {
    dispatch({ clear: true, type: resourceType as any, value: {} });
  };
  return { state, setter, resetter };
};
