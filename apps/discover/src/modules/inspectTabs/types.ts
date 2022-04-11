import { MODULES } from './constants';

export type SearchInput = string;
export type NumericRange = number[];
export type MultiSelect = string[];
export type SelectedMap = { [key: string]: boolean };
export type Error = { value: string };
export type Errors = { [key: string]: Error[] };

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
  // Errors in data fetching and processing for overview tabs
  errors: Errors;
}

export type FilterValues = NumericRange | MultiSelect | SelectedMap;
export interface InspectTabsAction {
  type: FilterDataActionsType;
  filter?: Filter;
  values?: FilterValues | Errors;
}

export type Filter = {
  filterModule: typeof MODULES[keyof typeof MODULES];
  filterName: string;
};

type FilterDataActionsType =
  | typeof SET_FILTER_VALUES
  | typeof SET_SELECTED_ID_MAP
  | typeof SET_ERRORS
  | typeof RESET_ERRORS;

export const SET_FILTER_VALUES = 'SET_FILTER_VALUES';
export const SET_SELECTED_ID_MAP = 'SET_SELECTED_ID_MAP';
export const SET_ERRORS = 'SET_ERRORS';
export const RESET_ERRORS = 'RESET_ERRORS';
