import { ActionType } from 'typesafe-actions';
import * as actions from './actions';

export enum FormActionTypes {
  SET_IS_ERROR_LIST_EMPTY = 'form/SET_IS_ERROR_LIST_EMPTY',
}

export type FormRootAction = ActionType<typeof actions>;

export interface FormState {
  isErrorListEmpty: boolean;
}
