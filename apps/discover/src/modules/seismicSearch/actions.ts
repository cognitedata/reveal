import { now } from 'utils/date';
import { log } from 'utils/log';

import { LineString, GeoJson } from '@cognite/seismic-sdk-js';

import { showErrorMessage } from 'components/Toast';
import { ThunkResult, TS_FIX_ME } from 'core/types';
import { setGeo } from 'modules/map/actions';
import { REMOVE_ARBITRARYLINE } from 'modules/map/types.actions';
import {
  SEISMIC_NO_SURVEY_ERROR_MESSAGE,
  SEISMIC_FETCHING_DATA_ERROR,
} from 'modules/seismicSearch/constants';
import { seismicService } from 'modules/seismicSearch/service';
import {
  SeismicState,
  SeismicFile,
  SurveyFile,
} from 'modules/seismicSearch/types';
import {
  SeismicAction,
  ADD_SLICE_ERROR,
  ADD_SLICE,
  CREATE_SLICES,
  RESET_DATA_QUERY,
  SET_SEARCH_PHRASE,
  SET_SELECTED_SLICE_ID,
  SET_SELECTED_SEARCH_RESULTS,
  TOGGLE_SELECT_DATASET,
  TOGGLE_BOOLEAN,
  UPDATE_SLICES,
} from 'modules/seismicSearch/types.actions';

import { getSlice } from './utils';

/**
 * This function searches for slices along an arbitrary line for given datasets.
 * @param {string} id the unique identifier given to the request.
 * @param {object[]} dataSets the array containing the datasets to fetch slices for.
 * @param {geosjon} the arbitrary line.
 *
 * @returns {promise} a promise to track when the appropriate action is dispatched
 */
export function searchForSlicesByLine(
  id: string,
  dataSets: TS_FIX_ME[],
  line: GeoJson,
  time: number = now()
): ThunkResult<Promise<void>> {
  return (dispatch) => {
    dispatch({
      type: CREATE_SLICES,
      id,
      slices: [],
      isLoading: true,
      hasError: false,
      time,
    });

    if (!dataSets || dataSets.length === 0) {
      dispatch({
        type: ADD_SLICE_ERROR,
        id,
        file: null,
        error: SEISMIC_NO_SURVEY_ERROR_MESSAGE,
      });
      return Promise.resolve();
    }

    const promises: Promise<void>[] = [];

    dataSets.forEach((file) => {
      promises.push(
        seismicService
          .getSliceByGeometry(file.id, line.geometry as LineString)
          .then((list) => {
            const slice = getSlice(list);
            dispatch({
              type: ADD_SLICE,
              id,
              slice,
              file,
            });
          })
          .catch((error) => {
            log('Seismic polygon search:', error.message, 3);
            showErrorMessage(error.message);

            dispatch({
              type: ADD_SLICE_ERROR,
              id,
              file,
              error: SEISMIC_FETCHING_DATA_ERROR,
            });
          })
      );
    });
    return Promise.all(promises).then(() => {
      dispatch({
        type: UPDATE_SLICES,
        id,
        isLoading: false,
      });
    });
  };
}

/**
 * This function updates the data search query object with the new search phrase.
 * @param {string} phrase the string to set as search phrase
 *
 * @returns {promise} a promise to track when the appropriate action is dispatched
 */
export function setSearchPhrase(phrase: string): SeismicAction {
  return {
    type: SET_SEARCH_PHRASE,
    phrase,
  };
}

/**
 * This function toggles if a dataset is selected or not.
 * @param {object} dataset the dataset to toggle the selection for.
 *
 * @returns {promise} a promise to track when the appropriate action is dispatched
 */
export function toggleSelectDataset(dataset: SeismicFile): ThunkResult<void> {
  return (dispatch) => {
    dispatch({ type: TOGGLE_SELECT_DATASET, dataset });
  };
}

/**
 * This function sets which slice request is selected and displayed.
 * @param {string} id the unique identifier for the slice request.
 *
 * @returns {promise} a promise to track when the appropriate action is dispatched
 */
export function setSelectedSliceId(id: string): SeismicAction {
  return { type: SET_SELECTED_SLICE_ID, id };
}

export function setSeismicCompareIsOpen(value: boolean): SeismicAction {
  return { type: TOGGLE_BOOLEAN, value, field: 'isSeismicCompareOpen' };
}

/**
 * This function resets the query back to its initial state.
 *
 * @returns {promise} a promise to track when the appropriate action is dispatched
 */
export function resetDataSearch(): ThunkResult<void> {
  return (dispatch) => {
    dispatch({ type: RESET_DATA_QUERY });
    setGeo([]);
    dispatch({ type: REMOVE_ARBITRARYLINE });
  };
}

export function setSelectedSearchResults(
  ids: SeismicState['expandedSearchResults']
): SeismicAction {
  return {
    type: SET_SELECTED_SEARCH_RESULTS,
    ids,
  };
}

export const ADD_SURVEY_SELECTION = 'seismic/ADD_SURVEY_SELECTION';
export interface AddSurveySelection {
  type: typeof ADD_SURVEY_SELECTION;
  surveyId: SeismicFile['id'];
}
export function addSurveySelection(surveyId: SeismicFile['id']): SeismicAction {
  return {
    type: ADD_SURVEY_SELECTION,
    surveyId,
  };
}

export const REMOVE_SURVEY_SELECTION = 'seismic/REMOVE_SURVEY_SELECTION';
export interface RemoveSurveySelection {
  type: typeof REMOVE_SURVEY_SELECTION;
  surveyId: SeismicFile['id'];
}
export function removeSurveySelection(
  surveyId: SeismicFile['id']
): SeismicAction {
  return {
    type: REMOVE_SURVEY_SELECTION,
    surveyId,
  };
}

export const ADD_FILE_SELECTION = 'seismic/ADD_FILE_SELECTION';
export interface AddFileSelection extends SurveyFile {
  type: typeof ADD_FILE_SELECTION;
}
export function addFileSelection(file: SeismicFile): SeismicAction {
  return {
    type: ADD_FILE_SELECTION,
    fileId: file.id,
    fileName: file.dataSetName,
    surveyId: file.surveyId,
  };
}

export const REMOVE_FILE_SELECTION = 'seismic/REMOVE_FILE_SELECTION';
export interface RemoveFileSelection {
  type: typeof REMOVE_FILE_SELECTION;
  fileId: SurveyFile['fileId'];
}
export interface RemoveAllFileSelection {
  type: typeof REMOVE_ALL_FILE_SELECTION;
}
export function removeFileSelection(
  fileId: SurveyFile['fileId']
): SeismicAction {
  return {
    type: REMOVE_FILE_SELECTION,
    fileId,
  };
}

export const REMOVE_ALL_FILE_SELECTION = 'seismic/REMOVE_ALL_FILE_SELECTION';
export function removeAllFileSelection() {
  return {
    type: REMOVE_ALL_FILE_SELECTION,
  };
}

export const seismicSearchActions = {
  resetDataSearch,
  setSearchPhrase,
  addFileSelection,
  removeFileSelection,
  removeAllFileSelection,
};
