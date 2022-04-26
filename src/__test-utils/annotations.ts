import { AnnotationStatus, AnnotationUtils } from 'src/utils/AnnotationUtils';
import { AnnotationMetadata } from 'src/api/annotation/types';

export const getDummyAnnotation = (
  id?: number,
  modelType?: number,
  other?: {
    status?: AnnotationStatus;
    confidence?: number;
    text?: string;
    data?: AnnotationMetadata;
  }
) => {
  return AnnotationUtils.createVisionAnnotationStub(
    id || 1,
    other?.text || 'pump',
    modelType || 1,
    1,
    123,
    124,
    { shape: 'rectangle', vertices: [] },
    undefined,
    undefined,
    other?.status,
    { ...other?.data, confidence: other?.confidence }
  );
};
