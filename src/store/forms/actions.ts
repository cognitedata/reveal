import { FileInfo } from '@cognite/sdk';
import { Suite } from 'store/suites/types';
import { createAction } from 'typesafe-actions';
import {
  BoardState,
  FormActionTypes,
  FileUploadResult,
  FileUpdateError,
} from './types';

export const setHasError = createAction(
  FormActionTypes.SET_IS_ERROR_LIST_EMPTY
)<boolean>();

export const setSuite = createAction(FormActionTypes.SET_SUITE)<Suite>();

export const setBoard = createAction(FormActionTypes.SET_BOARD)<BoardState>();

export const addBoard = createAction(FormActionTypes.ADD_BOARD)<string>();

export const updateBoard = createAction(FormActionTypes.UPDATE_BOARD)<void>();

export const deleteBoard = createAction(FormActionTypes.DELETE_BOARD)<string>();

export const clearForm = createAction(FormActionTypes.CLEAR_FORM)<void>();

export const formSaving = createAction(FormActionTypes.FORM_SAVING)<void>();
export const formSaved = createAction(FormActionTypes.FORM_SAVED)<void>();

// image files

export const clearFile = createAction(FormActionTypes.FILE_CLEAR)<void>();
export const retrieveFile = createAction(FormActionTypes.FILE_RETRIEVE)<void>();
export const fileRetrieveError = createAction(
  FormActionTypes.FILE_RETRIEVE_ERROR
)<Error>();
export const retrievedFile = createAction(
  FormActionTypes.FILE_RETRIEVED
)<FileInfo>();
export const fileUploadError = createAction(
  FormActionTypes.FILE_UPLOAD_ERROR
)<FileUpdateError>();
export const fileUploaded = createAction(
  FormActionTypes.FILE_UPLOADED
)<FileUploadResult>();

export const filesUpload = createAction(FormActionTypes.FILES_UPLOAD)<void>();
export const filesUploaded = createAction(
  FormActionTypes.FILES_UPLOADED
)<void>();
