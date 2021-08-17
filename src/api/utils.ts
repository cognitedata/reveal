import {
  Annotation,
  AnnotationJobQueued,
  AnnotationMetadata,
  AnnotationRegion,
  AnnotationSource,
  VisionAPIType,
} from 'src/api/types';
import { v3Client as sdk } from '@cognite/cdf-sdk-singleton';
import {
  AnnotationStatus,
  ModelTypeAnnotationTypeMap,
  ModelTypeSourceMap,
} from 'src/utils/AnnotationUtils';
import { UnsavedAnnotation } from 'src/api/annotation/types';

// it's not strictly necessary to have that mapping, but it's just handy to have an overview in one place
export function getDetectionModelEndpoint(modelType: VisionAPIType) {
  const mapping: Record<VisionAPIType, string> = {
    [VisionAPIType.OCR]: 'ocr',
    [VisionAPIType.TagDetection]: 'tagdetection',
    [VisionAPIType.ObjectDetection]: 'objectdetection',
  };
  return `${sdk.getBaseUrl()}/api/playground/projects/${
    sdk.project
  }/context/vision/${mapping[modelType]}`;
}

export function getFakeQueuedJob(
  modelType: VisionAPIType
): AnnotationJobQueued {
  const now = Date.now();
  return {
    jobId: 0 - (modelType as number),
    createdTime: now,
    status: 'Queued',
    startTime: null,
    statusTime: now,
  };
}

export function getUnsavedAnnotation(
  text: string,
  modelType: VisionAPIType,
  fileId: number,
  region?: AnnotationRegion,
  status = AnnotationStatus.Unhandled,
  source?: AnnotationSource,
  data?: AnnotationMetadata,
  assetId?: number,
  assetExternalId?: string,
  fileExternalId?: string
): UnsavedAnnotation {
  return {
    text,
    region:
      (region && {
        ...region,
        vertices: region.vertices.map((vertex) => ({
          x: vertex.x,
          y: vertex.y,
        })),
      }) ||
      undefined,
    source: source || ModelTypeSourceMap[modelType],
    status,
    annotationType: ModelTypeAnnotationTypeMap[modelType],
    annotatedResourceId: fileId,
    annotatedResourceType: 'file',
    annotatedResourceExternalId: fileExternalId,
    ...(modelType === VisionAPIType.TagDetection && {
      linkedResourceId: assetId,
      linkedResourceExternalId: assetExternalId || text,
      linkedResourceType: 'asset',
    }),
    data,
  };
}

export function validateAnnotation(
  annotation: Annotation | UnsavedAnnotation
): boolean {
  if (annotation.region) {
    const validVertices = annotation.region.vertices.every((vertex) => {
      return vertex.x >= 0 && vertex.x <= 1 && vertex.y >= 0 && vertex.y <= 1;
    });
    if (!validVertices) {
      throw new Error('Annotation coordinates must be between 0 and 1');
    }
    return true;
  }
  return false;
}
