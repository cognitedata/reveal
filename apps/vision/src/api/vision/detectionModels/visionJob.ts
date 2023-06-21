import { CustomModelDataProvider } from '@vision/api/vision/detectionModels/customModel/CustomModelDataProvider';
import { GaugeReaderDataProvider } from '@vision/api/vision/detectionModels/gaugeReader/GaugeReaderDetectionDataProvider';
import { MockDataProvider } from '@vision/api/vision/detectionModels/MockDataProvider';
import { ObjectDetectionDataProvider } from '@vision/api/vision/detectionModels/objectDetection/ObjectDetectionDataProvider';
import { OCRDetectionDataProvider } from '@vision/api/vision/detectionModels/ocr/OCRDetectionDataProvider';
import { PeopleDetectionDataProvider } from '@vision/api/vision/detectionModels/peopleDetection/PeopleDetectionDataProvider';
import { TagDetectionDataProvider } from '@vision/api/vision/detectionModels/tagDetection/TagDetectionDataProvider';
import {
  DetectionModelDataProvider,
  DetectionModelParams,
  VisionDetectionModelType,
  VisionJob,
} from '@vision/api/vision/detectionModels/types';

export function getDetectionModelDataProvider(
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
    case VisionDetectionModelType.GaugeReader: {
      return new GaugeReaderDataProvider();
    }
    case VisionDetectionModelType.PeopleDetection: {
      return new PeopleDetectionDataProvider();
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

export async function postVisionJob(
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

export async function fetchVisionJobById(
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
