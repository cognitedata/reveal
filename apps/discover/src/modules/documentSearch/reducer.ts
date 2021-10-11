import cloneDeep from 'lodash/cloneDeep';
import map from 'lodash/map';
import merge from 'lodash/merge';

import {
  DocumentType,
  DocumentQuery,
  DocumentState,
  DocumentResult,
} from 'modules/documentSearch/types';
import {
  ADD_PREVIEW_ENTITY,
  ADD_SELECTED_COLUMN,
  CLEAR_PREVIEW_RESULTS,
  CLEAR_TYPEAHEAD,
  REMOVE_DOCUMENT_FROM_RESULTS,
  REMOVE_PREVIEW_ENTITY,
  REMOVE_SELECTED_COLUMN,
  RESET_RESULTS,
  SET_ERROR_MESSAGE,
  // SET_GROUPSIMILAR_RESULTS,
  SET_RESULTS,
  // SET_SEARCH_FOR_SENSITIVE,
  SET_SEARCHING,
  SET_LOADING,
  SET_SELECTED_DOCUMENT,
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
  ADD_SELECTED_DOCUMENT_ID,
  REMOVE_SELECTED_DOCUMENT_ID,
  ADD_ALL_DOCUMENT_IDS,
  REMOVE_ALL_DOCUMENT_IDS,
  SET_HOVERED_DOCUMENT,
  UNSET_HOVERED_DOCUMENT,
  SET_ISOLATED_DOCUMENT_RESULT_FACETS,
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

  /**
   * This is to store the aggregates (processed) received once an isolated search is done.
   * This property is added initially for the requirement of display available document results count (PP-1042).
   */
  isolatedDocumentResultFacets: getEmptyDocumentStateFacets(),

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
  action: DocumentAction
): DocumentState {
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

    case SET_ISOLATED_DOCUMENT_RESULT_FACETS: {
      return {
        ...state,
        isolatedDocumentResultFacets: action.facets,
      };
    }

    // case SET_SIMILAR: {
    //   return {
    //     ...state,
    //     result: {
    //       ...state.result,
    //       hits: state.result.hits.map((m) => {
    //         if (m.id === action.id) {
    //           return {
    //             ...m,
    //             similar: [...(action.hits || [])],
    //             similarLoading: false,
    //           };
    //         }
    //         return m;
    //       }),
    //     },
    //   };
    // }

    // case SET_SIMILAR_LOADING: {
    //   return {
    //     ...state,
    //     result: {
    //       ...state.result,
    //       hits: state.result.hits.map((m) => {
    //         if (m.id === action.id) {
    //           return { ...m, similarLoading: true };
    //         }
    //         return m;
    //       }),
    //     },
    //   };
    // }

    case SET_SELECTED_DOCUMENT: {
      return {
        ...state,
        result: modifySearchResult(state.result, action.id, {
          selected: action.state,
        }),
      };
    }

    case ADD_SELECTED_DOCUMENT_ID: {
      return {
        ...state,
        selectedDocumentIds: [...state.selectedDocumentIds, action.id],
      };
    }

    case REMOVE_SELECTED_DOCUMENT_ID: {
      return {
        ...state,
        selectedDocumentIds: state.selectedDocumentIds.filter(
          (id) => id !== action.id
        ),
      };
    }

    case ADD_ALL_DOCUMENT_IDS: {
      return {
        ...state,
        selectedDocumentIds: map(state.result.hits, 'id'),
      };
    }

    case REMOVE_ALL_DOCUMENT_IDS: {
      return {
        ...state,
        selectedDocumentIds: [],
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

    // case TOGGLE_DUPLICATE_DISPLAY:
    //   return {
    //     ...state,
    //     result: {
    //       ...state.result,
    //       hits: state.result.hits.map((f) => {
    //         if (f.id === action.hit.id) {
    //           return { ...f, isOpen: action.isOpen };
    //         }
    //         return {
    //           ...f,
    //         };
    //       }),
    //     },
    //   };

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

    // REMOVE SENSITIVE DOCUMENTS
    case REMOVE_DOCUMENT_FROM_RESULTS: {
      const hits = state.result.hits.filter((hit) => {
        return hit.id !== action.id;
      });
      const count = state.result.count - 1;

      return {
        ...state,
        result: {
          ...state.result,
          hits,
          count,
        },
      };
    }

    default:
      return state;
  }
}

const modifySearchResult = (
  result: DocumentResult,
  id: DocumentType['id'],
  newStuff: Partial<DocumentType>
) => {
  return {
    ...result,
    hits: result.hits.map((doc) => {
      if (doc.id === id) {
        return { ...doc, ...newStuff };
      }
      return {
        ...doc,
      };
    }),
  };
};
