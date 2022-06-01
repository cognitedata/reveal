import { Well } from 'domain/wells/well/internal/types';

import { TableResults } from 'components/Tablev3';
import { SequenceData, WellboreId, WellId } from 'modules/wellSearch/types';

export const SET_PREREQUISITE_DATA = 'WELL_INSPECT_SET_PREREQUISITE_DATA';
export const TOGGLE_SELECTED_WELL = 'WELL_INSPECT_TOGGLE_SELECTED_WELL';
export const TOGGLE_SELECTED_WELLBORE_OF_WELL =
  'WELL_INSPECT_TOGGLE_SELECTED_WELLBORE_OF_WELL';

export const SET_GO_BACK_NAVIGATION_PATH = 'SET_GO_BACK_NAVIGATION_PATH';
export const SET_COLORED_WELLBORES = 'SET_COLORED_WELLBORES';
export const SET_SELECTED_RELATED_DOCUMENT_COLUMNS =
  'SET_SELECTED_RELATED_DOCUMENT_COLUMNS';

export type BooleanSelection = {
  [key: string]: boolean;
};

export type WellSequenceData = Record<WellboreId, SequenceData[]>;

export interface WellInspectState {
  selectedWellIds: BooleanSelection;
  selectedWellboreIds: BooleanSelection;
  goBackNavigationPath: string;
  coloredWellbores: boolean;
  selectedRelatedDocumentsColumns: BooleanSelection;
}

export interface SetPrerequisiteData {
  type: typeof SET_PREREQUISITE_DATA;
  payload: {
    wellIds: WellId[];
    wellboreIds: WellboreId[];
  };
}

export interface ToggleSelectedWell {
  type: typeof TOGGLE_SELECTED_WELL;
  payload: {
    well: Well;
    isSelected: boolean;
  };
}

export interface ToggleSelectedWellboreOfWell {
  type: typeof TOGGLE_SELECTED_WELLBORE_OF_WELL;
  payload: {
    well: Well;
    wellboreId: WellboreId;
    isSelected: boolean;
  };
}

interface SetGoBackNavigationPath {
  type: typeof SET_GO_BACK_NAVIGATION_PATH;
  payload: string;
}
interface SetColoredWellbores {
  type: typeof SET_COLORED_WELLBORES;
  payload: boolean;
}

interface SetSelectedRelatedDoucmentColumns {
  type: typeof SET_SELECTED_RELATED_DOCUMENT_COLUMNS;
  payload: TableResults;
}

export type WellInspectAction =
  | SetPrerequisiteData
  | ToggleSelectedWell
  | ToggleSelectedWellboreOfWell
  | SetGoBackNavigationPath
  | SetColoredWellbores
  | SetSelectedRelatedDoucmentColumns;
