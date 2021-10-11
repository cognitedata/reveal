import {
  ADD_SURVEY_SELECTION,
  REMOVE_SURVEY_SELECTION,
  ADD_FILE_SELECTION,
  REMOVE_FILE_SELECTION,
  REMOVE_ALL_FILE_SELECTION,
} from 'modules/seismicSearch/actions';
import {
  SET_SEARCH_PHRASE,
  RESET_DATA_QUERY,
  UPDATE_SLICES,
  ADD_SLICE_ERROR,
  ADD_SLICE,
  CREATE_SLICES,
  SET_SELECTED_SEARCH_RESULTS,
  SET_SELECTED_SLICE_ID,
  TOGGLE_BOOLEAN,
  SET_IS_SEARCHING,
  SET_DATASET_IS_WORKING,
  SET_ERROR,
  TOGGLE_SELECT_DATASET,
} from 'modules/seismicSearch/types.actions';

import { seismic, initialState } from '../reducer';

const searchInitialState = () => ({ ...initialState });

describe('seismic.reducer', () => {
  test(`${RESET_DATA_QUERY} to set the searchquery back to the initial state`, () => {
    const currentQuery = {
      phrase: 'test',
      hasSearched: true,
      // facets: {
      //   timeDepth: [
      //     { key: 1, selected: false, name: 'All' },
      //     { key: 2, selected: false, name: 'Time' },
      //     { key: 3, selected: false, name: 'Depth' },
      //   ],
      //   offset: [
      //     { key: 1, selected: false, name: 'All' },
      //     { key: 2, selected: false, name: 'Full' },
      //     { key: 3, selected: false, name: 'Near' },
      //     { key: 4, selected: false, name: 'Mid' },
      //     { key: 5, selected: false, name: 'Far' },
      //     { key: 6, selected: false, name: 'Ultra Far' },
      //     { key: 7, selected: false, name: 'Gathers' },
      //   ],
      // },
      geoFilter: [{ geometry: { type: 'Polygon', coordinates: [] } }],
    };

    const state = seismic(
      {
        ...searchInitialState(),
        currentDataQuery: { ...currentQuery },
      },
      {
        type: RESET_DATA_QUERY,
      }
    );
    expect(state.currentDataQuery).toEqual(
      searchInitialState().currentDataQuery
    );
  });

  test(`${SET_SEARCH_PHRASE} to set the search phrase`, () => {
    const state = seismic(undefined, {
      type: SET_SEARCH_PHRASE,
      phrase: 'STM4001L',
    });

    expect(state.currentDataQuery.phrase).toEqual('STM4001L');
  });

  test(`${UPDATE_SLICES} to set the loading`, () => {
    const state = seismic(
      {
        ...initialState,
        sliceCollection: [
          { id: '1', hasError: false, isLoading: false, slices: [], time: 123 },
        ],
      },
      {
        type: UPDATE_SLICES,
        id: '1',
        isLoading: true,
      }
    );

    expect(state.sliceCollection[0].isLoading).toEqual(true);
  });

  test(`${UPDATE_SLICES} to set the loading invalid id`, () => {
    const state = seismic(
      {
        ...initialState,
        sliceCollection: [
          { id: '1', hasError: false, isLoading: false, slices: [], time: 123 },
        ],
      },
      {
        type: UPDATE_SLICES,
        id: '113131',
        isLoading: true,
      }
    );

    expect(state.sliceCollection[0].isLoading).toEqual(false);
  });

  test(`${ADD_SLICE_ERROR} to set the slice collection`, () => {
    const state = seismic(
      {
        ...initialState,
        sliceCollection: [
          { id: '1', hasError: false, isLoading: false, slices: [], time: 123 },
        ],
      },
      {
        type: ADD_SLICE_ERROR,
        id: '1',
        file: 'test',
        error: true,
      }
    );

    expect(state.sliceCollection[0].hasError).toEqual(true);
    expect(state.sliceCollection[0].slices.length).toBeGreaterThan(0);
  });

  test(`${ADD_SLICE_ERROR} to set the slice collection invalid id`, () => {
    const state = seismic(
      {
        ...initialState,
        sliceCollection: [
          { id: '1', hasError: false, isLoading: false, slices: [], time: 123 },
        ],
      },
      {
        type: ADD_SLICE_ERROR,
        id: '13123123',
        file: 'test',
        error: true,
      }
    );

    expect(state.sliceCollection[0].slices.length).toEqual(0);
  });

  test(`${ADD_SLICE} to set the slice collection`, () => {
    const state = seismic(
      {
        ...initialState,
        sliceCollection: [
          { id: '1', hasError: false, isLoading: false, slices: [], time: 123 },
        ],
      },
      {
        type: ADD_SLICE,
        id: '1',
        file: 'test',
        slice: {},
      }
    );

    expect(state.sliceCollection[0].slices.length).toBeGreaterThan(0);
    expect(state.sliceCollection[0].slices[0].id).toEqual('1');
    expect(state.sliceCollection[0].slices[0].error).toEqual(false);
  });

  test(`${ADD_SLICE} to set the slice collection invalid id`, () => {
    const state = seismic(
      {
        ...initialState,
        sliceCollection: [
          { id: '1', hasError: false, isLoading: false, slices: [], time: 123 },
        ],
      },
      {
        type: ADD_SLICE,
        id: '123',
        file: 'test',
        slice: {},
      }
    );

    expect(state.sliceCollection[0].slices.length).toEqual(0);
  });

  test(`${CREATE_SLICES} to set the slice collection`, () => {
    const state = seismic(
      {
        ...initialState,
      },
      {
        type: CREATE_SLICES,
        id: '1',
        hasError: false,
        isLoading: false,
        slices: [],
        time: 123,
      }
    );

    expect(state.sliceCollection.length).toBeGreaterThan(0);
    expect(state.sliceCollection[0].hasError).toEqual(false);
  });

  test(`${SET_SELECTED_SEARCH_RESULTS} to set the expanded search results`, () => {
    const state = seismic(
      {
        ...initialState,
      },
      {
        type: SET_SELECTED_SEARCH_RESULTS,
        ids: { '134': true },
      }
    );

    expect(state.expandedSearchResults).toEqual({ '134': true });
  });

  test(`${SET_SELECTED_SLICE_ID} to set the selected slice id`, () => {
    const state = seismic(
      {
        ...initialState,
      },
      {
        type: SET_SELECTED_SLICE_ID,
        id: '134',
      }
    );

    expect(state.selectedSliceCollectionId).toEqual('134');
  });

  test(`${TOGGLE_BOOLEAN} to set the toggle`, () => {
    const state = seismic(
      {
        ...initialState,
      },
      {
        type: TOGGLE_BOOLEAN,
        field: 'hasSliceImageError',
        value: true,
      }
    );

    expect(state.hasSliceImageError).toEqual(true);
  });

  test(`${SET_IS_SEARCHING} to set the search`, () => {
    const state = seismic(
      {
        ...initialState,
      },
      {
        type: SET_IS_SEARCHING,
        isSearching: true,
      }
    );

    expect(state.isSearching).toEqual(true);
  });

  test(`${SET_DATASET_IS_WORKING} to set the dataset`, () => {
    const state = seismic(
      {
        ...initialState,
        dataResult: [
          {
            id: '123',
            survey: 'test-survey',
            surveys: [
              {
                id: '1',
                surveyId: '123',
                survey: 'test-survey',
                dataSetName: 'test-dataset',
                isWorking: false,
              },
            ],
          },
        ],
      },
      {
        type: SET_DATASET_IS_WORKING,
        isWorking: true,
        sliceid: '1',
        surveyId: '123',
      }
    );

    expect(state.dataResult[0].surveys[0].isWorking).toEqual(true);
  });

  test(`${SET_DATASET_IS_WORKING} to set the invalid dataset id`, () => {
    const state = seismic(
      {
        ...initialState,
        dataResult: [
          {
            id: '123',
            survey: 'test-survey',
            surveys: [
              {
                id: '1',
                surveyId: '123',
                survey: 'test-survey',
                dataSetName: 'test-dataset',
                isWorking: false,
              },
            ],
          },
        ],
      },
      {
        type: SET_DATASET_IS_WORKING,
        isWorking: true,
        sliceid: '133333',
        surveyId: '123',
      }
    );

    expect(state.dataResult[0].surveys[0].isWorking).toEqual(false);

    const state2 = seismic(
      {
        ...initialState,
        dataResult: [
          {
            id: '123',
            survey: 'test-survey',
            surveys: [
              {
                id: '1',
                surveyId: '123',
                survey: 'test-survey',
                dataSetName: 'test-dataset',
                isWorking: false,
              },
            ],
          },
        ],
      },
      {
        type: SET_DATASET_IS_WORKING,
        isWorking: true,
        sliceid: '133333',
        surveyId: '133333',
      }
    );

    expect(state2.dataResult[0].surveys[0].isWorking).toEqual(false);
  });

  test(`${SET_ERROR} to set the error`, () => {
    const state = seismic(undefined, {
      type: SET_ERROR,
      message: 'test',
    });

    expect(state).not.toBeNull();
  });

  test(`${TOGGLE_SELECT_DATASET} to set the dataset`, () => {
    const state = seismic(
      {
        ...initialState,
        dataResult: [
          {
            id: '123',
            survey: 'test-survey',
            surveys: [
              {
                id: '1',
                surveyId: '123',
                survey: 'test-survey',
                dataSetName: 'test-dataset',
                selected: false,
              },
            ],
          },
        ],
      },
      {
        type: TOGGLE_SELECT_DATASET,
        dataset: {
          id: '1',
          surveyId: '123',
          survey: 'test-survey',
          dataSetName: 'test-dataset',
        },
      }
    );

    expect(state.dataResult[0].surveys[0].selected).toEqual(true);
  });
  test(`${TOGGLE_SELECT_DATASET} to set the dataset invalid id`, () => {
    const state = seismic(
      {
        ...initialState,
        dataResult: [
          {
            id: '123',
            survey: 'test-survey',
            surveys: [
              {
                id: '1',
                surveyId: '123',
                survey: 'test-survey',
                dataSetName: 'test-dataset',
                selected: false,
              },
            ],
          },
        ],
      },
      {
        type: TOGGLE_SELECT_DATASET,
        dataset: {
          id: '231',
          surveyId: '123',
          survey: 'test-survey',
          dataSetName: 'test-dataset',
        },
      }
    );

    expect(state.dataResult[0].surveys[0].selected).toEqual(false);

    const state2 = seismic(
      {
        ...initialState,
        dataResult: [
          {
            id: '123',
            survey: 'test-survey',
            surveys: [
              {
                id: '1',
                surveyId: '123',
                survey: 'test-survey',
                dataSetName: 'test-dataset',
                selected: false,
              },
            ],
          },
        ],
      },
      {
        type: TOGGLE_SELECT_DATASET,
        dataset: {
          id: '1312321323',
          surveyId: '1313123132',
          survey: 'invalid',
          dataSetName: 'test-dataset',
        },
      }
    );

    expect(state2.dataResult[0].surveys[0].selected).toEqual(false);
  });

  test(`${ADD_SURVEY_SELECTION} to add a survey`, () => {
    const surveyId = 'test-survey-1';
    const state = seismic(undefined, {
      type: ADD_SURVEY_SELECTION,
      surveyId,
    });
    const updatedState = seismic(state, {
      type: ADD_SURVEY_SELECTION, // second action should NOT crash
      surveyId,
    });

    expect(updatedState.selections.surveys).toEqual([surveyId]);
  });

  test(`${REMOVE_SURVEY_SELECTION} to remove a survey`, () => {
    const surveyId = 'test-survey-1';
    const state = seismic(
      {
        ...searchInitialState(),
        selections: { surveys: [surveyId], files: [] },
      },
      {
        type: REMOVE_SURVEY_SELECTION,
        surveyId,
      }
    );

    const updatedState = seismic(state, {
      type: REMOVE_SURVEY_SELECTION, // second action should NOT crash
      surveyId,
    });

    expect(updatedState.selections.surveys).toEqual([]);
  });

  test(`${ADD_FILE_SELECTION} to add a survey file`, () => {
    const surveyId = 'test-survey-1';
    const fileId = 'test-file-1';
    const fileName = 'test-file-1';

    const state = seismic(undefined, {
      type: ADD_FILE_SELECTION,
      surveyId,
      fileId,
      fileName,
    });

    const updatedState = seismic(state, {
      type: ADD_FILE_SELECTION, // second action should NOT double add
      surveyId,
      fileId,
      fileName,
    });

    expect(updatedState.selections.files).toEqual([
      { surveyId, fileId, fileName },
    ]);
  });

  test(`${REMOVE_FILE_SELECTION} to remove a survey file`, () => {
    const surveyId = 'test-survey-1';
    const fileId = 'test-file-1';
    const fileName = 'test-file-1';

    const state = seismic(
      {
        ...searchInitialState(),
        selections: { surveys: [], files: [{ surveyId, fileId, fileName }] },
      },
      {
        type: REMOVE_FILE_SELECTION,
        fileId,
      }
    );

    const updatedState = seismic(state, {
      type: REMOVE_FILE_SELECTION, // second action should NOT double add
      fileId,
    });

    expect(updatedState.selections.files).toEqual([]);
  });

  test(`${REMOVE_ALL_FILE_SELECTION} to remove a all survey files`, () => {
    const surveyId = 'test-survey-1';
    const fileId = 'test-file-1';
    const fileName = 'test-file-1';

    const state = seismic(
      {
        ...searchInitialState(),
        selections: { surveys: [], files: [{ surveyId, fileId, fileName }] },
      },
      {
        type: REMOVE_ALL_FILE_SELECTION,
      }
    );

    expect(state.selections.files).toEqual([]);
  });
});
