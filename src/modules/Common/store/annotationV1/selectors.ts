import { VisionDetectionModelType } from 'src/api/vision/detectionModels/types';
import { AnnotationStateV1 } from 'src/modules/Common/store/annotationV1/types';
import {
  AnnotationUtils,
  getAnnotationsBadgeCounts,
  VisionAnnotationV1,
} from 'src/utils/AnnotationUtils';
import { createSelectorCreator, defaultMemoize } from 'reselect';
import isEqual from 'lodash-es/isEqual';
import { AnnotationFilterType } from 'src/modules/FilterSidePanel/types';

const createDeepEqualSelector = createSelectorCreator(defaultMemoize, isEqual);

export const annotationsById = (state: AnnotationStateV1) => {
  return state.annotations.byId;
};

export const annotatedFilesById = (state: AnnotationStateV1) => {
  return state.files.byId;
};

export const makeSelectFileAnnotations = () =>
  createDeepEqualSelector(
    (state: AnnotationStateV1, id: number) => state.files.byId[id],
    annotationsById,
    (annotationIds, allAnnotations) => {
      if (annotationIds && annotationIds.length) {
        return annotationIds.map((id) => allAnnotations[id]);
      }
      return [];
    }
  );

export const makeSelectAnnotationsForFileIds = () =>
  createDeepEqualSelector(
    (state: AnnotationStateV1, fileIds: number[]) => fileIds,
    (
      state: AnnotationStateV1,
      fileIds: number[],
      filter?: AnnotationFilterType
    ) => filter,
    annotationsById,
    annotatedFilesById,
    (fileIds, filter, allAnnotations, allFiles) => {
      // file id existence checked in selectFileAnnotations
      const data: Record<number, VisionAnnotationV1[]> = {};
      fileIds.forEach((id) => {
        const fileAnnotations = allFiles[id];
        if (fileAnnotations && fileAnnotations.length) {
          data[id] = AnnotationUtils.filterAnnotations(
            fileAnnotations.map((annotationId) => allAnnotations[annotationId]),
            filter
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
    (
      state: AnnotationStateV1,
      fileId: number,
      types: VisionDetectionModelType[]
    ) => types,
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
  (state: AnnotationStateV1) => state.files.byId,
  (_: AnnotationStateV1, fileIds: number[]) => fileIds,
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

export const makeSelectTotalAnnotationCountForFileIds = () => {
  const selectAnnotationsForFiles = makeSelectAnnotationsForFileIds();

  return createDeepEqualSelector(
    selectAnnotationsForFiles,
    (annotationsForFiles) => {
      const annotations = Object.values(annotationsForFiles).flat();
      return getAnnotationsBadgeCounts(annotations);
    }
  );
};
