import { VisionAnnotationV1 } from 'src/utils/AnnotationUtils';

export type AnnotationStateV1 = {
  files: {
    byId: Record<number, number[]>;
  };
  annotations: {
    byId: Record<number, VisionAnnotationV1>;
  };
};
