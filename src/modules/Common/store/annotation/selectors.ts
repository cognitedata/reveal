import { VisionAPIType } from 'src/api/types';
import { AnnotationState } from 'src/modules/Common/store/annotation/types';
import {
  getAnnotationsBadgeCounts,
  VisionAnnotation,
} from 'src/utils/AnnotationUtils';
import { createSelectorCreator, defaultMemoize } from 'reselect';
import isEqual from 'lodash-es/isEqual';

const createDeepEqualSelector = createSelectorCreator(defaultMemoize, isEqual);

export const annotationsById = (state: AnnotationState) => {
  return state.annotations.byId;
};

export const annotatedFilesById = (state: AnnotationState) => {
  return state.files.byId;
};

export const makeSelectFileAnnotations = () =>
  createDeepEqualSelector(
    (state: AnnotationState, id: number) => state.files.byId[id],
    annotationsById,
    (annotationIds, allAnnotations) => {
      if (annotationIds && annotationIds.length) {
        return annotationIds.map((id) => allAnnotations[id]);
      }
      return [];
    }
  );

export const selectAllAnnotations = createDeepEqualSelector(
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

export const makeSelectAnnotationsForFileIds = () =>
  createDeepEqualSelector(
    (state: AnnotationState, fileIds: number[]) => fileIds,
    annotationsById,
    annotatedFilesById,
    (fileIds, allAnnotations, allFiles) => {
      // file id existence checked in selectFileAnnotations
      const data: Record<number, VisionAnnotation[]> = {};
      fileIds.forEach((id) => {
        const fileAnnotations = allFiles[id];
        if (fileAnnotations && fileAnnotations.length) {
          data[id] = fileAnnotations.map(
            (annotationId) => allAnnotations[annotationId]
          );
        } else {
          data[id] = [];
        }
      });

      return data;
    }
  );

export const makeSelectFileAnnotationsByType = () => {
  const fileAnnotationSelector = makeSelectFileAnnotations();

  return createDeepEqualSelector(
    (state: AnnotationState, fileId: number, types: VisionAPIType[]) => types,
    fileAnnotationSelector,
    (types, fileAnnotations) => {
      if (fileAnnotations.length) {
        return fileAnnotations.filter((item) => types.includes(item.modelType));
      }
      return [];
    }
  );
};

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

export const makeSelectAnnotationCounts = () => {
  const fileAnnotationSelector = makeSelectFileAnnotations();

  return createDeepEqualSelector(fileAnnotationSelector, (annotations) => {
    return getAnnotationsBadgeCounts(annotations);
  });
};

export const makeSelectTotalAnnotationCounts = () =>
  createDeepEqualSelector(selectAllAnnotations, (annotations) => {
    return getAnnotationsBadgeCounts(annotations);
  });
