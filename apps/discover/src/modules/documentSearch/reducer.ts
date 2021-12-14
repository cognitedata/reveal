import cloneDeep from 'lodash/cloneDeep';
import concat from 'lodash/concat';
import difference from 'lodash/difference';
import merge from 'lodash/merge';

import { DocumentQuery, DocumentState } from 'modules/documentSearch/types';
import {
  ADD_PREVIEW_ENTITY,
  ADD_SELECTED_COLUMN,
  CLEAR_PREVIEW_RESULTS,
  CLEAR_TYPEAHEAD,
  REMOVE_PREVIEW_ENTITY,
  REMOVE_SELECTED_COLUMN,
  RESET_RESULTS,
  SET_ERROR_MESSAGE,
  // SET_GROUPSIMILAR_RESULTS,
  SET_RESULTS,
  // SET_SEARCH_FOR_SENSITIVE,
  SET_SEARCHING,
  SET_LOADING,
  SET_SELECTED_COLUMN,
  // SET_SIMILAR_LOADING,
  // SET_SIMILAR,
  SET_TYPEAHEAD,
  SET_VIEWMODE,
  // TOGGLE_DUPLICATE_DISPLAY,
  TOGGLE_SEARH_INFO,
  DocumentAction,
  SET_LABELS,
  SET_PREVIEW_ENTITIES,
  SET_HOVERED_DOCUMENT,
  UNSET_HOVERED_DOCUMENT,
  SELECT_DOCUMENT_IDS,
  UNSELECT_DOCUMENT_IDS,
  SET_EXTRACT_PARENT_FOLDER_PATH,
  CLEAR_EXTRACT_PARENT_FOLDER_PATH,
} from 'modules/documentSearch/types.actions';

import {
  // convertMomentArrayToISO,
  getEmptyDocumentStateFacets,
  // convertISOArrayToMoment,
} from './utils';

export const getSafeState = (state: DocumentState) => {
  return {
    ...cloneDeep(state),
    currentDocumentQuery: getSafeQuery(state.currentDocumentQuery),
  };
};
export const getSafeQuery = (query: DocumentQuery) => {
  return {
    ...cloneDeep(query),
    // initialTimeRange: convertMomentArrayToISO(query.initialTimeRange),
    // timeFilter: convertMomentArrayToISO(query.timeFilter),
  };
};

export const createQuery = (query: any): DocumentQuery => {
  // Due to firebase removing empty values and the search query might change over time,
  // the stored query is merged with the initial state, to make sure we always have the expected/required fields.
  const safeQuery = merge(
    { ...cloneDeep(initialState.currentDocumentQuery) },
    query
  );

  // Since firebase only stores primitive values we have to convert the values back to moment objects.
  return {
    ...cloneDeep(safeQuery),
    // initialTimeRange: convertISOArrayToMoment(safeQuery.initialTimeRange),
    // timeFilter: convertISOArrayToMoment(safeQuery.timeFilter),
  };
};

export const initialState: DocumentState = {
  currentDocumentQuery: {
    hasSearched: false,
    searchForSensitive: false,
  },
  result: {
    hits: [],
    count: 0,
    facets: getEmptyDocumentStateFacets(),
  },
  selectedDocumentIds: [],
  isSearching: false,
  isLoading: false,
  typeAheadResults: [],
  selectedColumns: [
    // default showing columns
    'filename',
    'creationdate',
    'lastmodified',
    'location',
    'filetype',
    'labels',
    'author',
  ],
  previewedEntities: [],
  isInitialized: false,
  errorMessage: '',
  displayInformationModal: false,
  viewMode: 'table',
  labels: {},
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
        selectedColumns: [...state.selectedColumns, action.column],
      };

    case REMOVE_SELECTED_COLUMN:
      return {
        ...state,
        selectedColumns: state.selectedColumns.filter(
          (c) => c !== action.column
        ),
      };

    case SET_SELECTED_COLUMN:
      return { ...state, selectedColumns: [...action.columns] };

    case ADD_PREVIEW_ENTITY:
      return {
        ...state,
        previewedEntities: [...state.previewedEntities, action.entity],
      };

    case REMOVE_PREVIEW_ENTITY:
      return {
        ...state,
        previewedEntities: state.previewedEntities.filter(
          (c) => c.id !== action.entity.id
        ),
      };

    case SET_PREVIEW_ENTITIES:
      return { ...state, previewedEntities: action.entities };

    case CLEAR_PREVIEW_RESULTS:
      return { ...state, previewedEntities: [] };

    case SET_TYPEAHEAD: {
      return { ...state, typeAheadResults: [...action.results] };
    }

    case CLEAR_TYPEAHEAD: {
      return { ...state, typeAheadResults: [] };
    }

    // case SET_GROUPSIMILAR_RESULTS:
    //   return {
    //     ...state,
    //     currentDocumentQuery: {
    //       ...state.currentDocumentQuery,
    //       isGroupSimilarResults: action.isGroupSimilarResults,
    //     },
    //   };

    // case SET_SEARCH_FOR_SENSITIVE:
    //   return {
    //     ...state,
    //     currentDocumentQuery: {
    //       ...state.currentDocumentQuery,
    //       searchForSensitive: action.searchForSensitive,
    //     },
    //   };

    case SET_RESULTS:
      return {
        ...state,
        result: { ...action.result },
        isSearching: false,
        isLoading: false,
        currentDocumentQuery: {
          ...state.currentDocumentQuery,
          hasSearched: true,
        },
      };

    case RESET_RESULTS:
      return {
        ...state,
        result: { ...initialState.result },
        isSearching: false,
        isLoading: false,
        currentDocumentQuery: {
          ...state.currentDocumentQuery,
          hasSearched: true,
        },
      };

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

    case SET_HOVERED_DOCUMENT: {
      return {
        ...state,
        hoveredDocumentId: action.id,
      };
    }

    case UNSET_HOVERED_DOCUMENT: {
      return {
        ...state,
        hoveredDocumentId: undefined,
      };
    }

    case SET_SEARCHING:
      return { ...state, isSearching: action.isSearching };

    case SET_LOADING:
      return { ...state, isLoading: action.isLoading };

    case SET_ERROR_MESSAGE: {
      return {
        ...state,
        errorMessage: action.message,
      };
    }

    case SET_LABELS: {
      return {
        ...state,
        labels: action.labels,
      };
    }

    case TOGGLE_SEARH_INFO: {
      return {
        ...state,
        displayInformationModal: action.display,
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
