import get from 'lodash/get';

import {
  FilterDataState,
  FilterDataAction,
  SET_FILTER_VALUES,
  SET_SELECTED_ID_MAP,
  Filter,
} from './types';

export const initialState: FilterDataState = {
  nds: {
    riskType: [],
    severity: [],
    probability: [],
  },
  npt: {
    searchPhrase: '',
    duration: [0, 0],
    nptCode: [],
    nptDetailCode: [],
  },
  log: {
    filterLogType: {
      id: 1,
      title: 'All',
    },
    selectedIds: {},
  },
  casing: {
    selectedIds: {},
  },
  trajectory: {
    selectedIds: {},
    selectedWellboreIds: {},
  },
};

export function filterData(
  state: FilterDataState = initialState,
  action: FilterDataAction
) {
  const { type, filter = {} as Filter, values } = action;
  const { filterModule, filterName } = filter;
  const module = get(state, filterModule);
  switch (type) {
    case SET_FILTER_VALUES:
      return {
        ...state,
        [filterModule]: {
          ...module,
          [filterName]: values,
        },
      };
    case SET_SELECTED_ID_MAP:
      return {
        ...state,
        [filterModule]: {
          ...module,
          [filterName]: { ...get(module, filterName), ...values },
        },
      };

    default:
      return state;
  }
}
