import { Action, combineReducers, AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { RootState } from 'reducers';
import produce from 'immer';
import unionBy from 'lodash/unionBy';
import { FilesMetadata, Asset } from '@cognite/sdk';
import { createSelector } from 'reselect';
import sdk from 'sdk-singleton';
import {
  CogniteAnnotation,
  listAnnotationsForFile,
  PendingCogniteAnnotation,
  createAnnotations,
  deleteAnnotations,
  clearAnnotationsForFile,
  listFilesAnnotatedWithAssetId,
  linkFileToAssetIds,
  hardDeleteAnnotations,
} from '@cognite/annotations';
import { itemSelector as fileSelector } from './files';
import { itemSelector as assetSelector } from './assets';
import { ApiCall } from './sdk-builder/types';

const LIST_ANNOTATIONS = 'annotations/LIST_ANNOTATIONS';
const LIST_ANNOTATIONS_DONE = 'annotations/LIST_ANNOTATIONS_DONE';
const CREATE_ANNOTATIONS_DONE = 'annotations/CREATE_ANNOTATIONS_DONE';
const LIST_ANNOTATIONS_ERROR = 'annotations/LIST_ANNOTATIONS_ERROR';

const LIST_FILES_LINKED_TO_ASSET = 'annotations/LIST_FILES_LINKED_TO_ASSET';
const LIST_FILES_LINKED_TO_ASSET_DONE =
  'annotations/LIST_FILES_LINKED_TO_ASSET_DONE';
const LIST_FILES_LINKED_TO_ASSET_ERROR =
  'annotations/LIST_FILES_LINKED_TO_ASSET_ERROR';
const CREATE_ANNOTATIONS_ERROR = 'annotations/CREATE_ANNOTATIONS_ERROR';
const DELETE_ANNOTATIONS_DONE = 'annotations/DELETE_ANNOTATIONS_DONE';
const DELETE_ANNOTATIONS_ERROR = 'annotations/DELETE_ANNOTATIONS_ERROR';

interface ListAnnotationAction extends Action<typeof LIST_ANNOTATIONS> {
  fileId: number;
}

interface ListAnnotationDoneAction
  extends Action<typeof LIST_ANNOTATIONS_DONE> {
  fileId: number;
  shouldClear: boolean;
  annotations: CogniteAnnotation[];
}
interface ListAnnotationErrorAction
  extends Action<typeof LIST_ANNOTATIONS_ERROR> {
  fileId: number;
}
interface CreateAnnotationDoneAction
  extends Action<typeof CREATE_ANNOTATIONS_DONE> {
  fileId: number;
  annotations: CogniteAnnotation[];
}
interface CreateAnnotationErrorAction
  extends Action<typeof CREATE_ANNOTATIONS_ERROR> {}

interface ListAnnotationErrorAction
  extends Action<typeof LIST_ANNOTATIONS_ERROR> {
  fileId: number;
}

interface DeleteAnnotationDoneAction
  extends Action<typeof DELETE_ANNOTATIONS_DONE> {
  annotations: CogniteAnnotation[];
  fileId: number;
}
interface DeleteAnnotationErrorAction
  extends Action<typeof DELETE_ANNOTATIONS_ERROR> {}

type AnnotationActions =
  | ListAnnotationAction
  | ListAnnotationDoneAction
  | CreateAnnotationErrorAction
  | DeleteAnnotationErrorAction
  | DeleteAnnotationDoneAction
  | CreateAnnotationDoneAction
  | ListAnnotationErrorAction;

interface ListFileLinkedToAssetAction
  extends Action<typeof LIST_FILES_LINKED_TO_ASSET> {
  assetId: number;
}

interface ListFileLinkedToAssetErrorAction
  extends Action<typeof LIST_FILES_LINKED_TO_ASSET_ERROR> {
  assetId: number;
}

interface ListFileLinkedToAssetDoneAction
  extends Action<typeof LIST_FILES_LINKED_TO_ASSET_DONE> {
  assetId: number;
  files: FilesMetadata[];
}

type ListFilesLinkedToAssetActions =
  | ListFileLinkedToAssetAction
  | ListFileLinkedToAssetErrorAction
  | ListFileLinkedToAssetDoneAction;

export function listByFileId(
  fileId: number | string,
  shouldClear = true,
  includeDeleted = false
) {
  return async (
    dispatch: ThunkDispatch<any, any, AnnotationActions>,
    getState: () => RootState
  ) => {
    const file = fileSelector(getState())(fileId);
    if (file) {
      dispatch(list(file, shouldClear, includeDeleted));
    }
  };
}

export function list(
  file: FilesMetadata,
  shouldClear = true,
  includeDeleted = false
) {
  return async (dispatch: ThunkDispatch<any, any, AnnotationActions>) => {
    dispatch({
      type: LIST_ANNOTATIONS,
      fileId: file.id,
    });
    try {
      const annotations = await listAnnotationsForFile(
        sdk,
        file,
        includeDeleted
      );

      dispatch({
        type: LIST_ANNOTATIONS_DONE,
        fileId: file.id,
        shouldClear,
        annotations,
      });
    } catch (e) {
      dispatch({
        type: LIST_ANNOTATIONS_ERROR,
        fileId: file.id,
      });
    }
  };
}

export function create(
  file: FilesMetadata,
  pendingAnnotations: PendingCogniteAnnotation[]
) {
  return async (dispatch: ThunkDispatch<any, any, AnnotationActions>) => {
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

export function remove(file: FilesMetadata, annotations: CogniteAnnotation[]) {
  return async (dispatch: ThunkDispatch<any, any, AnnotationActions>) => {
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

export function clear(file: FilesMetadata) {
  return async (dispatch: ThunkDispatch<any, any, AnnotationActions>) => {
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
export function hardDeleteAnnotationsForFile(file: FilesMetadata) {
  return async (
    dispatch: ThunkDispatch<any, any, AnnotationActions>,
    getState: () => RootState
  ) => {
    try {
      const annotations = selectAnnotations(getState())(file.id);
      await hardDeleteAnnotations(sdk, annotations);

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

export function listFilesLinkedToAsset(assetId: number) {
  return async (
    dispatch: ThunkDispatch<any, any, AnyAction>,
    getState: () => RootState
  ) => {
    dispatch({
      type: LIST_FILES_LINKED_TO_ASSET,
      assetId,
    });
    const asset = assetSelector(getState())(assetId);
    if (!asset) {
      return;
    }
    try {
      const files = await listFilesAnnotatedWithAssetId(sdk, asset);

      dispatch({
        type: 'files/UPDATE_ITEMS',
        result: files,
        ids: files.map(el => ({ id: el.id })),
      });
      dispatch({
        type: LIST_FILES_LINKED_TO_ASSET_DONE,
        assetId,
        files,
      });
    } catch (e) {
      dispatch({
        type: LIST_FILES_LINKED_TO_ASSET_ERROR,
        assetId,
      });
    }
  };
}

export function linkFileWithAssetsFromAnnotations(fileId: number) {
  return async (
    dispatch: ThunkDispatch<any, any, AnyAction>,
    getState: () => RootState
  ) => {
    const annotations = getState().annotations.byFileId[fileId];
    if (annotations) {
      const updatedFile = await linkFileToAssetIds(
        sdk,
        annotations.annotations
      );

      dispatch({
        type: 'files/UPDATE_ITEMS',
        result: [updatedFile],
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

interface AnnotationByIdStore {
  [key: number]: AnnotationResult;
}
interface LinkedFilesByIdStore {
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

const linkedFilesDefaultState: LinkedFilesResult = {
  ...defaultState,
  fileIds: [],
};

function byFileIdAnnotationReducer(
  state: AnnotationByIdStore = {},
  action: AnnotationActions
): AnnotationByIdStore {
  return produce(state, draft => {
    switch (action.type) {
      case LIST_ANNOTATIONS: {
        draft[action.fileId] = {
          ...(draft[action.fileId] || annotationsDefaultState),
          fetching: true,
        };
        break;
      }

      case LIST_ANNOTATIONS_DONE: {
        draft[action.fileId] = {
          ...(draft[action.fileId] || annotationsDefaultState),
        };
        const currentAnnotations = draft[action.fileId]
          ? draft[action.fileId].annotations || []
          : [];
        draft[action.fileId].done = true;
        draft[action.fileId].fetching = false;
        draft[action.fileId].annotations = action.shouldClear
          ? action.annotations
          : unionBy(currentAnnotations, action.annotations, 'id');
        break;
      }
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

      case LIST_ANNOTATIONS_ERROR: {
        draft[action.fileId] = {
          ...(draft[action.fileId] || annotationsDefaultState),
        };
        draft[action.fileId].done = true;
        draft[action.fileId].error = true;
        draft[action.fileId].fetching = false;
        break;
      }
    }
  });
}
function byAssetIdAnnotationReducer(
  state: LinkedFilesByIdStore = {},
  action: ListFilesLinkedToAssetActions
): LinkedFilesByIdStore {
  switch (action.type) {
    case LIST_FILES_LINKED_TO_ASSET: {
      return {
        ...state,
        [action.assetId]: {
          ...(state[action.assetId] || linkedFilesDefaultState),
          fetching: true,
        },
      };
    }

    case LIST_FILES_LINKED_TO_ASSET_DONE: {
      return {
        ...state,
        [action.assetId]: {
          ...(state[action.assetId] || linkedFilesDefaultState),
          done: true,
          fetching: false,
          fileIds: action.files.map(el => el.id),
        },
      };
    }

    case LIST_FILES_LINKED_TO_ASSET_ERROR: {
      return {
        ...state,
        [action.assetId]: {
          ...(state[action.assetId] || annotationsDefaultState),
          done: true,
          error: true,
          fetching: false,
        },
      };
    }

    default: {
      return state;
    }
  }
}

const reducer = combineReducers({
  byFileId: byFileIdAnnotationReducer,
  byAssetId: byAssetIdAnnotationReducer,
});
export default reducer;

// Selectors
export const linkedFilesSelectorByAssetId = createSelector(
  (state: RootState) => state.annotations.byAssetId,
  fileSelector,
  (assetIdMap, files) => (assetId: number | undefined) => {
    if (!assetId || !assetIdMap[assetId]) {
      return {
        ...linkedFilesDefaultState,
        fileIds: [],
        files: [],
      };
    }
    const { fileIds } = assetIdMap[assetId];
    return {
      ...assetIdMap[assetId],
      files: (fileIds || [])
        .map(id => files(id))
        .filter(el => !!el) as FilesMetadata[],
    };
  }
);
export const linkedFilesSelectorByFileId = createSelector(
  (state: RootState) => state.annotations.byFileId,
  fileSelector,
  (annotationsMap, filesMap) => (fileId: number | undefined) => {
    if (!fileId || !annotationsMap || !annotationsMap[fileId]) {
      return {
        ...linkedFilesDefaultState,
        fileIds: [] as (string | number)[],
        files: [],
      };
    }
    const { annotations } = annotationsMap[fileId];
    const fileIdsSet = new Set<number | string>();
    annotations.forEach(el => {
      if (el.resourceType === 'file') {
        fileIdsSet.add(el.resourceExternalId || el.resourceId!);
      }
    });
    const fileIds = [...fileIdsSet];
    return {
      ...annotationsMap[fileId],
      fileIds,
      files: fileIds
        .map(id => filesMap(id))
        .filter(el => !!el) as FilesMetadata[],
    };
  }
);

export const linkedAssetsSelector = createSelector(
  (state: RootState) => state.annotations.byFileId,
  assetSelector,
  (fileIdMap, assetIdMap) => (fileId: number | undefined) => {
    if (!fileId || !fileIdMap[fileId]) {
      return {
        ...annotationsDefaultState,
        assetIds: [],
        assets: [],
      };
    }
    const { annotations } = fileIdMap[fileId];
    const assetIdsMap = new Set<number | string>();
    annotations.forEach(el => {
      if (el.resourceType === 'asset') {
        assetIdsMap.add(el.resourceExternalId || el.resourceId!);
      }
    });
    const assetIds = [...assetIdsMap];
    return {
      ...fileIdMap[fileId],
      assetIds,
      assets: assetIds.map(id => assetIdMap(id)).filter(el => !!el) as Asset[],
    };
  }
);

export const selectAnnotations = createSelector(
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

export const selectAnnotationsForSource = createSelector(
  selectAnnotations,
  annotationSelector => (
    fileId: number,
    source: string,
    includeDeleted = false
  ) => {
    const items = annotationSelector(fileId, includeDeleted);
    return items.filter(el => el.source === source);
  }
);
