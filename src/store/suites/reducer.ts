import { createReducer } from 'typesafe-actions';
import {
  SuitesTableActionTypes,
  SuitesTableRootAction,
  SuitesTableState,
} from './types';

const initialState: SuitesTableState = {
  loading: false,
  loaded: false,
  error: '',
  suites: null,
};

export const SuitesReducer = createReducer(initialState)
  .handleAction(
    SuitesTableActionTypes.SUITES_TABLE_LOAD,
    (state: SuitesTableState) => ({ ...state, loading: true, error: '' })
  )
  .handleAction(
    SuitesTableActionTypes.SUITES_TABLE_LOADED,
    (state: SuitesTableState, action: SuitesTableRootAction) => ({
      ...state,
      loading: false,
      error: '',
      loaded: true,
      suites: action.payload,
    })
  )
  .handleAction(
    SuitesTableActionTypes.SUITES_TABLE_LOAD_ERROR,
    (state: SuitesTableState, action: SuitesTableRootAction) => ({
      ...state,
      loading: false,
      error: action.payload,
    })
  )
  .handleAction(
    SuitesTableActionTypes.SUITES_TABLE_ROW_INSERT,
    (state: SuitesTableState) => ({ ...state, loading: true, error: '' })
  )
  .handleAction(
    SuitesTableActionTypes.SUITES_TABLE_ROW_INSERTED,
    (state: SuitesTableState) => ({
      ...state,
      loading: false,
      error: '',
      loaded: true,
    })
  )
  .handleAction(
    SuitesTableActionTypes.SUITES_TABLE_ROW_INSERT_ERROR,
    (state: SuitesTableState, action: SuitesTableRootAction) => ({
      ...state,
      loading: false,
      error: action.payload,
    })
  )
  .handleAction(
    SuitesTableActionTypes.SUITES_TABLE_ROW_DELETE,
    (state: SuitesTableState) => ({
      ...state,
      loading: true,
      error: '',
    })
  )
  .handleAction(
    SuitesTableActionTypes.SUITES_TABLE_ROW_DELETED,
    (state: SuitesTableState) => ({
      ...state,
      loading: false,
      error: '',
      loaded: true,
    })
  )
  .handleAction(
    SuitesTableActionTypes.SUITES_TABLE_ROW_DELETE_ERROR,
    (state: SuitesTableState, action: SuitesTableRootAction) => ({
      ...state,
      loading: false,
      error: action.payload,
    })
  );
