import { BaseDetectionModelDataProvider } from 'src/api/vision/detectionModels/BaseDetectionModelDataProvider';
import { VisionDetectionModelType } from 'src/api/vision/detectionModels/types';
import { singleton } from '@keenondrums/singleton';
import { getDetectionModelEndpoint } from 'src/api/vision/detectionModels/detectionUtils';
import { DetectionModelTypeFeatureMapping } from 'src/constants/DetectionModelTypeApiFieldMapping';

@singleton
export class ObjectDetectionDataProvider extends BaseDetectionModelDataProvider {
  url = getDetectionModelEndpoint(VisionDetectionModelType.ObjectDetection);

  customHeaders = {
    'cdf-version': 'beta',
  };

  features = [
    DetectionModelTypeFeatureMapping[VisionDetectionModelType.ObjectDetection],
  ];

  getParams = (params?: {}) => {
    return { industrialObjectDetectionParameters: { ...params } };
  };
}
