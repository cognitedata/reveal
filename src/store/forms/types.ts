import { Suite, Board } from 'store/suites/types';
import { ActionType } from 'typesafe-actions';
import { CogniteExternalId, FileInfo } from '@cognite/sdk';
import * as actions from './actions';

export enum FormActionTypes {
  SET_IS_ERROR_LIST_EMPTY = 'form/SET_IS_ERROR_LIST_EMPTY',
  SET_SUITE = 'form/SET_SUITE',
  SET_BOARD = 'form/SET_BOARD',
  ADD_BOARD = 'form/ADD_BOARD',
  UPDATE_BOARD = 'form/UPDATE_BOARD',
  DELETE_BOARD = 'form/DELETE_BOARD',
  CLEAR_FORM = 'form/CLEAR_FORM',
  FORM_SAVING = 'form/FORM_SAVING',
  FORM_SAVED = 'form/FORM_SAVED',
  FILE_CLEAR = 'form/FILE_CLEAR',
  FILE_RETRIEVE = 'form/FILE_RETRIEVE',
  FILE_RETRIEVE_ERROR = 'form/FILE_RETRIEVE_ERROR',
  FILE_RETRIEVED = 'form/FILE_RETRIEVED',
  FILE_UPLOAD_ERROR = 'form/FILE_UPLOAD_ERROR',
  FILE_UPLOADED = 'form/FILE_UPLOADED',
  FILES_UPLOAD = 'form/FILES_UPLOAD',
  FILES_UPLOADED = 'form/FILES_UPLOADED',
}

export type FormRootAction = ActionType<typeof actions>;

export type BoardState = Board | {};

export type ImageFileState = {
  loading: boolean;
  fileInfo: FileInfo | null;
};

export type FilesUploadState = {
  uploading: boolean;
  uploaded: boolean;
  errors: FileUpdateError[];
};

export interface FormState {
  isErrorListEmpty: boolean;
  suite: Suite;
  board: BoardState;
  imageFile: ImageFileState;
  files: FilesUploadState;
  saving: boolean;
}

export type FileUploadResult = {
  boardKey: string;
  fileExternalId: CogniteExternalId;
};

export type FileUpdateError = {
  boardKey: string;
  error: string;
};
