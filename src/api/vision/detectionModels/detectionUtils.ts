// it's not strictly necessary to have that mapping, but it's just handy to have an overview in one place
import {
  AnnotationJobQueued,
  VisionAPIType,
} from 'src/api/vision/detectionModels/types';
import sdk from '@cognite/cdf-sdk-singleton';

export function getDetectionModelEndpoint(modelType: VisionAPIType) {
  const mapping: Record<VisionAPIType, string> = {
    [VisionAPIType.OCR]: 'ocr',
    [VisionAPIType.TagDetection]: 'tagdetection',
    [VisionAPIType.ObjectDetection]: 'objectdetection',
    [VisionAPIType.CustomModel]: 'automl/prediction',
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
