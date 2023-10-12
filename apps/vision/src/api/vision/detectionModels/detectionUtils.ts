// it's not strictly necessary to have that mapping, but it's just handy to have an overview in one place

import sdk from '@cognite/cdf-sdk-singleton';
import { getProject } from '@cognite/cdf-utilities';

import { DetectionModelTypeFeatureMapping } from '../../../constants/DetectionModelTypeApiFieldMapping';

import {
  LegacyVisionJobResultItem,
  VisionDetectionModelType,
  VisionExtractResultItem,
  VisionJobQueued,
} from './types';

export function getDetectionModelEndpoint(modelType: VisionDetectionModelType) {
  if (modelType === VisionDetectionModelType.GaugeReader) {
    return `${sdk.getBaseUrl()}/api/playground/projects/${getProject()}/context/vision/${
      DetectionModelTypeFeatureMapping[modelType]
    }`;
  }

  return `${sdk.getBaseUrl()}/api/v1/projects/${getProject()}/context/vision/extract`;
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
