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

export const insertSuiteTableRow = createAction(
  SuitesTableActionTypes.SUITES_TABLE_ROW_INSERT
)<void>();

export const insertedSuiteTableRow = createAction(
  SuitesTableActionTypes.SUITES_TABLE_ROW_INSERTED
)<void>();

export const insertSuiteTableRowError = createAction(
  SuitesTableActionTypes.SUITES_TABLE_ROW_INSERT_ERROR
)<Error>();

export const deleteSuiteTableRow = createAction(
  SuitesTableActionTypes.SUITES_TABLE_ROW_DELETE
)<void>();

export const deletedSuiteTableRow = createAction(
  SuitesTableActionTypes.SUITES_TABLE_ROW_DELETED
)<void>();

export const deleteSuiteTableRowError = createAction(
  SuitesTableActionTypes.SUITES_TABLE_ROW_DELETE_ERROR
)<Error>();
