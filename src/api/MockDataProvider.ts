import {
  AnnotationJobCompleted,
  AnnotationJobQueued,
  DetectionModelDataProvider,
} from 'src/api/types';
import { singleton } from '@keenondrums/singleton';
import { getFakeQueuedJob } from 'src/api/utils';

@singleton
export class MockDataProvider implements DetectionModelDataProvider {
  postJob(_requestBody: any): Promise<AnnotationJobQueued> {
    return Promise.resolve(getFakeQueuedJob());
  }

  fetchJobById(jobId: number): Promise<AnnotationJobCompleted> {
    return Promise.resolve({
      ...getFakeQueuedJob(),
      jobId,
      fileId: -1,
      fileExternalId: '-1',
      items: [],
      startTime: Date.now(),
      status: 'Completed',
    });
  }
}
