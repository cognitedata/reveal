import { AnnotationState } from 'src/modules/Common/store/annotation/types';
import { createSelectorCreator, defaultMemoize } from 'reselect';
import isEqual from 'lodash-es/isEqual';
import {
  VisionAnnotation,
  VisionAnnotationDataType,
} from 'src/modules/Common/types/Annotation';
import { AnnotationFilterType } from 'src/modules/FilterSidePanel/types';
import { AnnotationUtilsV1 } from 'src/utils/AnnotationUtilsV1/AnnotationUtilsV1';

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
