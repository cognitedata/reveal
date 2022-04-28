import { AnnotationState } from 'src/modules/Common/store/annotation/types';

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
