import { FileLink, IdEither } from '@cognite/sdk';
import { createAction } from 'typesafe-actions';
import { SuitesTableActionTypes, Suite } from './types';

export const loadSuitesTable = createAction(
  SuitesTableActionTypes.SUITES_TABLE_LOAD
)<void>();

export const loadedSuitesTable = createAction(
  SuitesTableActionTypes.SUITES_TABLE_LOADED
)<Suite[]>();

export const loadSuitesTableFailed = createAction(
  SuitesTableActionTypes.SUITES_TABLE_LOAD_FAILED
)<void>();

export const saveSuite = createAction(
  SuitesTableActionTypes.SUITE_SAVE
)<void>();

export const suiteError = createAction(
  SuitesTableActionTypes.SUITE_ERROR
)<void>();

export const deleteSuite = createAction(
  SuitesTableActionTypes.SUITE_DELETE
)<void>();

export const fetchImgUrls = createAction(
  SuitesTableActionTypes.FETCH_IMG_URLS
)<void>();
export const fetchedImgUrls = createAction(
  SuitesTableActionTypes.FETCHED_IMG_URLS
)<(FileLink & IdEither)[]>();
export const fetchImgUrlsFailed = createAction(
  SuitesTableActionTypes.FETCH_IMG_URLS_FAILED
)<void>();
export const clearImgUrls = createAction(
  SuitesTableActionTypes.CLEAR_IMG_URLS
)<void>();
