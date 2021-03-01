import {
  AnnotationJob,
  DetectionModelDataProvider,
  DetectionModelType,
} from 'src/api/types';
import { OCRDetectionDataProvider } from 'src/api/ocr/OCRDetectionDataProvider';
import { MockDataProvider } from 'src/api/MockDataProvider';
import { TagDetectionDataProvider } from 'src/api/tagDetection/TagDetectionDataProvider';

function getDetectionModelDataProvider(
  modelType: DetectionModelType
): DetectionModelDataProvider {
  switch (modelType) {
    case DetectionModelType.Text: {
      return new OCRDetectionDataProvider();
    }
    case DetectionModelType.Tag: {
      return new TagDetectionDataProvider();
    }
    default: {
      // todo: implement other data providers and remove that default case and fake provider itself
      return new MockDataProvider();
    }
  }
}

// when api will support putting many files to one job you should change that function
// to accept many files and simplify postAnnotationJobs thunk
export async function createAnnotationJob(
  detectionModel: DetectionModelType,
  fileId: number
): Promise<AnnotationJob> {
  const dataProvider = getDetectionModelDataProvider(detectionModel);
  const job = await dataProvider.postJob(fileId);
  return {
    type: detectionModel,
    ...job,
  };
}

export async function fetchJobById(
  detectionModel: DetectionModelType,
  jobId: number
): Promise<AnnotationJob> {
  const dataProvider = getDetectionModelDataProvider(detectionModel);
  const job = await dataProvider.fetchJobById(jobId);
  return {
    type: detectionModel,
    ...job,
  };
}
