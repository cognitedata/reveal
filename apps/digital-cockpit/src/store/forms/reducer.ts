import { CogniteExternalId, FileInfo } from '@cognite/sdk';
import { createReducer } from 'typesafe-actions';
import {
  FormActionTypes,
  FormState,
  FormRootAction,
  FileUpdateError,
  ImageFileState,
  FilesUploadState,
} from './types';

const getImageFileInitialState = (): ImageFileState => ({
  loading: false,
  fileInfo: null,
});
const getFilesInitialState = (): FilesUploadState => ({
  uploading: false,
  uploaded: false,
  errors: [],
  deleteQueue: [],
});

const getInitialState = (): FormState => ({
  imageFile: getImageFileInitialState(),
  files: getFilesInitialState(),
  saving: false,
});

export const FormReducer = createReducer(getInitialState())
  .handleAction(FormActionTypes.CLEAR_FORM, () => ({
    ...getInitialState(),
  }))
  .handleAction(FormActionTypes.FORM_SAVING, (state: FormState) => ({
    ...state,
    saving: true,
  }))
  .handleAction(FormActionTypes.FORM_SAVED, (state: FormState) => ({
    ...state,
    files: getFilesInitialState(),
    saving: false,
  }))

  // image file

  .handleAction(FormActionTypes.FILE_CLEAR, (state: FormState) => ({
    ...state,
    imageFile: getImageFileInitialState(),
  }))
  .handleAction(FormActionTypes.FILE_RETRIEVE, (state: FormState) => ({
    ...state,
    imageFile: {
      ...state.imageFile,
      loading: true,
    },
  }))
  .handleAction(FormActionTypes.FILE_RETRIEVE_ERROR, (state: FormState) => ({
    ...state,
    imageFile: {
      loading: false,
      fileInfo: null,
    },
  }))
  .handleAction(
    FormActionTypes.FILE_RETRIEVED,
    (state: FormState, action: FormRootAction) => ({
      ...state,
      imageFile: {
        loading: false,
        fileInfo: action.payload as FileInfo,
      },
    })
  )
  .handleAction(
    FormActionTypes.FILE_UPLOAD_ERROR,
    (state: FormState, action: FormRootAction) => ({
      ...state,
      files: {
        ...state.files,
        errors: [...state.files.errors, action.payload as FileUpdateError],
      },
    })
  )
  .handleAction(FormActionTypes.FILES_UPLOAD, (state: FormState) => ({
    ...state,
    files: {
      ...state.files,
      uploading: true,
      uploaded: false,
      errors: [],
    },
  }))
  .handleAction(
    FormActionTypes.FILE_ADD_TO_DELETE_QUEUE,
    (state: FormState, action: FormRootAction) => ({
      ...state,
      files: {
        ...state.files,
        deleteQueue: [
          ...state.files.deleteQueue,
          action.payload as CogniteExternalId,
        ],
      },
    })
  )
  .handleAction(
    FormActionTypes.FILE_EXCLUDE_FROM_DELETE_QUEUE,
    (state: FormState, action: FormRootAction) => ({
      ...state,
      files: {
        ...state.files,
        deleteQueue: state.files.deleteQueue.filter(
          (item) => item !== (action.payload as CogniteExternalId)
        ),
      },
    })
  )
  .handleAction(FormActionTypes.FILES_DELETED, (state: FormState) => ({
    ...state,
    files: {
      ...state.files,
      deleteQueue: [],
    },
  }));
