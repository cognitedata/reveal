import {
  VisionJob,
  DetectionModelDataProvider,
  DetectionModelParams,
  VisionDetectionModelType,
} from 'src/api/vision/detectionModels/types';
import { OCRDetectionDataProvider } from 'src/api/vision/detectionModels/ocr/OCRDetectionDataProvider';
import { MockDataProvider } from 'src/api/vision/detectionModels/MockDataProvider';
import { TagDetectionDataProvider } from 'src/api/vision/detectionModels/tagDetection/TagDetectionDataProvider';
import { ObjectDetectionDataProvider } from 'src/api/vision/detectionModels/objectDetection/ObjectDetectionDataProvider';
import { CustomModelDataProvider } from 'src/api/vision/detectionModels/customModel/CustomModelDataProvider';

function getDetectionModelDataProvider(
  modelType: VisionDetectionModelType
): DetectionModelDataProvider {
  switch (modelType) {
    case VisionDetectionModelType.OCR: {
      return new OCRDetectionDataProvider();
    }
    case VisionDetectionModelType.TagDetection: {
      return new TagDetectionDataProvider();
    }
    case VisionDetectionModelType.ObjectDetection: {
      return new ObjectDetectionDataProvider();
    }
    case VisionDetectionModelType.CustomModel: {
      return new CustomModelDataProvider();
    }
    default: {
      // todo: implement other data providers and remove that default case and fake provider itself
      return new MockDataProvider();
    }
  }
}

export async function createAnnotationJob(
  detectionModel: VisionDetectionModelType,
  fileIds: number[],
  parameters?: DetectionModelParams
): Promise<VisionJob> {
  const dataProvider = getDetectionModelDataProvider(detectionModel);
  const job = await dataProvider.postJob(fileIds, parameters);
  return {
    type: detectionModel,
    ...job,
  };
}

export async function fetchJobById(
  detectionModel: VisionDetectionModelType,
  jobId: number
): Promise<VisionJob> {
  const dataProvider = getDetectionModelDataProvider(detectionModel);
  const job = await dataProvider.fetchJobById(jobId);
  return {
    type: detectionModel,
    ...job,
  };
}
