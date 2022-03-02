import {
  AnnotationJobCompleted,
  AnnotationJobQueued,
  DetectionModelDataProvider,
  VisionAPIType,
} from 'src/api/vision/detectionModels/types';
import { singleton } from '@keenondrums/singleton';
import { getFakeQueuedJob } from 'src/api/vision/detectionModels/detectionUtils';

@singleton
export class MockDataProvider implements DetectionModelDataProvider {
  postJob(_requestBody: any): Promise<AnnotationJobQueued> {
    return Promise.resolve(getFakeQueuedJob(VisionAPIType.OCR));
  }

  fetchJobById(jobId: number): Promise<AnnotationJobCompleted> {
    return Promise.resolve({
      ...getFakeQueuedJob(VisionAPIType.OCR),
      jobId,
      fileId: -1,
      fileExternalId: '-1',
      items: [],
      startTime: Date.now(),
      status: 'Completed',
    });
  }
}
