import { AnnotationStatus, AnnotationUtils } from 'src/utils/AnnotationUtils';

export const getDummyAnnotation = (
  id?: number,
  modelType?: number,
  other?: {
    status?: AnnotationStatus;
    text?: string;
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
    other?.status
  );
};
