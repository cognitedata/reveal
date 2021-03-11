import { CogniteExternalId, FileInfo } from '@cognite/sdk';
import { Board } from 'store/suites/types';
import { createReducer } from 'typesafe-actions';
import {
  getEmptySuite,
  updateSuite,
  deleteBoardFromSuite,
  updatedBoardList,
  updateBoardWithFileId,
} from 'utils/forms';
import {
  FormActionTypes,
  FormState,
  FormRootAction,
  FileUploadResult,
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
  isErrorListEmpty: true,
  suite: getEmptySuite(),
  board: {},
  imageFile: getImageFileInitialState(),
  files: getFilesInitialState(),
  saving: false,
});

export const FormReducer = createReducer(getInitialState())
  .handleAction(
    FormActionTypes.SET_IS_ERROR_LIST_EMPTY,
    (state: FormState, action: FormRootAction) => ({
      ...state,
      isErrorListEmpty: action.payload,
    })
  )
  .handleAction(
    FormActionTypes.SET_SUITE,
    (state: FormState, action: FormRootAction) => ({
      ...state,
      suite: action.payload,
    })
  )
  .handleAction(
    FormActionTypes.SET_BOARD,
    (state: FormState, action: FormRootAction) => ({
      ...state,
      board: action.payload,
      imageFile: getImageFileInitialState(),
    })
  )
  .handleAction(
    FormActionTypes.ADD_BOARD,
    (state: FormState, action: FormRootAction) => ({
      ...state,
      suite: {
        ...state.suite,
        boards:
          state.suite.boards.concat({
            ...(state.board as Board),
            key: action.payload as string, // new key
          }) || [],
      },
      imageFile: getImageFileInitialState(),
    })
  )
  .handleAction(FormActionTypes.UPDATE_BOARD, (state: FormState) => ({
    ...state,
    suite: updateSuite(state.suite, state.board as Board),
    board: {},
    imageFile: getImageFileInitialState(),
  }))
  .handleAction(
    FormActionTypes.DELETE_BOARD,
    (state: FormState, action: FormRootAction) => ({
      ...state,
      suite: deleteBoardFromSuite(state.suite, action.payload as string),
      board: !(state.board as Board).key
        ? state.board
        : updatedBoardList[0] || {},
    })
  )
  .handleAction(FormActionTypes.CLEAR_BOARD_FORM, (state: FormState) => ({
    ...state,
    board: {},
    imageFile: getImageFileInitialState(),
  }))
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
    FormActionTypes.FILE_UPLOADED,
    (state: FormState, action: FormRootAction) => ({
      ...state,
      suite: updateBoardWithFileId(
        state.suite,
        action.payload as FileUploadResult
      ),
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
  .handleAction(
    FormActionTypes.FILE_EXCLUDE_FROM_BOARD,
    (state: FormState) => ({
      ...state,
      board: {
        ...state.board,
        imageFileId: '',
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
