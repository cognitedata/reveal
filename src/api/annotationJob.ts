import {
  AnnotationJob,
  DetectionModelDataProvider,
  DetectionModelType,
} from 'src/api/types';
import { OCRDetectionDataProvider } from 'src/api/ocr/OCRDetectionDataProvider';
import { MockDataProvider } from 'src/api/MockDataProvider';
import { TagDetectionDataProvider } from 'src/api/tagDetection/TagDetectionDataProvider';
import { ObjectDetectionDataProvider } from 'src/api/objectDetection/ObjectDetectionDataProvider';

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
    case DetectionModelType.GDPR: {
      return new ObjectDetectionDataProvider();
    }
    default: {
      // todo: implement other data providers and remove that default case and fake provider itself
      return new MockDataProvider();
    }
  }
}

export async function createAnnotationJob(
  detectionModel: DetectionModelType,
  fileIds: number[]
): Promise<AnnotationJob> {
  const dataProvider = getDetectionModelDataProvider(detectionModel);
  const job = await dataProvider.postJob(fileIds);
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
