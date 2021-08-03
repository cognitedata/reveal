import { CogniteExternalId, FileInfo } from '@cognite/sdk';
import { createAction } from 'typesafe-actions';
import { FormActionTypes, FileUpdateError } from './types';

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
// file upload queue
export const fileUploadError = createAction(
  FormActionTypes.FILE_UPLOAD_ERROR
)<FileUpdateError>();

export const filesUpload = createAction(FormActionTypes.FILES_UPLOAD)<void>();
export const filesUploaded = createAction(
  FormActionTypes.FILES_UPLOADED
)<void>();

export const addFileToDeleteQueue = createAction(
  FormActionTypes.FILE_ADD_TO_DELETE_QUEUE
)<CogniteExternalId>();
export const excludeFileFromDeleteQueue = createAction(
  FormActionTypes.FILE_EXCLUDE_FROM_DELETE_QUEUE
)<CogniteExternalId>();
export const filesDeleted = createAction(FormActionTypes.FILES_DELETED)<void>();
