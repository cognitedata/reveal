import {
  AnnotationJobQueued,
  DetectionModelCategory,
  VisionAPIType,
} from 'src/api/types';
import { v3Client as sdk } from '@cognite/cdf-sdk-singleton';

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

export function toVisionAPIModels(modelTypes: DetectionModelCategory[]) {
  const models: VisionAPIType[] = [];
  modelTypes.forEach((modelType) => {
    if (modelType === DetectionModelCategory.AssetTag) {
      models.push(VisionAPIType.TagDetection);
    }
    if (modelType === DetectionModelCategory.GDPR) {
      models.push(VisionAPIType.ObjectDetection);
    }
    if (modelType === DetectionModelCategory.TextAndObjects) {
      models.push(VisionAPIType.OCR, VisionAPIType.ObjectDetection);
    }
  });
  return models.filter((x, i, a) => a.indexOf(x) === i);
}
