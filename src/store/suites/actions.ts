import { FileLink, IdEither } from '@cognite/sdk';
import { createAction } from 'typesafe-actions';
import { SuitesTableActionTypes, Suite } from './types';

export const suiteTableRequestSuccess = createAction(
  SuitesTableActionTypes.SUITES_TABLE_REQUEST_SUCCESS
)<void>();

export const loadSuitesTable = createAction(
  SuitesTableActionTypes.SUITES_TABLE_LOAD
)<void>();

export const loadedSuitesTable = createAction(
  SuitesTableActionTypes.SUITES_TABLE_LOADED
)<Suite[]>();

export const loadSuitesTableError = createAction(
  SuitesTableActionTypes.SUITES_TABLE_LOAD_ERROR
)<Error>();

export const insertSuiteTableRow = createAction(
  SuitesTableActionTypes.SUITES_TABLE_ROW_INSERT
)<void>();

export const insertSuiteTableRowError = createAction(
  SuitesTableActionTypes.SUITES_TABLE_ROW_INSERT_ERROR
)<Error>();

export const deleteSuiteTableRow = createAction(
  SuitesTableActionTypes.SUITES_TABLE_ROW_DELETE
)<void>();

export const deleteSuiteTableRowError = createAction(
  SuitesTableActionTypes.SUITES_TABLE_ROW_DELETE_ERROR
)<Error>();

export const fetchImgUrls = createAction(
  SuitesTableActionTypes.FETCH_IMG_URLS
)<void>();
export const fetchedImgUrls = createAction(
  SuitesTableActionTypes.FETCHED_IMG_URLS
)<(FileLink & IdEither)[]>();
export const fetchImgUrlsError = createAction(
  SuitesTableActionTypes.FETCH_IMG_URLS_ERROR
)<Error>();
