import { TS_FIX_ME } from 'core';

import { TableResults } from 'components/Tablev3/resultTypes';

import {
  AddSurveySelection,
  RemoveSurveySelection,
  AddFileSelection,
  RemoveFileSelection,
  RemoveAllFileSelection,
} from './actions';
import {
  BooleanStateKeys,
  SeismicCollection,
  SeismicLine,
  SeismicState,
  SeismicFile,
} from './types';

// from now on don't make these here, just put them in the actions directly
// too much hassel going through all these different files
// better to co-locate as much of the redux setup as possible
export const ADD_SLICE = 'seismic/ADD_SLICE';
export const ADD_SLICE_ERROR = 'seismic/ADD_SLICE_ERROR';
export const CREATE_SLICES = 'seismic/CREATE_SLICES';
export const RESET_DATA_QUERY = 'seismic/SEARCH_RESET_DATA_QUERY';
export const SET_DATASET_IS_WORKING = 'seismic/SET_DATASET_IS_WORKING';
export const SET_IS_SEARCHING = 'seismic/SET_IS_SEARCHING';
export const SET_SEARCH_PHRASE = 'seismic/SEARCH_SET_SEARCH_PHRASE';
export const SET_SELECTED_SEARCH_RESULTS =
  'seismic/SET_SELECTED_SEARCH_RESULTS';
export const SET_SELECTED_SLICE_ID = 'seismic/SET_SELECTED_SLICE_ID';
export const SET_SURVEYS = 'seismic/SEARCH_SET_SURVEYS';
export const SET_ERROR = 'seismic/SEARCH_SET_ERROR';
export const TOGGLE_BOOLEAN = 'seismic/TOGGLE_BOOLEAN';
export const TOGGLE_SELECT_DATASET = 'seismic/TOGGLE_SELECT_DATASET';
export const UPDATE_SLICES = 'seismic/UPDATE_SLICES';

interface SetDatasetIsWorking {
  type: typeof SET_DATASET_IS_WORKING;
  surveyId: SeismicFile['id'];
  sliceid: SeismicLine['id'];
  isWorking: boolean;
}
interface ToogleBoolean {
  type: typeof TOGGLE_BOOLEAN;
  field: BooleanStateKeys;
  value: boolean;
}
interface SetIsSearching {
  type: typeof SET_IS_SEARCHING;
  isSearching: SeismicState['isSearching'];
}
interface AddSlice {
  type: typeof ADD_SLICE;
  id: string;
  slice: TS_FIX_ME;
  file: TS_FIX_ME;
}
interface AddSliceError {
  type: typeof ADD_SLICE_ERROR;
  id: string;
  data?: null;
  file: TS_FIX_ME;
  error: TS_FIX_ME;
}
interface UpdateSlices {
  type: typeof UPDATE_SLICES;
  id: string;
  isLoading: boolean;
}
interface ResetDataQuery {
  type: typeof RESET_DATA_QUERY;
}
interface CreateSlices extends SeismicCollection {
  type: typeof CREATE_SLICES;
}

interface SetSearchPhrase {
  type: typeof SET_SEARCH_PHRASE;
  phrase: string;
}

interface ToggleSelectDataset {
  type: typeof TOGGLE_SELECT_DATASET;
  dataset: SeismicFile;
}

interface SetSelectedSliceId {
  type: typeof SET_SELECTED_SLICE_ID;
  id: string;
}

interface SetExpandedResults {
  type: typeof SET_SELECTED_SEARCH_RESULTS;
  ids: TableResults;
}

interface SetError {
  type: typeof SET_ERROR;
  message?: string;
}

export type SeismicAction =
  | AddSlice
  | AddSliceError
  | CreateSlices
  | ResetDataQuery
  | SetDatasetIsWorking
  | SetExpandedResults
  | SetIsSearching
  | SetSearchPhrase
  | SetSelectedSliceId
  | SetError
  | ToggleSelectDataset
  | ToogleBoolean
  | UpdateSlices
  | AddSurveySelection
  | RemoveSurveySelection
  | AddFileSelection
  | RemoveFileSelection
  | RemoveAllFileSelection;
