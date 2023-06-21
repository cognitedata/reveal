import { singleton } from '@keenondrums/singleton';
import { BaseDetectionModelDataProvider } from '@vision/api/vision/detectionModels/BaseDetectionModelDataProvider';
import { getDetectionModelEndpoint } from '@vision/api/vision/detectionModels/detectionUtils';
import { VisionDetectionModelType } from '@vision/api/vision/detectionModels/types';
import { DetectionModelTypeFeatureMapping } from '@vision/constants/DetectionModelTypeApiFieldMapping';

@singleton
export class ObjectDetectionDataProvider extends BaseDetectionModelDataProvider {
  url = getDetectionModelEndpoint(VisionDetectionModelType.ObjectDetection);

  customHeaders = {
    'cdf-version': 'beta',
  };

  features = [
    DetectionModelTypeFeatureMapping[VisionDetectionModelType.ObjectDetection],
  ];

  getParams = (params?: object) => {
    return { industrialObjectDetectionParameters: { ...params } };
  };
}
