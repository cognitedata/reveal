import { ViewMode } from './types';

export const ADD_SELECTED_COLUMN = 'SEARCH_ADD_SELECTED_COLUMN';
export const REMOVE_SELECTED_COLUMN = 'SEARCH_REMOVE_SELECTED_COLUMN';
export const SET_SELECTED_COLUMN = 'SEARCH_SET_SELECTED_COLUMN';

export const SELECT_DOCUMENT_IDS = 'SELECT_DOCUMENT_IDS';
export const UNSELECT_DOCUMENT_IDS = 'UNSELECT_DOCUMENT_IDS';

export const SET_EXTRACT_PARENT_FOLDER_PATH = 'SET_EXTRACT_PARENT_FOLDER_PATH';
export const CLEAR_EXTRACT_PARENT_FOLDER_PATH =
  'CLEAR_EXTRACT_PARENT_FOLDER_PATH';

// Ui related
export const SET_VIEWMODE = 'SEARCH_SET_VIEWMODE';

export interface SelectDocumentIds {
  type: typeof SELECT_DOCUMENT_IDS;
  ids: string[];
}

export interface UnselectDocumentIds {
  type: typeof UNSELECT_DOCUMENT_IDS;
  ids: string[];
}

export interface SetExtractParentFolderPath {
  type: typeof SET_EXTRACT_PARENT_FOLDER_PATH;
  path: string;
}

export interface ClearExtractParentFolderPath {
  type: typeof CLEAR_EXTRACT_PARENT_FOLDER_PATH;
}

interface AddSelectedColumn {
  type: typeof ADD_SELECTED_COLUMN;
  column: string;
}

interface RemoveSelectedColumn {
  type: typeof REMOVE_SELECTED_COLUMN;
  column: string;
}

interface SetSelectedColumn {
  type: typeof SET_SELECTED_COLUMN;
  columns: string[];
}

interface SetViewmode {
  type: typeof SET_VIEWMODE;
  viewMode: ViewMode;
}

export type DocumentAction =
  | SelectDocumentIds
  | UnselectDocumentIds
  | SetExtractParentFolderPath
  | ClearExtractParentFolderPath
  | AddSelectedColumn
  | RemoveSelectedColumn
  | SetSelectedColumn
  | SetViewmode;
