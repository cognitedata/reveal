import { VisionAnnotation } from 'src/utils/AnnotationUtils';

export type AnnotationState = {
  files: {
    byId: Record<number, number[]>;
  };
  annotations: {
    byId: Record<number, VisionAnnotation>;
  };
};
