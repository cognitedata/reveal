import { DocumentType, DocumentResult, ViewMode, Labels } from './types';

// Query
export const SET_SEARCH_FOR_SENSITIVE = 'SEARCH_SET_SEARCH_FOR_SENSITIVE';

// Result
export const SET_RESULTS = 'SEARCH_SET_RESULTS';
export const RESET_RESULTS = 'SEARCH_RESET_RESULTS';

export const SET_SEARCHING = 'SEARCH_SET_SEARCHING';
export const SET_LOADING = 'SEARCH_SET_LOADING';
export const SET_ERROR_MESSAGE = 'SEARCH_SET_ERROR_MESSAGE';

export const ADD_SELECTED_COLUMN = 'SEARCH_ADD_SELECTED_COLUMN';
export const REMOVE_SELECTED_COLUMN = 'SEARCH_REMOVE_SELECTED_COLUMN';
export const SET_SELECTED_COLUMN = 'SEARCH_SET_SELECTED_COLUMN';

export const SET_SELECTED_DOCUMENT = 'SEARCH_SET_SELECTED_DOCUMENT';
export const SET_LABELS = 'SET_LABELS';

export const SELECT_DOCUMENT_IDS = 'SELECT_DOCUMENT_IDS';
export const UNSELECT_DOCUMENT_IDS = 'UNSELECT_DOCUMENT_IDS';

/**
 * When mouse hovered over a document add that document id to state
 */
export const SET_HOVERED_DOCUMENT = 'SET_HOVERED_DOCUMENT';
/**
 * When mouse moved from hovering over a document remove that document id to state
 */
export const UNSET_HOVERED_DOCUMENT = 'UNSET_HOVERED_DOCUMENT';

// export const SET_SIMILAR = 'SEARCH_SET_SIMILAR';
// export const SET_SIMILAR_LOADING = 'SEARCH_SET_SIMILAR_LOADING';
export const REMOVE_DOCUMENT_FROM_RESULTS =
  'SEARCH_REMOVE_DOCUMENT_FROM_RESULTS';

// Paging & sorting
export const SET_CURRENT_PAGE = 'SEARCH_SET_CURRENT_PAGE';
export const SET_SORT = 'SEARCH_SET_SORT';

// Typeahead
export const SET_TYPEAHEAD = 'SEARCH_SET_TYPEAHEAD';
export const CLEAR_TYPEAHEAD = 'SEARCH_CLEAR_TYPEAHEAD';

// Ui related
export const SET_VIEWMODE = 'SEARCH_SET_VIEWMODE';
export const TOGGLE_SEARH_INFO = 'SEARCH_TOGGLE_SEARH_INFO';

// export const TOGGLE_DUPLICATE_DISPLAY = 'SEARCH_TOGGLE_DUPLICATE_DISPLAY';

export const ADD_PREVIEW_ENTITY = 'SEARCH_ADD_PREVIEW_ENTITY';
export const REMOVE_PREVIEW_ENTITY = 'SEARCH_REMOVE_PREVIEW_ENTITY';
export const SET_PREVIEW_ENTITIES = 'SEARCH_SET_PREVIEW_ENTITIES';
export const CLEAR_PREVIEW_RESULTS = 'SEARCH_CLEAR_PREVIEW_RESULTS';
export const SET_INITIALIZE = 'SEARCH_SET_INITIALIZE';
export const TOGGLE_FILE_SELECTION = 'SEARCH_TOGGLE_FILE_SELECTION';

export interface SelectDocumentIds {
  type: typeof SELECT_DOCUMENT_IDS;
  ids: string[];
}

export interface UnselectDocumentIds {
  type: typeof UNSELECT_DOCUMENT_IDS;
  ids: string[];
}

interface SetLabels {
  type: typeof SET_LABELS;
  labels: Labels;
}

interface SetSearchForSensitive {
  type: typeof SET_SEARCH_FOR_SENSITIVE;
  searchForSensitive: boolean;
}

export interface SetResults {
  type: typeof SET_RESULTS;
  result: DocumentResult;
}

interface ResetResults {
  type: typeof RESET_RESULTS;
}

interface SetSearching {
  type: typeof SET_SEARCHING;
  isSearching: boolean;
}

interface SetLoading {
  type: typeof SET_LOADING;
  isLoading: boolean;
}

interface SetErrorMessage {
  type: typeof SET_ERROR_MESSAGE;
  message: string;
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

// interface SetSimilar {
//   type: typeof SET_SIMILAR;
//   id: DocumentType['id'];
//   hits: DocumentType[];
// }

// interface SetSimilarLoading {
//   type: typeof SET_SIMILAR_LOADING;
//   id: DocumentType['id'];
// }

interface SetCurrentPage {
  type: typeof SET_CURRENT_PAGE;
  page: number;
}

interface SetSort {
  type: typeof SET_SORT;
  sortBy: string;
  ascending: boolean;
}

interface SetTypeahead {
  type: typeof SET_TYPEAHEAD;
  results: any[]; // Figure out the correct type or add one.
}

export interface ClearTypeahead {
  type: typeof CLEAR_TYPEAHEAD;
}

interface SetViewmode {
  type: typeof SET_VIEWMODE;
  viewMode: ViewMode;
}

interface ToggleSearhInfo {
  type: typeof TOGGLE_SEARH_INFO;
  display: boolean;
}

// interface ToggleDuplicateDisplay {
//   type: typeof TOGGLE_DUPLICATE_DISPLAY;
//   hit: { id: DocumentType['id'] }; // Why wrapped?
//   isOpen: boolean;
// }

interface AddPreviewEntity {
  type: typeof ADD_PREVIEW_ENTITY;
  entity: DocumentType;
}

interface RemovePreviewEntity {
  type: typeof REMOVE_PREVIEW_ENTITY;
  entity: DocumentType;
}

export interface ClearPreviewResults {
  type: typeof CLEAR_PREVIEW_RESULTS;
}

interface SetPreviewEntities {
  type: typeof SET_PREVIEW_ENTITIES;
  entities: DocumentType[];
}

interface RemoveDocumentFromResults {
  type: typeof REMOVE_DOCUMENT_FROM_RESULTS;
  id: DocumentType['id'];
}

interface SetHoveredDocument {
  type: typeof SET_HOVERED_DOCUMENT;
  id: string;
}

interface UnsetHoveredDocument {
  type: typeof UNSET_HOVERED_DOCUMENT;
}

export type DocumentAction =
  | SelectDocumentIds
  | UnselectDocumentIds
  | SetLabels
  | SetSearchForSensitive
  | SetResults
  | SetSearching
  | SetLoading
  | SetErrorMessage
  | AddSelectedColumn
  | RemoveSelectedColumn
  | SetSelectedColumn
  // | SetSimilar
  // | SetSimilarLoading
  | SetCurrentPage
  | SetSort
  | SetTypeahead
  | ClearTypeahead
  | SetViewmode
  | ToggleSearhInfo
  // | ToggleDuplicateDisplay
  | AddPreviewEntity
  | RemovePreviewEntity
  | ClearPreviewResults
  | RemoveDocumentFromResults
  | ResetResults
  | SetPreviewEntities
  | SetHoveredDocument
  | UnsetHoveredDocument
  | {
      type: typeof SET_SELECTED_DOCUMENT;
      id: DocumentType['id'];
      state: boolean;
    };
