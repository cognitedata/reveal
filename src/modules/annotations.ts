import { Action, combineReducers } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { RootState } from 'reducers';
import produce from 'immer';
import { FileInfo } from '@cognite/sdk';
import { createSelector } from 'reselect';
import {
  CogniteAnnotation,
  // listAnnotationsForFile,
  PendingCogniteAnnotation,
  createAnnotations,
  deleteAnnotations,
  clearAnnotationsForFile,
  // listFilesAnnotatedWithAssetId,
  // linkFileToAssetIds,
  hardDeleteAnnotations,
} from '@cognite/annotations';
// import { itemSelector as fileSelector } from '@cognite/cdf-resources-store/dist/files';
// import { itemSelector as assetSelector } from '@cognite/cdf-resources-store/dist/assets';
import { ApiCall } from '@cognite/cdf-resources-store';
import { getSDK } from 'utils/SDK';

const CREATE_ANNOTATIONS_DONE = 'annotations/CREATE_ANNOTATIONS_DONE';
const CREATE_ANNOTATIONS_ERROR = 'annotations/CREATE_ANNOTATIONS_ERROR';
const DELETE_ANNOTATIONS_DONE = 'annotations/DELETE_ANNOTATIONS_DONE';
const DELETE_ANNOTATIONS_ERROR = 'annotations/DELETE_ANNOTATIONS_ERROR';

interface CreateAnnotationDoneAction
  extends Action<typeof CREATE_ANNOTATIONS_DONE> {
  fileId: number;
  annotations: CogniteAnnotation[];
}
interface CreateAnnotationErrorAction
  extends Action<typeof CREATE_ANNOTATIONS_ERROR> {}

interface DeleteAnnotationDoneAction
  extends Action<typeof DELETE_ANNOTATIONS_DONE> {
  annotations: CogniteAnnotation[];
  fileId: number;
}
interface DeleteAnnotationErrorAction
  extends Action<typeof DELETE_ANNOTATIONS_ERROR> {}

type AnnotationActions =
  | CreateAnnotationErrorAction
  | DeleteAnnotationErrorAction
  | DeleteAnnotationDoneAction
  | CreateAnnotationDoneAction;

export function create(
  file: FileInfo,
  pendingAnnotations: PendingCogniteAnnotation[]
) {
  return async (dispatch: ThunkDispatch<any, any, AnnotationActions>) => {
    const sdk = getSDK();
    try {
      const annotations = await createAnnotations(sdk, pendingAnnotations);

      dispatch({
        type: CREATE_ANNOTATIONS_DONE,
        annotations,
        fileId: file.id,
      });
    } catch (e) {
      dispatch({
        type: CREATE_ANNOTATIONS_ERROR,
      });
    }
  };
}

export function remove(file: FileInfo, annotations: CogniteAnnotation[]) {
  return async (dispatch: ThunkDispatch<any, any, AnnotationActions>) => {
    const sdk = getSDK();
    try {
      await deleteAnnotations(sdk, annotations);

      dispatch({
        type: DELETE_ANNOTATIONS_DONE,
        annotations,
        fileId: file.id,
      });
    } catch (e) {
      dispatch({
        type: DELETE_ANNOTATIONS_ERROR,
      });
    }
  };
}

export function clear(file: FileInfo) {
  return async (dispatch: ThunkDispatch<any, any, AnnotationActions>) => {
    const sdk = getSDK();
    try {
      const deletedAnnotations = await clearAnnotationsForFile(sdk, file);

      dispatch({
        type: DELETE_ANNOTATIONS_DONE,
        annotations: deletedAnnotations,
        fileId: file.id,
      });
    } catch (e) {
      dispatch({
        type: DELETE_ANNOTATIONS_ERROR,
      });
    }
  };
}
export function hardDeleteAnnotationsForFile(file: FileInfo) {
  return async (
    dispatch: ThunkDispatch<any, any, AnnotationActions>,
    getState: () => RootState
  ) => {
    const sdk = getSDK();
    try {
      const annotations = selectAnnotations(getState())(file.id);
      await hardDeleteAnnotations(sdk, file);

      dispatch({
        type: DELETE_ANNOTATIONS_DONE,
        annotations,
        fileId: file.id,
      });
    } catch (e) {
      dispatch({
        type: DELETE_ANNOTATIONS_ERROR,
      });
    }
  };
}

interface AnnotationResult extends ApiCall {
  annotations: CogniteAnnotation[];
}

interface LinkedFilesResult extends ApiCall {
  fileIds: number[];
}

export interface AnnotationByIdStore {
  [key: number]: AnnotationResult;
}
export interface LinkedFilesByIdStore {
  [key: number]: LinkedFilesResult;
}

export interface AnnotationsStore {
  byFileId: AnnotationByIdStore;
  byAssetId: LinkedFilesByIdStore;
}

const defaultState = {
  fetching: false,
  error: false,
  done: false,
};

const annotationsDefaultState: AnnotationResult = {
  ...defaultState,
  annotations: [],
};

function byFileIdAnnotationReducer(
  state: AnnotationByIdStore = {},
  action: AnnotationActions
): AnnotationByIdStore {
  return produce(state, draft => {
    switch (action.type) {
      case CREATE_ANNOTATIONS_DONE: {
        if (!draft[action.fileId]) {
          draft[action.fileId] = {
            ...annotationsDefaultState,
            done: true,
            fetching: false,
          };
        }
        draft[action.fileId].annotations = [
          ...draft[action.fileId].annotations,
          ...action.annotations,
        ];
        break;
      }

      case DELETE_ANNOTATIONS_DONE: {
        action.annotations.forEach(el => {
          if (draft[action.fileId] && draft[action.fileId].annotations) {
            draft[action.fileId].annotations = draft[
              action.fileId
            ].annotations.filter(annotation => annotation.id !== el.id);
          }
        });
        break;
      }
    }
  });
}

const reducer = combineReducers({
  byFileId: byFileIdAnnotationReducer,
});
export default reducer;

// Selectors

const selectAnnotations = createSelector(
  (state: RootState) => state.annotations.byFileId,
  annotationMap => (fileId?: number, includeDeleted = false) => {
    if (!fileId) {
      return [];
    }
    const items = (annotationMap[fileId] || {}).annotations || [];
    if (includeDeleted) {
      return items;
    }
    return items.filter(el => el.status !== 'deleted');
  }
);
