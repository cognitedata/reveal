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
  jobType: VisionAPIType,
  fileId: number,
  source: AnnotationSource,
  region?: AnnotationRegion,
  status = AnnotationStatus.Unhandled,
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
    source,
    status,
    annotationType: ModelTypeAnnotationTypeMap[jobType],
    annotatedResourceId: fileId,
    annotatedResourceType: 'file',
    annotatedResourceExternalId: fileExternalId,
    ...(jobType === VisionAPIType.TagDetection && {
      linkedResourceId: assetId,
      linkedResourceExternalId: assetExternalId || text,
      linkedResourceType: 'asset',
    }),
    data,
  };
}
const enforceValidCoordinate = (coord: number) => {
  if (coord < 0) {
    return 0;
  }
  if (coord > 1) {
    return 1;
  }
  return coord;
};
export function enforceRegionValidity(region: AnnotationRegion) {
  const validRegion = {
    ...region,
    vertices: region.vertices.map((vertex) => ({
      x: enforceValidCoordinate(vertex.x),
      y: enforceValidCoordinate(vertex.y),
    })),
  };
  return validRegion;
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

export const getFieldOrSetNull = (
  value: any
): { set: any } | { setNull: true } => {
  if (value === undefined || value === null) {
    return {
      setNull: true,
    };
  }
  return {
    set: value,
  };
};
