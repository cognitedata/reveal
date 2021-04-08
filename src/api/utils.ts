import { AnnotationJobQueued, DetectionModelType } from 'src/api/types';
import { v3Client as sdk } from '@cognite/cdf-sdk-singleton';

// it's not strictly necessary to have that mapping, but it's just handy to have an overview in one place
export function getDetectionModelEndpoint(modelType: DetectionModelType) {
  const mapping: Record<DetectionModelType, string> = {
    [DetectionModelType.Text]: 'ocr',
    [DetectionModelType.Tag]: 'tagdetection',
    [DetectionModelType.GDPR]: 'objectdetection',
  };
  return `${sdk.getBaseUrl()}/api/playground/projects/${
    sdk.project
  }/context/vision/${mapping[modelType]}`;
}

export function getFakeQueuedJob(
  modelType: DetectionModelType
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
