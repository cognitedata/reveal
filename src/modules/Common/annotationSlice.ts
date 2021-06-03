import { createSlice } from '@reduxjs/toolkit';
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
