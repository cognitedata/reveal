import { createSlice } from '@reduxjs/toolkit';
import {
  listAnnotations,
  listAnnotationsByFileId,
  createAnnotations,
  listFilesLinkedToAsset,
  linkFileWithAssetsFromAnnotations,
  deleteAnnotations,
  clearAnnotations,
  hardDeleteAnnotationsForFile,
} from './actions';
import { AnnotationsState, AnnotationResult, LinkedFilesResult } from './types';

const defaultState = {
  fetching: false,
  error: false,
  done: false,
};

export const annotationsDefaultState: AnnotationResult = {
  ...defaultState,
  annotations: [],
};
export const linkedFilesDefaultState: LinkedFilesResult = {
  ...defaultState,
  fileIds: [],
};

export const annotationsSlice = createSlice({
  name: 'annotations',
  initialState: {
    byFileId: {},
    byAssetId: {},
  } as AnnotationsState,
  reducers: {},
  extraReducers: (builder) => {
    // CREATE
    builder
      .addCase(createAnnotations.action.rejected, createAnnotations.rejected)
      .addCase(createAnnotations.action.fulfilled, createAnnotations.fulfilled);

    // RETRIEVE
    builder
      .addCase(listAnnotations.action.pending, listAnnotations.pending)
      .addCase(listAnnotations.action.rejected, listAnnotations.rejected)
      .addCase(listAnnotations.action.fulfilled, listAnnotations.fulfilled);
    builder
      .addCase(
        listFilesLinkedToAsset.action.pending,
        listFilesLinkedToAsset.pending
      )
      .addCase(
        listFilesLinkedToAsset.action.rejected,
        listFilesLinkedToAsset.rejected
      )
      .addCase(
        listFilesLinkedToAsset.action.fulfilled,
        listFilesLinkedToAsset.fulfilled
      );

    // CONNECT
    builder
      .addCase(
        linkFileWithAssetsFromAnnotations.action.rejected,
        linkFileWithAssetsFromAnnotations.rejected
      )
      .addCase(
        linkFileWithAssetsFromAnnotations.action.fulfilled,
        linkFileWithAssetsFromAnnotations.fulfilled
      );

    // DELETE
    builder
      .addCase(deleteAnnotations.action.rejected, deleteAnnotations.rejected)
      .addCase(deleteAnnotations.action.fulfilled, deleteAnnotations.fulfilled);
    builder
      .addCase(clearAnnotations.action.rejected, clearAnnotations.rejected)
      .addCase(clearAnnotations.action.fulfilled, clearAnnotations.fulfilled);
    builder
      .addCase(
        hardDeleteAnnotationsForFile.action.rejected,
        hardDeleteAnnotationsForFile.rejected
      )
      .addCase(
        hardDeleteAnnotationsForFile.action.fulfilled,
        hardDeleteAnnotationsForFile.fulfilled
      );
  },
});

export {
  listAnnotations,
  listAnnotationsByFileId,
  listFilesLinkedToAsset,
  linkFileWithAssetsFromAnnotations,
  createAnnotations,
  deleteAnnotations,
  clearAnnotations,
  hardDeleteAnnotationsForFile,
};
export * from './selectors';
export const { reducer } = annotationsSlice;
