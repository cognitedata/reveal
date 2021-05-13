import {
  AnnotationJobQueued,
  AnnotationRegion,
  AnnotationSource,
  RegionType,
  VisionAPIType,
} from 'src/api/types';
import { v3Client as sdk } from '@cognite/cdf-sdk-singleton';
import {
  AnnotationBoundingBox,
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
  assetId?: number,
  assetExternalId?: string,
  fileExternalId?: string
): UnsavedAnnotation {
  return {
    text,
    region,
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
  };
}

export function getRegionFromBox(
  type: RegionType = 'rectangle',
  box: AnnotationBoundingBox | null
): AnnotationRegion | undefined {
  if (!box) {
    return undefined;
  }
  return {
    shape: type,
    vertices: [
      {
        x: box.xMin,
        y: box.yMin,
      },
      {
        x: box.xMax,
        y: box.yMax,
      },
    ],
  };
}
