import { SavedSearchContent } from 'domain/savedSearches/types';

import { createAction } from '@reduxjs/toolkit';

import {
  SearchInput,
  MultiSelect,
  NumericRange,
  SelectedMap,
  Errors,
  SET_ERRORS,
  RESET_ERRORS,
  SET_NDS_RISK_TYPE,
  SET_NDS_PROBABILITY,
  SET_NDS_SEVERITY,
  SET_NPT_CODE,
  SET_NPT_DETAIL_CODE,
  SET_NPT_SEARCH_PHRASE,
  SET_NPT_DURATION,
  SET_SELECTED_LOG_IDS,
  SET_SELECTED_TRAJECTORY_IDS,
  SET_SELECTED_TRAJECTORY_WELLBORE_IDS,
  SET_RELATED_DOCUMENTS_FILTERS,
} from './types';

// NDS

export const setNdsRiskType = createAction<MultiSelect>(SET_NDS_RISK_TYPE);
export const setNdsProbability = createAction<MultiSelect>(SET_NDS_PROBABILITY);
export const setNdsSeverity = createAction<MultiSelect>(SET_NDS_SEVERITY);

// NPT
export const setNptCode = createAction<MultiSelect>(SET_NPT_CODE);
export const setNptDetailCode = createAction<MultiSelect>(SET_NPT_DETAIL_CODE);
export const setNptSearchPhrase = createAction<SearchInput>(
  SET_NPT_SEARCH_PHRASE
);
export const setNptDuration = createAction<NumericRange>(SET_NPT_DURATION);

// log
export const setSelectedLogIds =
  createAction<SelectedMap>(SET_SELECTED_LOG_IDS);

// trajectory
export const setSelectedTrajectoryIds = createAction<SelectedMap>(
  SET_SELECTED_TRAJECTORY_IDS
);
export const setSelectedTrajectoryWellboreIds = createAction<SelectedMap>(
  SET_SELECTED_TRAJECTORY_WELLBORE_IDS
);

// related documents
export const setRelatedDocumentsFilters = createAction<SavedSearchContent>(
  SET_RELATED_DOCUMENTS_FILTERS
);

// errors
export const setErrors = createAction<Errors>(SET_ERRORS);
export const resetErrors = createAction(RESET_ERRORS);

export const inspectTabsActions = {
  setNdsRiskType,
  setNdsProbability,
  setNdsSeverity,
  setNptCode,
  setNptDetailCode,
  setNptSearchPhrase,
  setNptDuration,
  setSelectedLogIds,
  setSelectedTrajectoryIds,
  setSelectedTrajectoryWellboreIds,
  setRelatedDocumentsFilters,
  setErrors,
  resetErrors,
};
