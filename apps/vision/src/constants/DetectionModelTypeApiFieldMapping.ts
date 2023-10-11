import { VisionDetectionModelType } from '../api/vision/detectionModels/types';

export const DetectionModelTypeFeatureMapping: Record<
  VisionDetectionModelType,
  string
> = {
  [VisionDetectionModelType.OCR]: 'TextDetection',
  [VisionDetectionModelType.TagDetection]: 'AssetTagDetection',
  [VisionDetectionModelType.ObjectDetection]: 'IndustrialObjectDetection',
  [VisionDetectionModelType.PeopleDetection]: 'PeopleDetection',
  [VisionDetectionModelType.GaugeReader]: 'gaugereader',
};
