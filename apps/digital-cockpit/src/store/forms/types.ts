import { ActionType } from 'typesafe-actions';
import { CogniteExternalId, FileInfo } from '@cognite/sdk';
import * as actions from './actions';

export enum FormActionTypes {
  CLEAR_FORM = 'form/CLEAR_FORM',
  FORM_SAVING = 'form/FORM_SAVING',
  FORM_SAVED = 'form/FORM_SAVED',
  // image file metadata
  FILE_CLEAR = 'form/FILE_CLEAR',
  FILE_RETRIEVE = 'form/FILE_RETRIEVE',
  FILE_RETRIEVE_ERROR = 'form/FILE_RETRIEVE_ERROR',
  FILE_RETRIEVED = 'form/FILE_RETRIEVED',
  // image files upload queue
  FILE_UPLOAD_ERROR = 'form/FILE_UPLOAD_ERROR',
  FILES_UPLOAD = 'form/FILES_UPLOAD',
  FILES_UPLOADED = 'form/FILES_UPLOADED',
  // image files delete queue
  FILE_ADD_TO_DELETE_QUEUE = 'form/FILE_ADD_TO_DELETE_QUEUE',
  FILE_EXCLUDE_FROM_DELETE_QUEUE = 'form/FILE_EXCLUDE_FROM_DELETE_QUEUE',
  FILES_DELETED = 'form/FILES_DELETED',
  // no actions to track the deletion process
}

export type FormRootAction = ActionType<typeof actions>;

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
