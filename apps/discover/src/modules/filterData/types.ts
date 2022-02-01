import { MODULES } from './constants';

export type SearchInput = string;
export type NumericRange = number[];
export type MultiSelect = string[];
export type SelectedMap = { [key: string]: boolean };

export interface FilterDataState {
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
}

export type FilterValues = NumericRange | MultiSelect | SelectedMap;
export interface FilterDataAction {
  type: FilterDataActionsType;
  filter: Filter;
  values: FilterValues;
}

export type Filter = {
  filterModule: typeof MODULES[keyof typeof MODULES];
  filterName: string;
};

type FilterDataActionsType =
  | typeof SET_FILTER_VALUES
  | typeof SET_SELECTED_ID_MAP;

export const SET_FILTER_VALUES = 'SET_FILTER_VALUES';
export const SET_SELECTED_ID_MAP = 'SET_SELECTED_ID_MAP';
