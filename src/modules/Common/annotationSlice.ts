import { createSlice, isAnyOf } from '@reduxjs/toolkit';
import { Annotation, VisionAPIType } from 'src/api/types';
import { RetrieveAnnotations } from 'src/store/thunks/RetrieveAnnotations';
import {
  AnnotationStatus,
  AnnotationTypeModelTypeMap,
} from 'src/utils/AnnotationUtils';
import {
  createSelector,
  createSelectorCreator,
  defaultMemoize,
} from 'reselect';
import isEqual from 'lodash-es/isEqual';
import difference from 'lodash-es/difference';
import { deleteFilesById } from 'src/store/thunks/deleteFilesById';
import { clearFileState } from 'src/store/commonActions';
import { clearExplorerFileState } from 'src/modules/Explorer/store/explorerSlice';
import {
  AnnotationCounts,
  AnnotationPreview,
  AnnotationsBadgeCounts,
} from './types';

type State = {
  files: {
    byId: Record<number, number[]>;
  };
  annotations: {
    byId: Record<number, AnnotationPreview>;
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
    builder.addCase(
      RetrieveAnnotations.fulfilled,
      (state: State, { payload: annotations }) => {
        const fileAnnotations: { [id: number]: number[] } = {};

        // update annotations
        annotations.forEach((item: Annotation) => {
          const recordValue = {
            id: item.id,
            annotatedResourceId: item.annotatedResourceId,
            annotationType: AnnotationTypeModelTypeMap[item.annotationType],
            source: item.source,
            status: item.status,
            text: item.text,
            region: item.region,
          };
          if (fileAnnotations[item.annotatedResourceId]) {
            fileAnnotations[item.annotatedResourceId].push(item.id);
          } else {
            fileAnnotations[item.annotatedResourceId] = [item.id];
          }
          state.annotations.byId[item.id] = recordValue;
        });

        Object.keys(fileAnnotations).forEach((id) => {
          const existingAnnotations = state.files.byId[+id];
          const newAnnotations = fileAnnotations[+id];

          if (!isEqual(existingAnnotations, newAnnotations)) {
            const deletedAnnotations = difference(
              existingAnnotations,
              newAnnotations
            );
            if (deletedAnnotations.length) {
              deletedAnnotations.forEach((annotationId) => {
                delete state.annotations.byId[annotationId];
              });
            }
            state.files.byId[+id] = fileAnnotations[+id];
          }
        });
      }
    );

    builder.addMatcher(
      isAnyOf(
        deleteFilesById.fulfilled,
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
export const selectFileAnnotations = createSelector(
  (state: State, id: number) => state.files.byId[id],
  (state: State) => state.annotations.byId,
  (annotationIds, allAnnotations) => {
    if (annotationIds && annotationIds.length) {
      return annotationIds.map((id) => allAnnotations[id]);
    }
    return [];
  }
);

export const selectAnnotationsForAllFiles = createSelector(
  (state: State, fileIds: number[]) =>
    fileIds.map((id) => selectFileAnnotations(state, id)),
  (_: State, fileIds: number[]) => fileIds,
  (annotations, fileIds) => {
    const data: Record<number, AnnotationPreview[]> = {};
    fileIds.forEach((id, index) => {
      data[id] = annotations[index];
    });

    return data;
  }
);

export const filesAnnotationCounts = (state: State, fileIds: number[]) => {
  const data: Record<number, number> = {};
  fileIds.forEach((id) => {
    data[id] = state.files.byId[id]?.length || 0;
  });

  return data;
};

const createDeepEqualSelector = createSelectorCreator(defaultMemoize, isEqual);

export const makeSelectAnnotationCounts = () =>
  createDeepEqualSelector(selectFileAnnotations, (annotations) => {
    const annotationsBadgeProps: AnnotationsBadgeCounts = {
      tag: {},
      gdpr: {},
      text: {},
      objects: {},
    };

    if (annotations) {
      annotationsBadgeProps.text = getSingleAnnotationCounts(
        annotations.filter((item) => item.annotationType === VisionAPIType.OCR)
      );
      annotationsBadgeProps.tag = getSingleAnnotationCounts(
        annotations.filter(
          (item) => item.annotationType === VisionAPIType.TagDetection
        )
      );

      annotationsBadgeProps.gdpr = getSingleAnnotationCounts(
        annotations.filter(
          (item) =>
            item.annotationType === VisionAPIType.ObjectDetection &&
            item.text === 'person'
        )
      );

      annotationsBadgeProps.objects = getSingleAnnotationCounts(
        annotations.filter(
          (item) =>
            item.annotationType === VisionAPIType.ObjectDetection &&
            item.text !== 'person'
        )
      );
    }
    return annotationsBadgeProps;
  });

export const selectFileAnnotationsByType = createSelector(
  selectFileAnnotations,
  (state: State, fileId: number, types: VisionAPIType[]) => types,
  (annotations, types) => {
    if (annotations) {
      return annotations.filter((item) => types.includes(item.annotationType));
    }
    return [];
  }
);

// helper functions
const getSingleAnnotationCounts = (annotations: AnnotationPreview[]) => {
  let [modelGenerated, manuallyGenerated, verified, unhandled, rejected] = [
    0, 0, 0, 0, 0,
  ];
  annotations.forEach((annotation) => {
    if (annotation.source === 'user') {
      manuallyGenerated++;
    } else {
      modelGenerated++;
    }
    if (annotation.status === AnnotationStatus.Verified) {
      verified++;
    }
    if (annotation.status === AnnotationStatus.Unhandled) {
      unhandled++;
    }
    if (annotation.status === AnnotationStatus.Rejected) {
      rejected++;
    }
  });

  return {
    modelGenerated,
    manuallyGenerated,
    verified,
    unhandled,
    rejected,
  } as AnnotationCounts;
};
