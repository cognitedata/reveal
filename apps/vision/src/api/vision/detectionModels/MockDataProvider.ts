import { singleton } from '@keenondrums/singleton';

import { getFakeQueuedJob } from './detectionUtils';
import {
  VisionJobCompleted,
  VisionJobQueued,
  DetectionModelDataProvider,
  VisionDetectionModelType,
} from './types';

@singleton
export class MockDataProvider implements DetectionModelDataProvider {
  postJob(_requestBody: any): Promise<VisionJobQueued> {
    return Promise.resolve(getFakeQueuedJob(VisionDetectionModelType.OCR));
  }

  fetchJobById(jobId: number): Promise<VisionJobCompleted> {
    return Promise.resolve({
      ...getFakeQueuedJob(VisionDetectionModelType.OCR),
      jobId,
      fileId: -1,
      fileExternalId: '-1',
      items: [],
      startTime: Date.now(),
      status: 'Completed',
    });
  }
}
