/* eslint-disable no-param-reassign */
import { AnnotationState } from 'src/modules/Common/store/annotation/types';
import {
  VisionAnnotation,
  VisionAnnotationDataType,
} from 'src/modules/Common/types/index';

export const clearStates = (
  state: AnnotationState,
  fileIds: number[],
  clearCache?: boolean
) => {
  if (clearCache) {
    state.files.byId = {};
    state.annotations.byId = {};
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
    if (
      state.files.byId[resourceId] &&
      !state.files.byId[resourceId].includes(annotation.id)
    ) {
      state.files.byId[resourceId].push(annotation.id);
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
  });
};
