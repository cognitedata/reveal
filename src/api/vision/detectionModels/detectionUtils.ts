// it's not strictly necessary to have that mapping, but it's just handy to have an overview in one place
import {
  VisionJobQueued,
  VisionDetectionModelType,
} from 'src/api/vision/detectionModels/types';
import sdk from '@cognite/cdf-sdk-singleton';

export function getDetectionModelEndpoint(modelType: VisionDetectionModelType) {
  const mapping: Record<VisionDetectionModelType, string> = {
    [VisionDetectionModelType.OCR]: 'ocr',
    [VisionDetectionModelType.TagDetection]: 'tagdetection',
    [VisionDetectionModelType.ObjectDetection]: 'objectdetection',
    [VisionDetectionModelType.CustomModel]: 'automl/prediction',
  };
  return `${sdk.getBaseUrl()}/api/playground/projects/${
    sdk.project
  }/context/vision/${mapping[modelType]}`;
}

export function getFakeQueuedJob(
  modelType: VisionDetectionModelType
): VisionJobQueued {
  const now = Date.now();
  return {
    jobId: 0 - (modelType as number),
    createdTime: now,
    status: 'Queued',
    startTime: null,
    statusTime: now,
  };
}
