import { CustomModelDataProvider } from './customModel/CustomModelDataProvider';
import { GaugeReaderDataProvider } from './gaugeReader/GaugeReaderDetectionDataProvider';
import { MockDataProvider } from './MockDataProvider';
import { ObjectDetectionDataProvider } from './objectDetection/ObjectDetectionDataProvider';
import { OCRDetectionDataProvider } from './ocr/OCRDetectionDataProvider';
import { PeopleDetectionDataProvider } from './peopleDetection/PeopleDetectionDataProvider';
import { TagDetectionDataProvider } from './tagDetection/TagDetectionDataProvider';
import {
  DetectionModelDataProvider,
  DetectionModelParams,
  VisionDetectionModelType,
  VisionJob,
} from './types';

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
