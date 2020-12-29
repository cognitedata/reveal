import { createReducer } from 'typesafe-actions';
import { FormActionTypes, FormState, FormRootAction } from './types';

const initialState: FormState = {
  isErrorListEmpty: true,
};

export const FormReducer = createReducer(initialState).handleAction(
  FormActionTypes.SET_IS_ERROR_LIST_EMPTY,
  (state: FormState, action: FormRootAction) => ({
    ...state,
    isErrorListEmpty: action.payload,
  })
);
