import get from 'lodash/get';
import isNil from 'lodash/isNil';
import isObject from 'lodash/isObject';
import { Dispatch } from 'redux';

import { Metrics } from '@cognite/metrics';
import { storage } from '@cognite/react-container';
import { reportException } from '@cognite/react-errors';
import { CogniteError } from '@cognite/sdk';
import { DocumentsFilter } from '@cognite/sdk-playground';

import { showErrorMessage } from 'components/toast';
import {
  LOG_DOCUMENT_SEARCH_NAMESPACE,
  LOG_DOCUMENT_SEARCH,
} from 'constants/logging';
import { ThunkResult } from 'core/types';
import { TimeLogStages } from 'hooks/useTimeLog';
import {
  documentSearchService,
  getLabels,
} from 'modules/documentSearch/service';
import {
  Column,
  DocumentType,
  ViewMode,
  DocumentResult,
} from 'modules/documentSearch/types';
import {
  ADD_PREVIEW_ENTITY,
  ADD_SELECTED_COLUMN,
  // CLEAR_INITIAL_TIMERANGE,
  CLEAR_PREVIEW_RESULTS,
  CLEAR_TYPEAHEAD,
  REMOVE_PREVIEW_ENTITY,
  REMOVE_SELECTED_COLUMN,
  RESET_RESULTS,
  SET_CURRENT_PAGE,
  SET_ERROR_MESSAGE,
  // SET_FACETS,
  // SET_INITIAL_TIMERANGE,
  SET_RESULTS,
  SET_SEARCH_FOR_SENSITIVE,
  SET_SEARCHING,
  SET_LOADING,
  SET_SELECTED_COLUMN,
  SET_TYPEAHEAD,
  SET_VIEWMODE,
  // TOGGLE_DUPLICATE_DISPLAY,
  TOGGLE_SEARH_INFO,
  REMOVE_DOCUMENT_FROM_RESULTS,
  DocumentAction,
  SET_SELECTED_DOCUMENT,
  SET_LABELS,
  SET_PREVIEW_ENTITIES,
  ClearPreviewResults,
  ClearTypeahead,
  SetResults,
  SET_HOVERED_DOCUMENT,
  UNSET_HOVERED_DOCUMENT,
  SelectDocumentIds,
  SELECT_DOCUMENT_IDS,
  UnselectDocumentIds,
  UNSELECT_DOCUMENT_IDS,
} from 'modules/documentSearch/types.actions';
import { getPreparedQuery } from 'modules/documentSearch/utils';

export const selectDocumentIds = (ids: string[]): SelectDocumentIds => ({
  type: SELECT_DOCUMENT_IDS,
  ids,
});

export const unselectDocumentIds = (ids: string[]): UnselectDocumentIds => ({
  type: UNSELECT_DOCUMENT_IDS,
  ids,
});

const documentSearchMetric = Metrics.create(LOG_DOCUMENT_SEARCH);

const DEFAULT_ERROR_MESSAGE =
  'An error occured while doing your search. Please try again later.';

// for LS key
export const SEARCH_SELECTED_COLUMNS = 'SEARCH_SELECTED_COLUMNS';

export const clearPreview: ClearPreviewResults = {
  type: CLEAR_PREVIEW_RESULTS,
};
export const clearTypehead: ClearTypeahead = { type: CLEAR_TYPEAHEAD };
export function setResult(result: DocumentResult): SetResults {
  return {
    type: SET_RESULTS,
    result,
  };
}

const startSearching = (dispatch: Dispatch) => {
  dispatch({ type: SET_SEARCHING, isSearching: true });
  dispatch({ type: SET_LOADING, isLoading: true });
  dispatch({ type: SET_ERROR_MESSAGE, message: '' });
};

const stopSearching = (dispatch: Dispatch) => {
  dispatch({ type: SET_LOADING, isLoading: false });
};

export const search = (
  {
    filters,
    sort,
    limit,
    searchPhraseOverride,
  }: {
    filters: DocumentsFilter; // This should be typed but leaving is till documents move to sdk
    sort: string[];
    limit?: number;
    searchPhraseOverride?: string;
  } = {
    filters: {},
    sort: [],
    limit: 100,
  }
): ThunkResult<Promise<any>> => {
  return (dispatch, getState) => {
    const state = getState();
    startSearching(dispatch);

    /**
     * There are scenarios where search phrase passed for a certain functionality only but not picked from store
     * eg: extractParentFolder in such cases search phrase is overidden with passed value
     */
    const searchQuery = searchPhraseOverride
      ? getPreparedQuery(state, {
          phrase: searchPhraseOverride,
        })
      : getPreparedQuery(state);

    const options = {
      filters,
      sort,
    };

    // Start timer to track document searchtime
    const timer = documentSearchMetric.start(LOG_DOCUMENT_SEARCH_NAMESPACE, {
      stage: TimeLogStages.Network,
    });
    return documentSearchService
      .search(searchQuery, options, limit)
      .then((results) => {
        // console.log('Document search results:', results);

        // Stop timer
        timer.stop();
        dispatch(clearPreview);
        dispatch(clearTypehead);
        dispatch(setResult(results));
        stopSearching(dispatch);

        const { geoFilter, ...query } = searchQuery;

        return {
          query: { ...query, hasSearched: true },
          geo: geoFilter,
        };
      })
      .catch((error: CogniteError) => {
        let knownError;
        stopSearching(dispatch);

        // eslint-disable-next-line no-console
        // console.error(error);

        const possibleExtraInfo = get(error, 'extra.validationError');
        if (isObject(possibleExtraInfo)) {
          const possibleKnownError = (possibleExtraInfo as any)[
            'filter.geolocation.shape.__root__'
          ];

          if (possibleKnownError) {
            // bad shape
            if (possibleKnownError.includes('is invalid')) {
              knownError =
                'Please make sure polygon is valid. Eg: does not cross lines';
            }
            // too many points!
            if (possibleKnownError.includes('exceeds coordinates size limit')) {
              knownError = 'Please draw a smaller polygon';
            }
          }
        }

        if (!isNil(error.message)) {
          if (error.message.includes('Field not defined: ')) {
            dispatch({
              type: SET_SEARCHING,
              isSearching: false,
            });
            dispatch({
              type: RESET_RESULTS,
            });
            dispatch({
              type: SET_ERROR_MESSAGE,
              message: error.message,
            });
            return;
          }
        }
        dispatch({
          type: SET_SEARCHING,
          isSearching: false,
        });
        showErrorMessage(knownError || DEFAULT_ERROR_MESSAGE);
      });
  };
};

const extractParentFolder = (
  parentPath: string,
  byFilepath?: boolean
): ThunkResult<void> => {
  return (dispatch) => {
    if (byFilepath) {
      dispatch(
        search({
          filters: {
            sourceFile: {
              directoryPrefix: {
                in: [parentPath],
              },
            },
          },
          sort: [],
          searchPhraseOverride: `path:"${parentPath}"`,
        })
      );
    } else {
      dispatch(
        search({
          filters: {
            sourceFile: {
              directoryPrefix: {
                in: [parentPath],
              },
            },
          },
          sort: [],
        })
      );
    }
  };
};

const setSearchForSensitive = (searchForSensitive: boolean): DocumentAction => {
  return {
    type: SET_SEARCH_FOR_SENSITIVE,
    searchForSensitive,
  };
};

const setViewmode = (viewMode: ViewMode): DocumentAction => ({
  type: SET_VIEWMODE,
  viewMode,
});

const displaySearchInformation = (show: boolean): DocumentAction => ({
  type: TOGGLE_SEARH_INFO,
  display: show,
});

const addToPreviewedEntity = (entity: DocumentType): DocumentAction => ({
  type: ADD_PREVIEW_ENTITY,
  entity,
});

const removeFromPreviewedEntity = (entity: DocumentType): DocumentAction => ({
  type: REMOVE_PREVIEW_ENTITY,
  entity,
});

const setPreviewedEntities = (entities: DocumentType[]): DocumentAction => ({
  type: SET_PREVIEW_ENTITIES,
  entities,
});

const setHoveredDocument = (id: string): DocumentAction => ({
  type: SET_HOVERED_DOCUMENT,
  id,
});

const unsetHoveredDocument = (): ThunkResult<void> => {
  return (dispatch, getState) => {
    const state = getState().documentSearch;

    if (state.hoveredDocumentId) {
      dispatch({
        type: UNSET_HOVERED_DOCUMENT,
      });
    }
  };
};

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

const setupLabels = (): ThunkResult<void> => {
  return (dispatch) => {
    return getLabels()
      .then((labels) => {
        const parsedLabels = labels.items.reduce((results, label: any) => {
          return {
            [label.externalId]: label.name,
            ...results,
          };
        }, {} as any);
        return dispatch({ type: SET_LABELS, labels: parsedLabels });
      })
      .catch(reportException);
  };
};

const initialize = (): ThunkResult<void> => {
  return (dispatch, getState) => {
    const json = storage.getItem(SEARCH_SELECTED_COLUMNS) as string[];
    const state = getState();
    const columns = getJsonOrDefault(
      json,
      state.documentSearch.selectedColumns
    );

    dispatch(setupLabels());

    dispatch({
      type: SET_SELECTED_COLUMN,
      columns,
    });
  };
};

const getTypeahead = (value: string): ThunkResult<void> => {
  return (dispatch, getState) => {
    const state = getState();

    const typeaheadQuery = getPreparedQuery(state, { phrase: value });

    return documentSearchService
      .getTypeahead(typeaheadQuery)
      .then((results) => {
        if (!state.documentSearch.isSearching) {
          dispatch({ type: SET_TYPEAHEAD, results });
        }
      })
      .catch(() => {
        // just ignore errors here, as they might be typing an advanced filter
        // eg: author:"
        // when the search triggers
        // areas for improvement, don't search when we detect ":" in typeahead?
        dispatch({
          type: SET_SEARCHING,
          isSearching: false,
        });
      });
  };
};

const clearTypeahead = (): DocumentAction => {
  return { type: CLEAR_TYPEAHEAD };
};

// function toggleDuplicatesDisplay(
//   hit: { id: DocumentType['id'] },
//   isOpen: boolean
// ): DocumentAction {
//   return { type: TOGGLE_DUPLICATE_DISPLAY, hit, isOpen };
// }

// function findSimilar(id: number): ThunkResult<Promise<void>> {
//   return (dispatch, getState) => {
//     const state = getState().documentSearch;
//     dispatch({ type: SET_SIMILAR_LOADING, id });
//     return documentSearchService
//       .findSimilar(id, state.currentDocumentQuery)
//       .then((hits) => {
//         dispatch({
//           type: SET_SIMILAR,
//           id,
//           hits,
//         });
//       });
//   };
// }

// function setSelectedTimeRangeAndSearch(
//   from: moment.Moment,
//   to: moment.Moment
// ): ThunkResult<any> {
//   return (dispatch) => {
//     dispatch({ type: SET_SELECTED_TIMERANGE, from, to });
//     return dispatch(search());
//   };
// }

const setCurrentPage = (page: number): ThunkResult<any> => {
  return (dispatch) => {
    dispatch({ type: SET_CURRENT_PAGE, page });
    return dispatch(search());
  };
};

const removeSensitiveDocument = (
  documentId: DocumentType['id']
): ThunkResult<void> => {
  return (dispatch) => {
    dispatch({
      type: REMOVE_DOCUMENT_FROM_RESULTS,
      id: documentId,
    });
  };
};

const toggleDocumentSelection = (
  documentId: DocumentType['id']
): ThunkResult<void> => {
  return (dispatch, getState) => {
    const state = getState();
    const { result } = state.documentSearch;

    let selected = false;
    const doc = result.hits.find((hit) => hit.id === documentId);

    if (doc) {
      selected = doc.selected || false;
    }

    dispatch({
      type: SET_SELECTED_DOCUMENT,
      id: documentId,
      state: !selected,
    });
  };
};

export const documentSearchActions = {
  search,
  selectDocumentIds,
  unselectDocumentIds,
  // toggleDuplicatesDisplay,

  initialize,

  setCurrentPage,
  getTypeahead,
  clearTypeahead,
  addSelectedColumn,
  removeSelectedColumn,
  setSelectedColumns,
  addToPreviewedEntity,
  removeFromPreviewedEntity,
  displaySearchInformation,
  toggleDocumentSelection,
  setHoveredDocument,
  unsetHoveredDocument,

  setViewmode,
  // findSimilar,
  setSearchForSensitive,
  extractParentFolder,
  removeSensitiveDocument,
  setPreviewedEntities,
};
