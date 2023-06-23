/* eslint-disable no-param-reassign */
import { AnnotationState } from '@vision/modules/Common/store/annotation/types';
import {
  VisionAnnotation,
  VisionAnnotationDataType,
} from '@vision/modules/Common/types/index';
import {
  isImageClassificationData,
  isImageKeypointCollectionData,
  isImageObjectDetectionData,
} from '@vision/modules/Common/types/typeGuards';
import { getAnnotationLabelOrText } from '@vision/modules/Common/Utils/AnnotationUtils/AnnotationUtils';
import { getRandomColor } from '@vision/modules/Review/Components/AnnotationSettingsModal/AnnotationSettingsUtils';

export const clearAnnotationStates = (
  state: AnnotationState,
  fileIds: number[],
  clearCache?: boolean
) => {
  if (clearCache) {
    state.files.byId = {};
    state.annotations.byId = {};
    // don't clean annotationColorMap
  } else {
    fileIds.forEach((fileId: number) => {
      const annotationIdsForFile = state.files.byId[fileId];
      if (annotationIdsForFile && annotationIdsForFile.length) {
        annotationIdsForFile.forEach((annotationId) => {
          delete state.annotations.byId[annotationId];
        });
      }
      delete state.files.byId[fileId];
    });
  }
};

export const repopulateAnnotationState = (
  state: AnnotationState,
  annotations: VisionAnnotation<VisionAnnotationDataType>[]
) => {
  annotations.forEach((annotation) => {
    const resourceId: number = annotation.annotatedResourceId;
    if (state.files.byId[resourceId]) {
      if (!state.files.byId[resourceId].includes(annotation.id)) {
        state.files.byId[resourceId].push(annotation.id);
      }
    } else {
      state.files.byId[resourceId] = [annotation.id];
    }

    if (
      !state.annotations.byId[annotation.id] ||
      state.annotations.byId[annotation.id].lastUpdatedTime !==
        annotation.lastUpdatedTime
    ) {
      state.annotations.byId[annotation.id] = annotation;
    }

    // set color
    if (
      isImageClassificationData(annotation) ||
      isImageObjectDetectionData(annotation) ||
      isImageKeypointCollectionData(annotation)
    ) {
      const colorKey = getAnnotationLabelOrText(annotation);
      if (!(colorKey in state.annotationColorMap)) {
        state.annotationColorMap = {
          ...state.annotationColorMap,
          [colorKey]: getRandomColor(),
        };
      }
    }
  });
};
