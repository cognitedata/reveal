import { SelectedBarData } from 'components/charts/modules/StackedBarChart';
import { TableResults } from 'components/tablev3';
import { NPTEvent } from 'modules/wellSearch/types';

export const SET_INSPECT_SIDEBAR_WIDTH = 'SET_INSPECT_SIDEBAR_WIDTH';
export const SET_COLORED_WELLBORES = 'SET_COLORED_WELLBORES';

export const SET_SELECTED_RELATED_DOCUMENT_COLUMNS =
  'SET_SELECTED_RELATED_DOCUMENT_COLUMNS';

export const SET_NPT_GRAPH_SELECTED_WELLBORE_DATA =
  'SET_NPT_GRAPH_SELECTED_WELLBORE_DATA';
export const CLEAR_NPT_GRAPH_SELECTED_WELLBORE_DATA =
  'CLEAR_NPT_GRAPH_SELECTED_WELLBORE_DATA';

export type BooleanSelection = {
  [key: string]: boolean;
};

export interface WellInspectState {
  inspectSidebarWidth: number;
  coloredWellbores: boolean;
  selectedRelatedDocumentsColumns: BooleanSelection;
  nptGraphSelectedWellboreData: SelectedBarData<NPTEvent>;
}

interface SetInspectSidebarWidth {
  type: typeof SET_INSPECT_SIDEBAR_WIDTH;
  payload: number;
}

interface SetColoredWellbores {
  type: typeof SET_COLORED_WELLBORES;
  payload: boolean;
}

interface SetSelectedRelatedDoucmentColumns {
  type: typeof SET_SELECTED_RELATED_DOCUMENT_COLUMNS;
  payload: TableResults;
}

interface SetNPTGraphSelectedWellboreData {
  type: typeof SET_NPT_GRAPH_SELECTED_WELLBORE_DATA;
  payload: SelectedBarData<NPTEvent>;
}

interface ClearNPTGraphSelectedWellboreData {
  type: typeof CLEAR_NPT_GRAPH_SELECTED_WELLBORE_DATA;
}

export type WellInspectAction =
  | SetInspectSidebarWidth
  | SetColoredWellbores
  | SetSelectedRelatedDoucmentColumns
  | SetNPTGraphSelectedWellboreData
  | ClearNPTGraphSelectedWellboreData;
