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

type FilterStateKey = keyof FilterState;

type UpdateFilterAction = {
  type: 'UPDATE_FILTER';
  filterStateKey: FilterStateKey;
  value: FilterState[FilterStateKey];
};

type ResetFilterAction = {
  type: 'RESET_FILTER';
  filterStateKey: FilterStateKey;
  value?: FilterState[FilterStateKey];
};

type ResetAllFiltersAction = {
  type: 'RESET_ALL_FILTERS';
};

type Action = UpdateFilterAction | ResetFilterAction | ResetAllFiltersAction;

function updateFilters<T>(
  currentFilter: FilterState,
  filterStateKey: FilterStateKey,
  newValue: T
) {
  return {
    ...currentFilter,
    [filterStateKey]: {
      ...currentFilter[filterStateKey],
      ...newValue,
    },
  };
}

function reducer(state: FilterState, action: Action) {
  switch (action.type) {
    case 'UPDATE_FILTER': {
      const { common, specific } = getCategoryValues(action.value);
      if (common) {
        return updateFilters(state, 'common', common);
      }

      return updateFilters(state, action.filterStateKey, specific);
    }

    case 'RESET_FILTER': {
      return {
        ...state,
        [action.filterStateKey]: action.value ?? {},
      };
    }

    case 'RESET_ALL_FILTERS': {
      return {
        ...EMPTY_FILTER_STATE,
      };
    }
  }
}

export type UseFilterReturnType = {
  filterState: FilterState;
  updateFilterType: (
    filterStateKey: FilterStateKey,
    value: FilterState[FilterStateKey]
  ) => void;
  resetFilterType: (
    filterStateKey: FilterStateKey,
    value?: FilterState[FilterStateKey]
  ) => void;
};

export const useFilterState = (
  initialFilter: ResourceSelectorFilter
): UseFilterReturnType => {
  const [filterState, dispatch] = useReducer(reducer, {
    ...EMPTY_FILTER_STATE,
  });

  const updateFilterType: UseFilterReturnType['updateFilterType'] = useCallback(
    (filterStateKey, nextValue) => {
      return dispatch({
        type: 'UPDATE_FILTER',
        value: nextValue,
        filterStateKey: filterStateKey,
      });
    },
    [dispatch]
  );

  // Update the filter state when the initial filter changes
  useEffect(() => {
    dispatch({
      type: 'RESET_ALL_FILTERS',
    });

    Object.entries(initialFilter).forEach(([key, value]) => {
      updateFilterType(key as FilterStateKey, value);
    });
  }, [initialFilter, updateFilterType]);

  const resetFilterType = useCallback(
    (
      filterStateKey: FilterResourceType,
      value?: FilterState[FilterStateKey]
    ) => {
      dispatch({
        type: 'RESET_FILTER',
        filterStateKey: filterStateKey,
        value: value || {},
      });
    },
    [dispatch]
  );

  return { filterState, updateFilterType, resetFilterType };
};
