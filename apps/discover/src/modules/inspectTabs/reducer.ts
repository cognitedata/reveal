import cloneDeep from 'lodash/cloneDeep';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import uniq from 'lodash/uniq';

import {
  InspectTabsState,
  InspectTabsAction,
  SET_FILTER_VALUES,
  SET_SELECTED_ID_MAP,
  SET_ERRORS,
  RESET_ERRORS,
  Filter,
  Errors,
} from './types';

export const initialState: InspectTabsState = {
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
    selectedIds: {},
  },
  trajectory: {
    selectedIds: {},
    selectedWellboreIds: {},
  },
  casing: {
    selectedIds: {},
  },
  errors: {},
};

export const inspectTabs = (
  state: InspectTabsState = initialState,
  action?: InspectTabsAction
) => {
  if (!action) {
    return state;
  }

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

    case SET_ERRORS: {
      const errorsToUpdate = values as Errors;
      const wellboreIdsToUpdate = Object.keys(errorsToUpdate);
      const updatedWellboreErrors = cloneDeep(state.errors);
      const existingWellboreIds = Object.keys(updatedWellboreErrors);

      if (isEmpty(existingWellboreIds)) {
        return {
          ...state,
          errors: errorsToUpdate,
        };
      }

      wellboreIdsToUpdate.forEach((wellboreId) => {
        if (existingWellboreIds.includes(wellboreId)) {
          updatedWellboreErrors[wellboreId] = uniq([
            ...updatedWellboreErrors[wellboreId],
            ...errorsToUpdate[wellboreId],
          ]);
        } else {
          updatedWellboreErrors[wellboreId] = uniq([
            ...errorsToUpdate[wellboreId],
          ]);
        }
      });

      return {
        ...state,
        errors: updatedWellboreErrors,
      };
    }

    case RESET_ERRORS:
      return {
        ...state,
        errors: {},
      };

    default:
      return state;
  }
};
