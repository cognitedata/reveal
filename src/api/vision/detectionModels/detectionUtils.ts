// it's not strictly necessary to have that mapping, but it's just handy to have an overview in one place
import sdk from '@cognite/cdf-sdk-singleton';
import {
  LegacyVisionJobResultItem,
  VisionDetectionModelType,
  VisionExtractResultItem,
  VisionJobQueued,
} from 'src/api/vision/detectionModels/types';
import { DetectionModelTypeFeatureMapping } from 'src/constants/DetectionModelTypeApiFieldMapping';

export function getDetectionModelEndpoint(modelType: VisionDetectionModelType) {
  if (
    modelType === VisionDetectionModelType.CustomModel ||
    modelType === VisionDetectionModelType.GaugeReader
  ) {
    return `${sdk.getBaseUrl()}/api/playground/projects/${
      sdk.project
    }/context/vision/${DetectionModelTypeFeatureMapping[modelType]}`;
  }

  return `${sdk.getBaseUrl()}/api/playground/projects/${
    sdk.project
  }/context/vision/extract`;
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

export const isLegacyJobResultItem = (
  jobResult: VisionExtractResultItem | LegacyVisionJobResultItem
): jobResult is LegacyVisionJobResultItem => {
  return !(jobResult as VisionExtractResultItem).predictions;
};
