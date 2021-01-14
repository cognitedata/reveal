import { Suite, Board } from 'store/suites/types';
import { ActionType } from 'typesafe-actions';
import * as actions from './actions';

export enum FormActionTypes {
  SET_IS_ERROR_LIST_EMPTY = 'form/SET_IS_ERROR_LIST_EMPTY',
  SET_SUITE = 'form/SET_SUITE',
  SET_BOARD = 'form/SET_BOARD',
  ADD_BOARD = 'form/ADD_BOARD',
  UPDATE_BOARD = 'form/UPDATE_BOARD',
  DELETE_BOARD = 'form/DELETE_BOARD',
  CLEAR_SUITE = 'form/CLEAR_SUITE',
  CLEAR_BOARD = 'form/CLEAR_BOARD',
}

export type FormRootAction = ActionType<typeof actions>;

export type BoardState = Board | {};

export interface FormState {
  isErrorListEmpty: boolean;
  suite: Suite;
  board: BoardState;
}
