import { storage } from '@cognite/react-container';

import { ThunkResult } from 'core/types';
import { ViewMode } from 'modules/documentSearch/types';
import {
  ADD_SELECTED_COLUMN,
  REMOVE_SELECTED_COLUMN,
  SET_SELECTED_COLUMN,
  SET_VIEWMODE,
  DocumentAction,
  SelectDocumentIds,
  SELECT_DOCUMENT_IDS,
  UnselectDocumentIds,
  UNSELECT_DOCUMENT_IDS,
  SetExtractParentFolderPath,
  SET_EXTRACT_PARENT_FOLDER_PATH,
  CLEAR_EXTRACT_PARENT_FOLDER_PATH,
  ClearExtractParentFolderPath,
} from 'modules/documentSearch/types.actions';
import { Column } from 'pages/authorized/search/common/types';

export const selectDocumentIds = (ids: string[]): SelectDocumentIds => ({
  type: SELECT_DOCUMENT_IDS,
  ids,
});

export const unselectDocumentIds = (ids: string[]): UnselectDocumentIds => ({
  type: UNSELECT_DOCUMENT_IDS,
  ids,
});

export const setExtractParentFolderPath = (
  path: string
): SetExtractParentFolderPath => ({
  type: SET_EXTRACT_PARENT_FOLDER_PATH,
  path,
});

export const clearExtractParentFolderPath =
  (): ClearExtractParentFolderPath => ({
    type: CLEAR_EXTRACT_PARENT_FOLDER_PATH,
  });

// for LS key
export const SEARCH_SELECTED_COLUMNS = 'SEARCH_SELECTED_COLUMNS';

const setViewmode = (viewMode: ViewMode): DocumentAction => ({
  type: SET_VIEWMODE,
  viewMode,
});

const addSelectedColumn = (column: Column): ThunkResult<void> => {
  return (dispatch, getState) => {
    dispatch({
      type: ADD_SELECTED_COLUMN,
      column: column.field,
    });
    const state = getState().documentSearch;
    storage.setItem(SEARCH_SELECTED_COLUMNS, state.selectedColumns);
  };
};

const setSelectedColumns = (columns: string[]): ThunkResult<void> => {
  return (dispatch) => {
    dispatch({
      type: SET_SELECTED_COLUMN,
      columns,
    });
    storage.setItem(SEARCH_SELECTED_COLUMNS, columns);
  };
};

const removeSelectedColumn = (column: Column): ThunkResult<void> => {
  return (dispatch, getState) => {
    dispatch({
      type: REMOVE_SELECTED_COLUMN,
      column: column.field,
    });
    const state = getState().documentSearch;
    storage.setItem(SEARCH_SELECTED_COLUMNS, state.selectedColumns);
  };
};

// this is for the selected columns for the search results
const getJsonOrDefault = (
  selectedColumns: string[],
  defaultColumns: string[]
) => {
  if (!selectedColumns) {
    return defaultColumns;
  }
  const blacklist: string[] = []; // deprecated columns
  // const blacklist = ['title']; // deprecated columns
  return selectedColumns.filter((column) => !blacklist.includes(column));
};

const initialize = (): ThunkResult<void> => {
  return (dispatch, getState) => {
    const json = storage.getItem(SEARCH_SELECTED_COLUMNS) as string[];
    const state = getState();
    const columns = getJsonOrDefault(
      json,
      state.documentSearch.selectedColumns
    );

    dispatch({
      type: SET_SELECTED_COLUMN,
      columns,
    });
  };
};

export const documentSearchActions = {
  selectDocumentIds,
  unselectDocumentIds,
  setExtractParentFolderPath,
  clearExtractParentFolderPath,

  initialize,

  addSelectedColumn,
  removeSelectedColumn,
  setSelectedColumns,

  setViewmode,
};
