import { createAction } from 'typesafe-actions';
import { FormActionTypes } from './types';

export const setHasError = createAction(
  FormActionTypes.SET_IS_ERROR_LIST_EMPTY
)<boolean>();
