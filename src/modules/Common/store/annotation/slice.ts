import { createSlice, isAnyOf } from '@reduxjs/toolkit';
import { CreateAnnotations } from 'src/store/thunks/Annotation/CreateAnnotations';
import { DeleteAnnotations } from 'src/store/thunks/Annotation/DeleteAnnotations';
import { RetrieveAnnotations } from 'src/store/thunks/Annotation/RetrieveAnnotations';
import { UpdateAnnotations } from 'src/store/thunks/Annotation/UpdateAnnotations';
import { DeleteFilesById } from 'src/store/thunks/Files/DeleteFilesById';
import { VisionJobUpdate } from 'src/store/thunks/Process/VisionJobUpdate';
import {
  clearExplorerFileState,
  clearFileState,
} from 'src/store/commonActions';
import { AnnotationState } from './types';

export const initialState: AnnotationState = {
  files: {
    byId: {},
  },
  annotations: {
    byId: {},
  },
};
const annotationSlice = createSlice({
  name: 'annotation',
  initialState,
  reducers: {},
  /* eslint-disable no-param-reassign */
  extraReducers: (builder) => {
    builder.addCase(
      RetrieveAnnotations.fulfilled,
      (state: AnnotationState, { payload, meta }) => {
        const { fileIds, clearCache } = meta.arg;

        // clear states
        if (clearCache) {
          state.annotations.byId = {};
          state.files.byId = {};
        } else {
          fileIds.forEach((fileId) => {
            const annotationIdsForFile = state.files.byId[fileId];
            if (annotationIdsForFile && annotationIdsForFile.length) {
              annotationIdsForFile.forEach((annotationId) => {
                delete state.annotations.byId[annotationId];
              });
            }
            delete state.files.byId[fileId];
          });
        }

        // update annotations
        payload.forEach((annotation) => {
          if (
            state.files.byId[annotation.annotatedResourceId] &&
            !state.files.byId[annotation.annotatedResourceId].includes(
              annotation.id
            )
          ) {
            state.files.byId[annotation.annotatedResourceId].push(
              annotation.id
            );
          } else {
            state.files.byId[annotation.annotatedResourceId] = [annotation.id];
          }

          if (
            !state.annotations.byId[annotation.id] ||
            state.annotations.byId[annotation.id].lastUpdatedTime !==
              annotation.lastUpdatedTime
          ) {
            state.annotations.byId[annotation.id] = annotation;
          }
        });
      }
    );

    builder.addCase(DeleteAnnotations.fulfilled, (state, { payload }) => {
      payload.forEach((annotationId) => {
        const annotation = state.annotations.byId[annotationId];

        if (annotation) {
          const annotatedFileState =
            state.files.byId[annotation.annotatedResourceId];
          if (annotatedFileState) {
            const filteredState = annotatedFileState.filter(
              (id) => id !== annotationId
            );
            if (filteredState.length) {
              state.files.byId[annotation.annotatedResourceId] = filteredState;
            } else {
              delete state.files.byId[annotation.annotatedResourceId];
            }
          }
          delete state.annotations.byId[annotationId];
        }
      });
    });

    builder.addMatcher(
      // TODO: refactor -> same as RetrieveAnnotations.fulfilled
      isAnyOf(
        CreateAnnotations.fulfilled,
        VisionJobUpdate.fulfilled,
        UpdateAnnotations.fulfilled
      ),
      (state, { payload }) => {
        // update annotations
        payload.forEach((annotation) => {
          if (state.files.byId[annotation.annotatedResourceId]) {
            if (
              !state.files.byId[annotation.annotatedResourceId].includes(
                annotation.id
              )
            ) {
              state.files.byId[annotation.annotatedResourceId].push(
                annotation.id
              );
            }
          } else {
            state.files.byId[annotation.annotatedResourceId] = [annotation.id];
          }
          state.annotations.byId[annotation.id] = annotation;
        });
      }
    );

    builder.addMatcher(
      isAnyOf(
        DeleteFilesById.fulfilled,
        clearFileState,
        clearExplorerFileState
      ),
      (state, action) => {
        action.payload.forEach((fileId) => {
          const fileAnnotations = state.files.byId[fileId];

          if (fileAnnotations && fileAnnotations.length) {
            fileAnnotations.forEach((annotationId) => {
              delete state.annotations.byId[annotationId];
            });
            delete state.files.byId[fileId];
          }
        });
      }
    );
  },
});

export default annotationSlice.reducer;
