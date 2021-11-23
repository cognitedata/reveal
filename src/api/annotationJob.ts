import {
  AnnotationJob,
  DetectionModelDataProvider,
  DetectionModelParams,
  VisionAPIType,
} from 'src/api/types';
import { OCRDetectionDataProvider } from 'src/api/ocr/OCRDetectionDataProvider';
import { MockDataProvider } from 'src/api/MockDataProvider';
import { TagDetectionDataProvider } from 'src/api/tagDetection/TagDetectionDataProvider';
import { ObjectDetectionDataProvider } from 'src/api/objectDetection/ObjectDetectionDataProvider';
import { JobState } from 'src/modules/Process/processSlice';
import { CustomModelDataProvider } from 'src/api/customModel/CustomModelDataProvider';

function getDetectionModelDataProvider(
  modelType: VisionAPIType
): DetectionModelDataProvider {
  switch (modelType) {
    case VisionAPIType.OCR: {
      return new OCRDetectionDataProvider();
    }
    case VisionAPIType.TagDetection: {
      return new TagDetectionDataProvider();
    }
    case VisionAPIType.ObjectDetection: {
      return new ObjectDetectionDataProvider();
    }
    case VisionAPIType.CustomModel: {
      return new CustomModelDataProvider();
    }
    default: {
      // todo: implement other data providers and remove that default case and fake provider itself
      return new MockDataProvider();
    }
  }
}

export async function createAnnotationJob(
  detectionModel: VisionAPIType,
  fileIds: number[],
  parameters?: DetectionModelParams
): Promise<JobState> {
  const dataProvider = getDetectionModelDataProvider(detectionModel);
  const job = await dataProvider.postJob(fileIds, parameters);
  return {
    type: detectionModel,
    fileIds,
    ...job,
  };
}

export async function fetchJobById(
  detectionModel: VisionAPIType,
  jobId: number
): Promise<AnnotationJob> {
  const dataProvider = getDetectionModelDataProvider(detectionModel);
  const job = await dataProvider.fetchJobById(jobId);
  return {
    type: detectionModel,
    ...job,
  };
}
