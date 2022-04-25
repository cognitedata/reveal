import { AnnotationState } from 'src/modules/Common/store/annotation/types';

export const initialState: AnnotationState = {
  files: {
    byId: {},
  },
  annotations: {
    byId: {},
  },
};
