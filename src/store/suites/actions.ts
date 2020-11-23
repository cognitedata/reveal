import { createAction } from 'typesafe-actions';
import { SuitesTableActionTypes, Suite } from './types';

export const loadSuitesTable = createAction(
  SuitesTableActionTypes.SUITES_TABLE_LOAD
)<void>();

export const loadedSuitesTable = createAction(
  SuitesTableActionTypes.SUITES_TABLE_LOADED
)<Suite[]>();

export const loadSuitesTableError = createAction(
  SuitesTableActionTypes.SUITES_TABLE_LOAD_ERROR
)<Error>();
