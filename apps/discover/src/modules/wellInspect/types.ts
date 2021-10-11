import { TableResults } from 'components/tablev3';

export const SET_INSPECT_SIDEBAR_WIDTH = 'SET_INSPECT_SIDEBAR_WIDTH';

export const SET_SELECTED_RELATED_DOCUMENT_COLUMNS =
  'SET_SELECTED_RELATED_DOCUMENT_COLUMNS';

export type BooleanSelection = {
  [key: string]: boolean;
};

export interface WellInspectState {
  inspectSidebarWidth: number;
  selectedRelatedDocumentsColumns: BooleanSelection;
}

interface SetInspectSidebarWidth {
  type: typeof SET_INSPECT_SIDEBAR_WIDTH;
  payload: number;
}

interface SetSelectedRelatedDoucmentColumns {
  type: typeof SET_SELECTED_RELATED_DOCUMENT_COLUMNS;
  payload: TableResults;
}

export type WellInspectAction =
  | SetInspectSidebarWidth
  | SetSelectedRelatedDoucmentColumns;
