import { CogniteAnnotation } from '@cognite/annotations';
import { AnnotationsState } from './types';

export const deleteAnnotationsDone = (state: AnnotationsState, action: any) => {
  const { fileId, annotations } = action.payload;
  annotations.forEach((el: CogniteAnnotation) => {
    if (state.byFileId[fileId] && state.byFileId[fileId].annotations) {
      state.byFileId[fileId].annotations = state.byFileId[
        fileId
      ].annotations.filter(
        (annotation: CogniteAnnotation) => annotation.id !== el.id
      );
    }
  });
  state.byFileId[fileId].status = 'success';
};

export const deleteAnnotationsError = (
  state: AnnotationsState,
  action: any
) => {
  const { id: fileId } = action.meta.args.file;
  if (!state.byFileId[fileId]) {
    state.byFileId[fileId] = {};
  }
  state.byFileId[fileId].status = 'error';
};
