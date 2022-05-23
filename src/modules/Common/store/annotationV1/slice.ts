import { createSlice, isAnyOf } from '@reduxjs/toolkit';
import { CreateAnnotationsV1 } from 'src/store/thunks/Annotation/CreateAnnotationsV1';
import { DeleteAnnotationsV1 } from 'src/store/thunks/Annotation/DeleteAnnotationsV1';
import { RetrieveAnnotationsV1 } from 'src/store/thunks/Annotation/RetrieveAnnotationsV1';
import { UpdateAnnotationsV1 } from 'src/store/thunks/Annotation/UpdateAnnotationsV1';
import { DeleteFilesById } from 'src/store/thunks/Files/DeleteFilesById';
import { VisionJobUpdate } from 'src/store/thunks/Process/VisionJobUpdate';
import { clearAnnotationState } from 'src/store/commonActions';
import { AnnotationStateV1 } from 'src/modules/Common/store/annotationV1/types';

export const initialState: AnnotationStateV1 = {
  files: {
    byId: {},
  },
  annotations: {
    byId: {},
  },
};
const annotationSliceV1 = createSlice({
  name: 'annotationV1',
  initialState,
  reducers: {},
  /* eslint-disable no-param-reassign */
  extraReducers: (builder) => {
    builder.addCase(
      RetrieveAnnotationsV1.fulfilled,
      (state: AnnotationStateV1, { payload, meta }) => {
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

    builder.addCase(DeleteAnnotationsV1.fulfilled, (state, { payload }) => {
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
      // TODO: refactor -> same as RetrieveAnnotationsV1.fulfilled
      isAnyOf(
        CreateAnnotationsV1.fulfilled,
        VisionJobUpdate.fulfilled,
        UpdateAnnotationsV1.fulfilled
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
      isAnyOf(DeleteFilesById.fulfilled, clearAnnotationState),
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

export default annotationSliceV1.reducer;
