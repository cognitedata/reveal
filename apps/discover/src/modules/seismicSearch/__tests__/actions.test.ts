import 'modules/seismicSearch/__mocks/mockSeismicSdk';
import { now } from 'utils/date';

import { GeoJson } from '@cognite/seismic-sdk-js';

import { getMockedStore } from '__test-utils/store.utils';
import { REMOVE_ARBITRARYLINE } from 'modules/map/types.actions';
import {
  ADD_SURVEY_SELECTION,
  REMOVE_SURVEY_SELECTION,
  setSearchPhrase,
  addSurveySelection,
  removeSurveySelection,
  toggleSelectDataset,
  setSelectedSliceId,
  setSeismicCompareIsOpen,
  resetDataSearch,
  setSelectedSearchResults,
  addFileSelection,
  ADD_FILE_SELECTION,
  removeFileSelection,
  REMOVE_FILE_SELECTION,
  removeAllFileSelection,
  REMOVE_ALL_FILE_SELECTION,
  searchForSlicesByLine,
} from 'modules/seismicSearch/actions';
import {
  ADD_SLICE_ERROR,
  CREATE_SLICES,
  RESET_DATA_QUERY,
  SET_SEARCH_PHRASE,
  SET_SELECTED_SEARCH_RESULTS,
  SET_SELECTED_SLICE_ID,
  TOGGLE_BOOLEAN,
  TOGGLE_SELECT_DATASET,
  UPDATE_SLICES,
} from 'modules/seismicSearch/types.actions';

import {
  SEISMIC_FETCHING_DATA_ERROR,
  SEISMIC_NO_SURVEY_ERROR_MESSAGE,
} from '../constants';

describe('Seismic Actions', () => {
  it('should search for slices byLine', async () => {
    const id = 'test1';
    const files = [
      {
        id: '1',
        surveyId: '123',
        survey: 'test-survey',
        dataSetName: 'test-dataset',
        selected: false,
      },
    ];
    const dataSets = [
      {
        id: '123',
        survey: 'test-survey',
        surveys: files,
      },
    ];

    const line: GeoJson = {
      type: 'Point',
      geometry: { type: 'Point', coordinates: [13.3123, 43.4313] },
    };
    const store = getMockedStore();
    const time = now();
    await store.dispatch(
      searchForSlicesByLine(id, dataSets, line, time) as any
    );
    expect(store.getActions()).toEqual([
      {
        type: CREATE_SLICES,
        id,
        slices: [],
        isLoading: true,
        hasError: false,
        time,
      },
      {
        type: ADD_SLICE_ERROR,
        id,
        file: dataSets[0],
        error: SEISMIC_FETCHING_DATA_ERROR,
      },
      {
        type: UPDATE_SLICES,
        id,
        isLoading: false,
      },
    ]);
  });

  it('should search for slices byLine empty dataset', async () => {
    const id = 'test1';

    const dataSets: any[] = [];

    const line: GeoJson = {
      type: 'Point',
      geometry: { type: 'Point', coordinates: [13.3123, 43.4313] },
    };
    const store = getMockedStore();
    const time = now();
    await store.dispatch(
      searchForSlicesByLine(id, dataSets, line, time) as any
    );
    expect(store.getActions()).toEqual([
      {
        type: CREATE_SLICES,
        id,
        slices: [],
        isLoading: true,
        hasError: false,
        time,
      },
      {
        type: ADD_SLICE_ERROR,
        id,
        file: null,
        error: SEISMIC_NO_SURVEY_ERROR_MESSAGE,
      },
    ]);
  });

  it('should add survey to selection', () => {
    const surveyId = 'test1';
    const store = getMockedStore();
    store.dispatch(addSurveySelection(surveyId));
    expect(store.getActions()).toEqual([
      { type: ADD_SURVEY_SELECTION, surveyId },
    ]);
  });

  it('should add file to dataset', async () => {
    const dataset = {
      id: '1',
      surveyId: '123',
      survey: 'test-survey',
      dataSetName: 'test-dataset',
      selected: false,
    };
    const store = getMockedStore();
    await store.dispatch(toggleSelectDataset(dataset) as any);
    expect(store.getActions()).toEqual([
      { type: TOGGLE_SELECT_DATASET, dataset },
    ]);
  });

  it('should set selected sliceId', async () => {
    const id = 'test';
    const store = getMockedStore();
    await store.dispatch(setSelectedSliceId(id));
    expect(store.getActions()).toEqual([{ type: SET_SELECTED_SLICE_ID, id }]);
  });

  it('should set seismic compare isOpen', async () => {
    const value = true;
    const store = getMockedStore();
    await store.dispatch(setSeismicCompareIsOpen(value));
    expect(store.getActions()).toEqual([
      { type: TOGGLE_BOOLEAN, value, field: 'isSeismicCompareOpen' },
    ]);
  });

  it('should reset data search', async () => {
    const store = getMockedStore();
    await store.dispatch(resetDataSearch() as any);
    expect(store.getActions()).toEqual([
      { type: RESET_DATA_QUERY },
      { type: REMOVE_ARBITRARYLINE },
    ]);
  });

  it('should add file selection', async () => {
    const file = {
      id: '1',
      surveyId: '123',
      survey: 'test-survey',
      dataSetName: 'test-dataset',
      selected: false,
    };
    const store = getMockedStore();
    await store.dispatch(addFileSelection(file));
    expect(store.getActions()).toEqual([
      {
        type: ADD_FILE_SELECTION,
        fileId: file.id,
        fileName: file.dataSetName,
        surveyId: file.surveyId,
      },
    ]);
  });

  it('should remove file', async () => {
    const fileId = 'test';
    const store = getMockedStore();
    await store.dispatch(removeFileSelection(fileId));
    expect(store.getActions()).toEqual([
      { type: REMOVE_FILE_SELECTION, fileId },
    ]);
  });

  it('should remove all files', async () => {
    const store = getMockedStore();
    await store.dispatch(removeAllFileSelection() as any);
    expect(store.getActions()).toEqual([{ type: REMOVE_ALL_FILE_SELECTION }]);
  });

  it('should set selected search results', async () => {
    const ids = { test: true };
    const store = getMockedStore();
    await store.dispatch(setSelectedSearchResults(ids));
    expect(store.getActions()).toEqual([
      { type: SET_SELECTED_SEARCH_RESULTS, ids },
    ]);
  });

  it('should remove survey from selection', () => {
    const surveyId = 'test1';
    const store = getMockedStore();
    store.dispatch(removeSurveySelection(surveyId));
    expect(store.getActions()).toEqual([
      { type: REMOVE_SURVEY_SELECTION, surveyId },
    ]);
  });

  it(`creates ${SET_SEARCH_PHRASE} when changing the search phrase`, () => {
    const expectedActions = [{ type: SET_SEARCH_PHRASE, phrase: 'test' }];
    const store = getMockedStore();
    store.dispatch(setSearchPhrase('test'));
    expect(store.getActions()).toEqual(expectedActions);
  });
});
