import { createAsyncThunk } from '@reduxjs/toolkit';
import { FileInfo } from '@cognite/sdk';
import {
  CogniteAnnotation,
  PendingCogniteAnnotation,
  listAnnotationsForFile,
  listFilesAnnotatedWithAssetId,
  linkFileToAssetIds,
  hardDeleteAnnotations,
  clearAnnotationsForFile,
  createAnnotations as createAnnotationsSdk,
  deleteAnnotations as deleteAnnotationsSdk,
} from '@cognite/annotations';
import unionBy from 'lodash/unionBy';
import sdk from 'sdk-singleton';
import { itemSelector as assetSelector } from 'modules/assets';
import {
  updateAction as update,
  updateStatusAction as updateStatus,
} from 'modules/sdk-builder/reducers';

import { itemSelector as fileSelector } from 'modules/files';
import {
  annotationsDefaultState,
  linkedFilesDefaultState,
} from 'modules/annotations';
import { deleteAnnotationsDone, deleteAnnotationsError } from './reducers';
import { AnnotationsState } from './types';

/// ------------------------------------------------------------
/// ------------------------ CREATE ----------------------------
/// ------------------------------------------------------------

export const createAnnotations = {
  action: createAsyncThunk(
    'annotations/create',
    async ({
      file,
      pendingAnnotations,
    }: {
      file: FileInfo;
      pendingAnnotations: PendingCogniteAnnotation[];
    }) => {
      const annotations: any = await createAnnotationsSdk(
        sdk,
        pendingAnnotations
      );
      return {
        annotations,
        fileId: file.id,
      };
    }
  ),
  rejected: (state: AnnotationsState, action: any) => {
    const { fileId } = action.meta.arg;

    state.byFileId[fileId] = {
      ...state.byFileId[fileId],
      status: 'error',
    };
  },
  fulfilled: (state: AnnotationsState, action: any) => {
    const { fileId, annotations } = action.payload;
    if (!state.byFileId[fileId]) {
      state.byFileId[fileId] = {
        ...annotationsDefaultState,
        status: 'success',
      };
    }
    state.byFileId[fileId].annotations = [
      ...state.byFileId[fileId].annotations,
      ...annotations,
    ];
  },
};

/// ------------------------------------------------------------
/// ----------------------- RETRIEVE ---------------------------
/// ------------------------------------------------------------

export const listAnnotations = {
  action: createAsyncThunk(
    'annotations/list',
    async ({
      file,
      shouldClear = true,
      includeDeleted = false,
    }: {
      file: FileInfo;
      shouldClear?: boolean;
      includeDeleted?: boolean;
    }) => {
      const annotations = await listAnnotationsForFile(
        sdk,
        file,
        includeDeleted
      );
      return {
        fileId: file.id,
        shouldClear,
        annotations,
      };
    }
  ),
  pending: (state: AnnotationsState, action: any) => {
    const { id: fileId } = action.meta.arg.file;
    state.byFileId[fileId] = {
      ...(state.byFileId[fileId] || annotationsDefaultState),
      status: 'pending',
    };
  },
  rejected: (state: AnnotationsState, action: any) => {
    const { id: fileId } = action.meta.arg.file;
    state.byFileId[fileId] = {
      ...(state.byFileId[fileId] || annotationsDefaultState),
    };
    state.byFileId[fileId].status = 'error';
  },
  fulfilled: (state: AnnotationsState, action: any) => {
    const { fileId, shouldClear, annotations } = action.payload;
    state.byFileId[fileId] = {
      ...(state.byFileId[fileId] || annotationsDefaultState),
    };
    const currentAnnotations = state.byFileId[fileId]
      ? state.byFileId[fileId].annotations || []
      : [];
    state.byFileId[fileId].status = 'success';
    state.byFileId[fileId].annotations = shouldClear
      ? annotations
      : unionBy(currentAnnotations, annotations, 'id');
  },
};

export const listFilesLinkedToAsset = {
  action: createAsyncThunk(
    'files/listFilesLinkedToAssets',
    async (
      { assetId }: { assetId: number },
      { dispatch, getState }: { dispatch: any; getState: any }
    ) => {
      const asset = assetSelector(getState()); // (assetId);
      if (!asset) {
        return undefined;
      }
      const files = await listFilesAnnotatedWithAssetId(sdk, asset);
      dispatch(update('files')(files));
      return {
        assetId,
        files,
      };
    }
  ),
  pending: (state: AnnotationsState, action: any) => {
    const { assetId } = action.meta.arg;
    state.byAssetId[assetId] = {
      ...(state.byAssetId[assetId] || linkedFilesDefaultState),
      status: 'pending',
    };
  },
  rejected: (state: AnnotationsState, action: any) => {
    const { assetId } = action.meta.arg;
    state.byAssetId[assetId] = {
      ...(state.byAssetId[assetId] || annotationsDefaultState),
      status: 'error',
    };
  },
  fulfilled: (state: AnnotationsState, action: any) => {
    const { files, assetId } = action.payload;
    state.byAssetId[assetId] = {
      ...(state.byAssetId[assetId] || linkedFilesDefaultState),
      fileIds: files.map((el: any) => el.id),
      status: 'success',
    };
  },
};

export const listAnnotationsByFileId = createAsyncThunk(
  'annotations/listByFileId',
  async (
    {
      fileId,
      shouldClear = true,
      includeDeleted = false,
    }: {
      fileId: number | string;
      shouldClear?: boolean;
      includeDeleted?: boolean;
    },
    { dispatch, getState }: { dispatch: any; getState: any }
  ) => {
    const file = fileSelector(getState())(fileId);
    if (file) {
      dispatch(listAnnotations.action({ file, shouldClear, includeDeleted }));
    }
  }
);

/// ------------------------------------------------------------
/// ------------------------ CONNECT ---------------------------
/// ------------------------------------------------------------

export const linkFileWithAssetsFromAnnotations = {
  action: createAsyncThunk(
    'files/linkFileToAssetsFromAnnotations',
    async (
      { fileId }: { fileId: number },
      { dispatch, getState }: { dispatch: any; getState: any }
    ) => {
      const fileIdObj = [{ id: fileId }];
      dispatch(updateStatus('files')(fileIdObj, 'update', 'pending'));
      const annotations = getState().annotations.byFileId[fileId];
      if (!annotations) throw Error();
      const updatedFile = await linkFileToAssetIds(
        sdk,
        annotations.annotations
      );
      if (!updatedFile) {
        updateStatus('files')(fileIdObj, 'update', 'error');
      }
      dispatch(updateStatus('files')(fileIdObj, 'update', 'success'));
      dispatch(update('files')(updatedFile));
      return { items: updatedFile };
    }
  ),
  rejected: () => {
    // [todo]
  },
  fulfilled: () => {
    // [todo]
  },
};

/// ------------------------------------------------------------
/// ------------------------ DELETE ----------------------------
/// ------------------------------------------------------------

/**
 * Spiritual successor of the "remove" action
 */
export const deleteAnnotations = {
  action: createAsyncThunk(
    'annotations/delete',
    async ({
      file,
      annotations,
    }: {
      file: FileInfo;
      annotations: CogniteAnnotation[];
    }) => {
      await deleteAnnotationsSdk(sdk, annotations);
      return {
        annotations,
        fileId: file.id,
      };
    }
  ),
  rejected: deleteAnnotationsError,
  fulfilled: deleteAnnotationsDone,
};

export const clearAnnotations = {
  action: createAsyncThunk(
    'annotations/clear',
    async ({ file }: { file: FileInfo }) => {
      const deletedAnnotations = await clearAnnotationsForFile(sdk, file);
      return {
        annotations: deletedAnnotations,
        fileId: file.id,
      };
    }
  ),
  rejected: deleteAnnotationsError,
  fulfilled: deleteAnnotationsDone,
};

export const hardDeleteAnnotationsForFile = {
  action: createAsyncThunk(
    'annotations/hardDeleteAnnotationsForFile',
    async ({ file }: { file: FileInfo }, { getState }: { getState: any }) => {
      const fileId = file.id;
      const annotations = getState().annotations.byFileId[fileId];
      if (!annotations) throw Error();
      await hardDeleteAnnotations(sdk, annotations);
      return { annotations, fileId };
    }
  ),
  rejected: deleteAnnotationsError,
  fulfilled: deleteAnnotationsDone,
};
