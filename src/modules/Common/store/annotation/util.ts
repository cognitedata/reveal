import { AnnotationState } from 'src/modules/Common/store/annotation/types';
import {
  VisionAnnotation,
  VisionAnnotationDataType,
} from 'src/modules/Common/types/index';
import { getAnnotatedResourceId } from 'src/modules/Common/Utils/getAnnotatedResourceId/getAnnotatedResourceId';

export const clearStates = (
  state: AnnotationState,
  fileIds: number[],
  clearCache?: boolean
): AnnotationState => {
  let filesById = state.files.byId;
  let annotationsById = state.annotations.byId;

  if (clearCache) {
    filesById = {};
    annotationsById = {};
  } else {
    fileIds.forEach((fileId: number) => {
      const annotationIdsForFile = filesById[fileId];
      if (annotationIdsForFile && annotationIdsForFile.length) {
        annotationIdsForFile.forEach((annotationId) => {
          delete annotationsById[annotationId];
        });
      }
      delete filesById[fileId];
    });
  }

  return {
    files: {
      byId: filesById,
    },
    annotations: {
      byId: annotationsById,
    },
  };
};

export const repopulateAnnotationState = (
  state: AnnotationState,
  annotations: VisionAnnotation<VisionAnnotationDataType>[]
) => {
  const filesById = state.files.byId;
  const annotationsById = state.annotations.byId;

  annotations.forEach((annotation) => {
    const resourceId: number | undefined = getAnnotatedResourceId({
      annotation,
    });

    if (resourceId) {
      if (
        filesById[resourceId] &&
        !filesById[resourceId].includes(annotation.id)
      ) {
        filesById[resourceId].push(annotation.id);
      } else {
        filesById[resourceId] = [annotation.id];
      }
    }

    if (
      !annotationsById[annotation.id] ||
      annotationsById[annotation.id].lastUpdatedTime !==
        annotation.lastUpdatedTime
    ) {
      annotationsById[annotation.id] = annotation;
    }
  });

  return {
    files: {
      byId: filesById,
    },
    annotations: {
      byId: annotationsById,
    },
  };
};
