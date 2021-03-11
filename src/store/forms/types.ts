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
  CLEAR_BOARD_FORM = 'form/CLEAR_BOARD_FORM',
  FORM_SAVING = 'form/FORM_SAVING',
  FORM_SAVED = 'form/FORM_SAVED',
  // image file metadata
  FILE_CLEAR = 'form/FILE_CLEAR',
  FILE_RETRIEVE = 'form/FILE_RETRIEVE',
  FILE_RETRIEVE_ERROR = 'form/FILE_RETRIEVE_ERROR',
  FILE_RETRIEVED = 'form/FILE_RETRIEVED',
  // image files upload queue
  FILE_UPLOAD_ERROR = 'form/FILE_UPLOAD_ERROR',
  FILE_UPLOADED = 'form/FILE_UPLOADED',
  FILES_UPLOAD = 'form/FILES_UPLOAD',
  FILES_UPLOADED = 'form/FILES_UPLOADED',
  // image files delete queue
  FILE_ADD_TO_DELETE_QUEUE = 'form/FILE_ADD_TO_DELETE_QUEUE',
  FILE_EXCLUDE_FROM_DELETE_QUEUE = 'form/FILE_EXCLUDE_FROM_DELETE_QUEUE',
  FILE_EXCLUDE_FROM_BOARD = 'form/FILE_EXCLUDE_FROM_BOARD',
  FILES_DELETED = 'form/FILES_DELETED',
  // no actions to track the deletion process
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
  deleteQueue: CogniteExternalId[];
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
