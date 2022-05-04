import { createReducer } from '@reduxjs/toolkit';
import cloneDeep from 'lodash/cloneDeep';
import isEmpty from 'lodash/isEmpty';
import uniq from 'lodash/uniq';

import {
  resetErrors,
  setErrors,
  setNdsProbability,
  setNdsRiskType,
  setNdsSeverity,
  setNptCode,
  setNptDetailCode,
  setNptDuration,
  setNptSearchPhrase,
  setSelectedLogIds,
  setSelectedTrajectoryWellboreIds,
  setSelectedTrajectoryIds,
} from './actions';
import { InspectTabsState, InspectTabsAction, Errors } from './types';

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

const inspectReducerCreator = createReducer(initialState, (builder) => {
  builder
    // NDS
    .addCase(setNdsRiskType, (state, action) => {
      state.nds.riskType = action.payload;
    })
    .addCase(setNdsProbability, (state, action) => {
      state.nds.probability = action.payload;
    })
    .addCase(setNdsSeverity, (state, action) => {
      state.nds.severity = action.payload;
    })
    // NPT
    .addCase(setNptCode, (state, action) => {
      state.npt.nptCode = action.payload;
    })
    .addCase(setNptDetailCode, (state, action) => {
      state.npt.nptDetailCode = action.payload;
    })
    .addCase(setNptSearchPhrase, (state, action) => {
      state.npt.searchPhrase = action.payload;
    })
    .addCase(setNptDuration, (state, action) => {
      state.npt.duration = action.payload;
    }) //
    .addCase(setSelectedLogIds, (state, action) => {
      state.log.selectedIds = { ...state.log.selectedIds, ...action.payload };
    })
    .addCase(setSelectedTrajectoryIds, (state, action) => {
      state.trajectory.selectedIds = {
        ...state.trajectory.selectedIds,
        ...action.payload,
      };
    })
    .addCase(setSelectedTrajectoryWellboreIds, (state, action) => {
      state.trajectory.selectedWellboreIds = {
        ...state.trajectory.selectedWellboreIds,
        ...action.payload,
      };
    })
    .addCase(setErrors, (state, action) => {
      const errorsToUpdate = action.payload as Errors;
      const wellboreIdsToUpdate = Object.keys(errorsToUpdate);
      const updatedWellboreErrors = cloneDeep(state.errors);
      const existingWellboreIds = Object.keys(updatedWellboreErrors);

      if (isEmpty(existingWellboreIds)) {
        state.errors = errorsToUpdate;
        return;
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

      state.errors = updatedWellboreErrors;
    })
    .addCase(resetErrors, (state) => {
      state.errors = {};
    });
});

export const inspectTabs = (
  state: InspectTabsState | undefined,
  action: InspectTabsAction
): InspectTabsState => {
  return inspectReducerCreator(state, action);
};
