import { useCallback, useEffect, useReducer } from 'react';

import {
  FilterResourceType,
  FilterState,
  ResourceSelectorFilter,
  getCategoryValues,
} from '@data-exploration-lib/core';

const EMPTY_FILTER_STATE: FilterState = {
  common: {},
  asset: {},
  timeSeries: {},
  file: {},
  document: {},
  sequence: {},
  event: {},
  threeD: {},
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

function clearFilter(
  currentFilter: FilterState,
  key: keyof FilterState,
  value?: FilterState[keyof FilterState]
) {
  return {
    ...currentFilter,
    [key]: value ?? {},
  };
}

function reducer(state: FilterState, action: Action) {
  const { value: nextValue, type, clear } = action;

  if (clear) return clearFilter(state, type, nextValue);

  const { common, specific } = getCategoryValues(nextValue);

  if (common) return updateFilters(state, 'common', common);
  else return updateFilters(state, type, specific);
}

export type UseFilterReturnType = {
  filterState: FilterState;
  updateFilterType: (
    resourceType: keyof FilterState,
    value: FilterState[keyof FilterState]
  ) => void;
  resetFilterType: (
    resourceType: keyof FilterState,
    value?: FilterState[keyof FilterState]
  ) => void;
};

export const useFilterState = (
  initialFilter: ResourceSelectorFilter
): UseFilterReturnType => {
  const [filterState, dispatch] = useReducer(reducer, {
    ...EMPTY_FILTER_STATE,
  });

  const updateFilterType: UseFilterReturnType['updateFilterType'] = useCallback(
    (resourceType, nextValue) => {
      return dispatch({
        value: nextValue,
        type: resourceType,
      });
    },
    [dispatch]
  );

  // Update the filter state when the initial filter changes
  useEffect(() => {
    Object.entries(initialFilter).forEach(([key, value]) => {
      updateFilterType(key as keyof FilterState, value);
    });
  }, [initialFilter, updateFilterType]);

  const resetFilterType = useCallback(
    (
      resourceType: FilterResourceType,
      value?: FilterState[keyof FilterState]
    ) => {
      dispatch({
        clear: true,
        type: resourceType,
        value: value || {},
      });
    },
    [dispatch]
  );

  return { filterState, updateFilterType, resetFilterType };
};
