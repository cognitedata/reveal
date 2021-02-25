import { AnnotationJobResponse, DetectionModelType } from 'src/api/types';
import { getDetectionModelDataProvider } from 'src/api/utils';

export async function putFilesToProcessingQueue(
  modelType: DetectionModelType,
  fileIds: Array<number>
): Promise<Array<AnnotationJobResponse>> {
  const dataProvider = getDetectionModelDataProvider(modelType);
  const promises = fileIds.map((fileId) => dataProvider.postJob(fileId));
  return Promise.all(promises);
}

export function fetchJobById(
  modelType: DetectionModelType,
  jobId: number
): Promise<AnnotationJobResponse> {
  const dataProvider = getDetectionModelDataProvider(modelType);
  return dataProvider.fetchJobById(jobId);
}
