import { VisionAPIType } from 'src/api/types';
import { AnnotationState } from 'src/modules/Common/store/annotation/types';
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

export const annotationsById = (state: AnnotationState) => {
  return state.annotations.byId;
};

export const selectFileAnnotations = createSelector(
  (state: AnnotationState, id: number) => state.files.byId[id],
  annotationsById,
  (annotationIds, allAnnotations) => {
    if (annotationIds && annotationIds.length) {
      return annotationIds.map((id) => allAnnotations[id]);
    }
    return [];
  }
);

export const selectAllAnnotations = createSelector(
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
  (state: AnnotationState, fileIds: number[]) =>
    fileIds.map((id) => selectFileAnnotations(state, id)),
  (_: AnnotationState, fileIds: number[]) => fileIds,
  (annotations, fileIds) => {
    // file id existence checked in selectFileAnnotations
    const data: Record<number, VisionAnnotation[]> = {};
    fileIds.forEach((id, index) => {
      data[id] = annotations[index];
    });

    return data;
  }
);

export const selectFileAnnotationsByType = createSelector(
  selectFileAnnotations,
  (state: AnnotationState, fileId: number, types: VisionAPIType[]) => types,
  (annotations, types) => {
    if (annotations) {
      return annotations.filter((item) => types.includes(item.modelType));
    }
    return [];
  }
);

const createDeepEqualSelector = createSelectorCreator(defaultMemoize, isEqual);

export const filesAnnotationCounts = createDeepEqualSelector(
  (state: AnnotationState) => state.files.byId,
  (_: AnnotationState, fileIds: number[]) => fileIds,
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
  createDeepEqualSelector(selectAllAnnotations, (annotations) => {
    return getAnnotationsBadgeCounts(annotations);
  });
