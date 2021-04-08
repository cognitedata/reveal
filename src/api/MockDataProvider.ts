import {
  AnnotationJobCompleted,
  AnnotationJobQueued,
  DetectionModelDataProvider,
  DetectionModelType,
} from 'src/api/types';
import { singleton } from '@keenondrums/singleton';
import { getFakeQueuedJob } from 'src/api/utils';

@singleton
export class MockDataProvider implements DetectionModelDataProvider {
  postJob(_requestBody: any): Promise<AnnotationJobQueued> {
    return Promise.resolve(getFakeQueuedJob(DetectionModelType.Text));
  }

  fetchJobById(jobId: number): Promise<AnnotationJobCompleted> {
    return Promise.resolve({
      ...getFakeQueuedJob(DetectionModelType.Text),
      jobId,
      fileId: -1,
      fileExternalId: '-1',
      items: [],
      startTime: Date.now(),
      status: 'Completed',
    });
  }
}
