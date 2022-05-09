import { AnnotationState } from 'src/modules/Common/store/annotation/types';
import { createSelectorCreator, defaultMemoize } from 'reselect';
import isEqual from 'lodash-es/isEqual';
import {
  VisionAnnotation,
  VisionAnnotationDataType,
  ImageAnnotationType,
} from 'src/modules/Common/types/annotation';
import { AnnotationFilterType } from 'src/modules/FilterSidePanel/types';
import {
  filterAnnotations,
  getAnnotationsBadgeCounts,
} from 'src/modules/Common/Utils/AnnotationUtils/AnnotationUtils';
import { getTypeGuardForVisionAnnotationDataType } from 'src/modules/Common/types/typeGuards';

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

export const makeSelectAnnotationsForFileIds = () =>
  createDeepEqualSelector(
    (state: AnnotationState, fileIds: number[]) => fileIds,
    (
      state: AnnotationState,
      fileIds: number[],
      filter?: AnnotationFilterType
    ) => filter,
    annotationsById,
    annotatedFilesById,
    (fileIds, filter, allAnnotations, allFiles) => {
      // file id existence checked in selectFileAnnotations
      const data: Record<number, VisionAnnotation<VisionAnnotationDataType>[]> =
        {};
      fileIds.forEach((id) => {
        const fileAnnotations = allFiles[id];
        if (fileAnnotations && fileAnnotations.length) {
          data[id] = filterAnnotations({
            annotations: fileAnnotations.map(
              (annotationId) => allAnnotations[annotationId]
            ),
            filter,
          });
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
    (state: AnnotationState, fileId: number, types: ImageAnnotationType[]) =>
      types,
    fileAnnotationSelector,
    (types, fileAnnotations) => {
      const typeGuards = types.map((type) =>
        getTypeGuardForVisionAnnotationDataType(type)
      );
      if (fileAnnotations.length) {
        return fileAnnotations.filter((item) =>
          typeGuards
            .map((typeGuard) => typeGuard(item))
            .reduce((a, b) => a || b, false)
        );
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
