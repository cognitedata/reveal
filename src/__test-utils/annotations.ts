import {
  AnnotationStatus,
  AnnotationUtils,
  ModelTypeAnnotationTypeMap,
} from 'src/utils/AnnotationUtils';
import {
  RegionType,
  Vertex,
  VisionDetectionModelType,
} from 'src/api/vision/detectionModels/types';
import {
  AnnotationMetadataV1,
  AnnotationTypeV1,
} from 'src/api/annotation/types';

export const getDummyAnnotation = (
  id?: number,
  modelType?: number,
  other?: {
    status?: AnnotationStatus;
    confidence?: number;
    text?: string;
    assetId?: number;
    shape?: RegionType;
    vertices?: Vertex[];
    data?: AnnotationMetadataV1;
    type?: AnnotationTypeV1;
  }
) => {
  return AnnotationUtils.createVisionAnnotationStubV1(
    id || 1,
    other?.text || 'pump',
    modelType || 1,
    1,
    123,
    124,
    { shape: other?.shape || 'rectangle', vertices: other?.vertices! },
    undefined,
    undefined,
    other?.status || AnnotationStatus.Unhandled,
    { ...other?.data, confidence: other?.confidence },
    other?.type ||
      ModelTypeAnnotationTypeMap[modelType || VisionDetectionModelType.OCR],
    undefined,
    other?.assetId
  );
};
