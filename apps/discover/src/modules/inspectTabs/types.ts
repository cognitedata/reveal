import { SavedSearchContent } from '../../domain/savedSearches/types';

import { MODULES } from './constants';

export type SearchInput = string;
export type NumericRange = number[];
export type MultiSelect = string[];
export type SelectedMap = { [key: string]: boolean };
export type DataError = { message: string; items?: string[] };
export type Errors = { [key: string]: DataError[] };

export interface InspectTabsState {
  nds: {
    riskType: MultiSelect;
    severity: MultiSelect;
    probability: MultiSelect;
  };
  npt: {
    searchPhrase: SearchInput;
    duration: NumericRange;
    nptCode: MultiSelect;
    nptDetailCode: MultiSelect;
  };
  log: {
    selectedIds: SelectedMap;
  };
  trajectory: {
    selectedIds: SelectedMap;
    selectedWellboreIds: SelectedMap;
  };
  casing: {
    selectedIds: SelectedMap;
  };
  relatedDocuments: {
    filters: SavedSearchContent;
  };
  // Errors in data fetching and processing for overview tabs
  errors: Errors;
}

export type FilterValues =
  | NumericRange
  | MultiSelect
  | SelectedMap
  | SavedSearchContent;

export interface InspectTabsAction {
  type: FilterDataActionsType;
  payload?: FilterValues | Errors;
}

export type Filter = {
  filterModule: typeof MODULES[keyof typeof MODULES];
  filterName: string;
};

type FilterDataActionsType =
  | typeof SET_ERRORS
  | typeof RESET_ERRORS
  | typeof SET_NDS_PROBABILITY
  | typeof SET_NDS_SEVERITY
  | typeof SET_NPT_CODE
  | typeof SET_NPT_DETAIL_CODE
  | typeof SET_NPT_SEARCH_PHRASE
  | typeof SET_NDS_RISK_TYPE
  | typeof SET_NPT_DURATION
  | typeof SET_SELECTED_LOG_IDS
  | typeof SET_SELECTED_TRAJECTORY_IDS
  | typeof SET_SELECTED_TRAJECTORY_WELLBORE_IDS
  | typeof SET_RELATED_DOCUMENTS_FILTERS;

export const SET_ERRORS = 'SET_ERRORS';
export const RESET_ERRORS = 'RESET_ERRORS';

// NDS
export const SET_NDS_RISK_TYPE = 'SET_NDS_RISK_TYPE';
export const SET_NDS_PROBABILITY = 'SET_NDS_PROBABILITY';
export const SET_NDS_SEVERITY = 'SET_NDS_SEVERITY';

// NPT
export const SET_NPT_CODE = 'SET_NPT_CODE';
export const SET_NPT_DETAIL_CODE = 'SET_NPT_DETAIL_CODE';
export const SET_NPT_SEARCH_PHRASE = 'SET_NPT_SEARCH_PHRASE';
export const SET_NPT_DURATION = 'SET_NPT_DURATION';

export const SET_SELECTED_LOG_IDS = 'SET_SELECTED_LOG_IDS';
export const SET_SELECTED_TRAJECTORY_IDS = 'SET_SELECTED_TRAJECTORY_IDS';
export const SET_SELECTED_TRAJECTORY_WELLBORE_IDS =
  'SET_SELECTED_TRAJECTORY_WELLBORE_IDS';
export const SET_RELATED_DOCUMENTS_FILTERS = 'SET_RELATED_DOCUMENTS_FILTERS';
