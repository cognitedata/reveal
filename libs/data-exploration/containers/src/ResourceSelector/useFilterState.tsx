import { FilterResourceType, FilterState } from '@data-exploration-lib/core';

import { useReducer } from 'react';

const initialState: FilterState = {
  common: {},
  asset: {},
  timeseries: {},
  file: {},
  sequence: {},
  event: {},
  document: {},
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

  return updateFilters(state, type, nextValue);
}

export const useFilterState = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

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
