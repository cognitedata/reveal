import concat from 'lodash/concat';
import difference from 'lodash/difference';

import { DocumentState } from 'modules/documentSearch/types';
import {
  ADD_SELECTED_COLUMN,
  REMOVE_SELECTED_COLUMN,
  SET_SELECTED_COLUMN,
  SET_VIEWMODE,
  DocumentAction,
  SELECT_DOCUMENT_IDS,
  UNSELECT_DOCUMENT_IDS,
  SET_EXTRACT_PARENT_FOLDER_PATH,
  CLEAR_EXTRACT_PARENT_FOLDER_PATH,
} from 'modules/documentSearch/types.actions';

export const initialState: DocumentState = {
  selectedDocumentIds: [],
  selectedColumns: [
    // default showing columns
    'filename',
    'creationdate',
    'lastmodified',
    'location',
    'fileCategory',
    'labels',
    'author',
  ],
  viewMode: 'table',
};

export function search(
  state: DocumentState = initialState,
  action?: DocumentAction
): DocumentState {
  if (!action) {
    return state;
  }

  switch (action.type) {
    case ADD_SELECTED_COLUMN:
      return {
        ...state,
        selectedColumns: concat(state.selectedColumns, action.column),
      };

    case REMOVE_SELECTED_COLUMN:
      return {
        ...state,
        selectedColumns: state.selectedColumns.filter(
          (c) => c !== action.column
        ),
      };

    case SET_SELECTED_COLUMN:
      return { ...state, selectedColumns: action.columns };

    case SELECT_DOCUMENT_IDS: {
      return {
        ...state,
        selectedDocumentIds: concat(state.selectedDocumentIds, action.ids),
      };
    }

    case UNSELECT_DOCUMENT_IDS: {
      return {
        ...state,
        selectedDocumentIds: difference(state.selectedDocumentIds, action.ids),
      };
    }

    case SET_EXTRACT_PARENT_FOLDER_PATH: {
      return {
        ...state,
        extractParentFolderPath: action.path,
      };
    }

    case CLEAR_EXTRACT_PARENT_FOLDER_PATH: {
      return {
        ...state,
        extractParentFolderPath: undefined,
      };
    }

    case SET_VIEWMODE: {
      return {
        ...state,
        viewMode: action.viewMode,
      };
    }

    default:
      return state;
  }
}
