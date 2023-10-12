import {
  VisionAnnotation,
  VisionAnnotationDataType,
} from '../../types/annotation';

export type AnnotationState = {
  files: {
    byId: Record<number, number[]>;
  };
  annotations: {
    byId: Record<number, VisionAnnotation<VisionAnnotationDataType>>;
  };
  annotationColorMap: {
    // annotation label is the color key
    [colorKey: string]: string;
  };
};
