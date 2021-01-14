import { Suite } from 'store/suites/types';
import { createAction } from 'typesafe-actions';
import { BoardState, FormActionTypes } from './types';

export const setHasError = createAction(
  FormActionTypes.SET_IS_ERROR_LIST_EMPTY
)<boolean>();

export const setSuite = createAction(FormActionTypes.SET_SUITE)<Suite>();

export const setBoard = createAction(FormActionTypes.SET_BOARD)<BoardState>();

export const addBoard = createAction(FormActionTypes.ADD_BOARD)<void>();

export const updateBoard = createAction(FormActionTypes.UPDATE_BOARD)<void>();

export const deleteBoard = createAction(FormActionTypes.DELETE_BOARD)<string>();

export const clearSuite = createAction(FormActionTypes.CLEAR_SUITE)<void>();

export const clearBoard = createAction(FormActionTypes.CLEAR_BOARD)<void>();
