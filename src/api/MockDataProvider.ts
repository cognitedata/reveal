import {
  AnnotationJobCompleted,
  AnnotationJobQueued,
  DetectionModelDataProvider,
} from 'src/api/types';
import { singleton } from '@keenondrums/singleton';

@singleton
export class MockDataProvider implements DetectionModelDataProvider {
  postJob(_requestBody: any): Promise<AnnotationJobQueued> {
    const now = Date.now();
    return Promise.resolve({
      jobId: -1,
      createdTime: now,
      status: 'QUEUED',
      startTime: null,
      statusTime: now,
    });
  }

  fetchJobById(jobId: number): Promise<AnnotationJobCompleted> {
    const now = Date.now();
    return Promise.resolve({
      jobId,
      fileId: -1,
      fileExternalId: '-1',
      createdTime: now,
      status: 'COMPLETED',
      startTime: now,
      statusTime: now,
      items: [],
    });
  }
}
