import { createSlice, isAnyOf } from '@reduxjs/toolkit';
import { VisionAPIType } from 'src/api/types';
import { CreateAnnotations } from 'src/store/thunks/Annotation/CreateAnnotations';
import { DeleteAnnotations } from 'src/store/thunks/Annotation/DeleteAnnotations';
import { RetrieveAnnotations } from 'src/store/thunks/Annotation/RetrieveAnnotations';
import { UpdateAnnotations } from 'src/store/thunks/Annotation/UpdateAnnotations';
import { DeleteFilesById } from 'src/store/thunks/Files/DeleteFilesById';
import { AnnotationDetectionJobUpdate } from 'src/store/thunks/Process/AnnotationDetectionJobUpdate';
import {
  getAnnotationsBadgeCounts,
  VisionAnnotation,
} from 'src/utils/AnnotationUtils';
import {
  createSelector,
  createSelectorCreator,
  defaultMemoize,
} from 'reselect';
import isEqual from 'lodash-es/isEqual';
import {
  clearExplorerFileState,
  clearFileState,
} from 'src/store/commonActions';

type State = {
  files: {
    byId: Record<number, number[]>;
  };
  annotations: {
    byId: Record<number, VisionAnnotation>;
  };
};

const initialState: State = {
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
    builder.addCase(RetrieveAnnotations.pending, (state: State, { meta }) => {
      const { fileIds, clearCache } = meta.arg;

      // clear state
      if (clearCache) {
        state.annotations.byId = {};
        state.files.byId = {};
      } else {
        fileIds.forEach((fileId) => {
          const annotationIdsForFile = state.files.byId[fileId];
          delete state.files.byId[fileId];
          annotationIdsForFile.forEach((annotationId) => {
            delete state.annotations.byId[annotationId];
          });
        });
      }
    });

    builder.addCase(
      RetrieveAnnotations.fulfilled,
      (state: State, { payload }) => {
        // update annotations
        payload.forEach((annotation) => {
          if (state.files.byId[annotation.annotatedResourceId]) {
            state.files.byId[annotation.annotatedResourceId].push(
              annotation.id
            );
          } else {
            state.files.byId[annotation.annotatedResourceId] = [annotation.id];
          }

          if (!state.annotations.byId[annotation.id]) {
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
      isAnyOf(
        CreateAnnotations.fulfilled,
        AnnotationDetectionJobUpdate.fulfilled,
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

// selectors

export const annotationsById = (state: State) => {
  return state.annotations.byId;
};

export const selectFileAnnotations = createSelector(
  (state: State, id: number) => state.files.byId[id],
  annotationsById,
  (annotationIds, allAnnotations) => {
    if (annotationIds && annotationIds.length) {
      return annotationIds.map((id) => allAnnotations[id]);
    }
    return [];
  }
);

export const selecAllAnnotations = createSelector(
  annotationsById,
  (annotations: Record<number, VisionAnnotation>) => {
    const allAnnotations = Object.entries(annotations).map(
      ([_, annotation]) => {
        return annotation;
      }
    );

    return allAnnotations;
  }
);

export const selectAnnotationsForAllFiles = createSelector(
  (state: State, fileIds: number[]) =>
    fileIds.map((id) => selectFileAnnotations(state, id)),
  (_: State, fileIds: number[]) => fileIds,
  (annotations, fileIds) => {
    const data: Record<number, VisionAnnotation[]> = {};
    fileIds.forEach((id, index) => {
      data[id] = annotations[index];
    });

    return data;
  }
);

const createDeepEqualSelector = createSelectorCreator(defaultMemoize, isEqual);

export const filesAnnotationCounts = createDeepEqualSelector(
  (state: State) => state.files.byId,
  (_: State, fileIds: number[]) => fileIds,
  (allFiles, fileIds) => {
    const data: Record<number, number> = {};
    fileIds.forEach((id) => {
      data[id] = allFiles[id]?.length || 0;
    });

    return data;
  }
);

export const makeSelectAnnotationCounts = () =>
  createDeepEqualSelector(selectFileAnnotations, (annotations) => {
    return getAnnotationsBadgeCounts(annotations);
  });

export const makeSelectTotalAnnotationCounts = () =>
  createDeepEqualSelector(selecAllAnnotations, (annotations) => {
    return getAnnotationsBadgeCounts(annotations);
  });

export const selectFileAnnotationsByType = createSelector(
  selectFileAnnotations,
  (state: State, fileId: number, types: VisionAPIType[]) => types,
  (annotations, types) => {
    if (annotations) {
      return annotations.filter((item) => types.includes(item.modelType));
    }
    return [];
  }
);
