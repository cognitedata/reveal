import {
  AnnotationStatus,
  AnnotationUtils,
  ModelTypeAnnotationTypeMap,
} from 'src/utils/AnnotationUtils';
import {
  RegionType,
  VisionDetectionModelType,
} from 'src/api/vision/detectionModels/types';
import { AnnotationMetadata, AnnotationTypeV1 } from 'src/api/annotation/types';

export const getDummyAnnotation = (
  id?: number,
  modelType?: number,
  other?: {
    status?: AnnotationStatus;
    confidence?: number;
    text?: string;
    assetId?: number;
    shape?: RegionType;
    data?: AnnotationMetadata;
    type?: AnnotationTypeV1;
  }
) => {
  return AnnotationUtils.createVisionAnnotationStub(
    id || 1,
    other?.text || 'pump',
    modelType || 1,
    1,
    123,
    124,
    { shape: other?.shape || 'rectangle', vertices: [] },
    undefined,
    undefined,
    other?.status,
    { ...other?.data, confidence: other?.confidence },
    other?.type ||
      ModelTypeAnnotationTypeMap[modelType || VisionDetectionModelType.OCR],
    undefined,
    other?.assetId
  );
};
