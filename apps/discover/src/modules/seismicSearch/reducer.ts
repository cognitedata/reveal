import {
  ADD_SURVEY_SELECTION,
  REMOVE_SURVEY_SELECTION,
  ADD_FILE_SELECTION,
  REMOVE_FILE_SELECTION,
  REMOVE_ALL_FILE_SELECTION,
} from 'modules/seismicSearch/actions';
import {
  ADD_SLICE_ERROR,
  ADD_SLICE,
  CREATE_SLICES,
  RESET_DATA_QUERY,
  SET_DATASET_IS_WORKING,
  SET_IS_SEARCHING,
  SET_SEARCH_PHRASE,
  SET_SELECTED_SLICE_ID,
  TOGGLE_BOOLEAN,
  TOGGLE_SELECT_DATASET,
  UPDATE_SLICES,
  SET_SELECTED_SEARCH_RESULTS,
  SET_ERROR,
  SeismicAction,
} from 'modules/seismicSearch/types.actions';

import {
  SeismicState,
  // SeismicFacet
} from './types';

export const initialState: SeismicState = {
  currentDataQuery: {
    phrase: '',
    hasSearched: false,
    // facets: {
    // timeDepth: [
    //   { key: '1', selected: false, name: 'All' },
    //   { key: '2', selected: false, name: 'Time' },
    //   { key: '3', selected: false, name: 'Depth' },
    // ],
    // offset: [
    //   { key: '1', selected: false, name: 'All' },
    //   { key: '2', selected: false, name: 'Full' },
    //   { key: '3', selected: false, name: 'Near' },
    //   { key: '4', selected: false, name: 'Mid' },
    //   { key: '5', selected: false, name: 'Far' },
    //   { key: '6', selected: false, name: 'Ultra Far' },
    //   { key: '7', selected: false, name: 'Gathers' },
    // ],
    // },
  },
  dataResult: [],
  currentSlice: undefined,
  hasSliceImageError: false,
  sliceCollection: [],
  expandedSearchResults: {},
  selectedSliceCollectionId: undefined,
  isSeismicCompareOpen: false,
  isSearching: false,
  isFetchingSubSurveys: false,

  selections: {
    files: [],
    surveys: [],
  },
};

export function seismic(
  state: SeismicState = initialState,
  action?: SeismicAction
): SeismicState {
  if (!action) {
    return state;
  }
  switch (action.type) {
    case SET_DATASET_IS_WORKING: {
      return {
        ...state,
        dataResult: state.dataResult.map((dataItem) => {
          if (dataItem.id === action.surveyId) {
            const updatedSurveys = dataItem.surveys.map((survey) => {
              if (survey.id === action.sliceid) {
                return {
                  ...survey,
                  isWorking: action.isWorking,
                };
              }
              return survey;
            });

            return { ...dataItem, surveys: [...updatedSurveys] };
          }
          return dataItem;
        }),
      };
    }

    case SET_IS_SEARCHING: {
      return {
        ...state,
        isSearching: action.isSearching,
      };
    }

    case TOGGLE_BOOLEAN: {
      return {
        ...state,
        [action.field]: action.value,
      };
    }

    case SET_SELECTED_SLICE_ID:
      return {
        ...state,
        selectedSliceCollectionId: action.id,
      };

    case SET_SELECTED_SEARCH_RESULTS:
      return {
        ...state,
        expandedSearchResults: action.ids,
      };

    case CREATE_SLICES:
      return {
        ...state,
        sliceCollection: [
          ...state.sliceCollection,
          {
            id: action.id,
            slices: [],
            isLoading: action.isLoading,
            hasError: action.hasError,
            time: action.time,
          },
        ],
      };

    case ADD_SLICE:
      return {
        ...state,
        sliceCollection: state.sliceCollection.map((s) => {
          if (s.id === action.id) {
            return {
              ...s,
              slices: [
                ...s.slices,
                {
                  id: action.id,
                  data: action.slice,
                  file: action.file,
                  error: false,
                },
              ],
            };
          }
          return s;
        }),
      };

    case ADD_SLICE_ERROR:
      return {
        ...state,
        sliceCollection: state.sliceCollection.map((s) => {
          if (s.id === action.id) {
            return {
              ...s,
              slices: [
                ...s.slices,
                {
                  id: action.id,
                  file: action.file,
                  error: action.error,
                },
              ],
              hasError: true,
            };
          }
          return s;
        }),
      };

    case UPDATE_SLICES:
      return {
        ...state,
        sliceCollection: state.sliceCollection.map((s) => {
          if (s.id === action.id) {
            return { ...s, isLoading: action.isLoading };
          }
          return s;
        }),
      };

    case SET_SEARCH_PHRASE:
      return {
        ...state,
        currentDataQuery: {
          ...state.currentDataQuery,
          phrase: action.phrase,
        },
      };

    case RESET_DATA_QUERY: {
      return {
        ...initialState,
      };
    }

    case SET_ERROR:
      return {
        ...state,
      };

    case TOGGLE_SELECT_DATASET:
      return {
        ...state,
        dataResult: state.dataResult.map((r) => {
          if (r.survey === action.dataset.survey) {
            return {
              ...r,
              surveys: r.surveys.map((s) => {
                if (s.id === action.dataset.id) {
                  return { ...s, selected: !s.selected };
                }
                return s;
              }),
            };
          }
          return r;
        }),
      };

    case ADD_SURVEY_SELECTION:
      if (state.selections.surveys.includes(action.surveyId)) {
        return state;
      }

      return {
        ...state,
        selections: {
          ...state.selections,
          surveys: [...state.selections.surveys, action.surveyId],
        },
      };

    case REMOVE_SURVEY_SELECTION:
      if (!state.selections.surveys.includes(action.surveyId)) {
        return state;
      }

      return {
        ...state,
        selections: {
          ...state.selections,
          surveys: state.selections.surveys.filter(
            (surveyId) => surveyId !== action.surveyId
          ),
        },
      };

    case ADD_FILE_SELECTION: {
      const fileAlreadyExistsInSelection = state.selections.files.some(
        ({ fileId }) => fileId === action.fileId
      );

      // do nothing if the files is already added
      if (fileAlreadyExistsInSelection) {
        return state;
      }

      return {
        ...state,
        selections: {
          ...state.selections,
          files: [
            ...state.selections.files,
            {
              fileId: action.fileId,
              fileName: action.fileName,
              surveyId: action.surveyId,
            },
          ],
        },
      };
    }

    case REMOVE_FILE_SELECTION: {
      return {
        ...state,
        selections: {
          ...state.selections,
          files: state.selections.files.filter(
            ({ fileId }) => fileId !== action.fileId
          ),
        },
      };
    }

    case REMOVE_ALL_FILE_SELECTION: {
      return {
        ...state,
        selections: {
          ...state.selections,
          files: [],
        },
      };
    }

    default:
      return state;
  }
}
