import { BaseDetectionModelDataProvider } from 'src/api/vision/detectionModels/BaseDetectionModelDataProvider';
import { VisionDetectionModelType } from 'src/api/vision/detectionModels/types';
import { singleton } from '@keenondrums/singleton';
import { getDetectionModelEndpoint } from 'src/api/vision/detectionModels/detectionUtils';
import { DetectionModelTypeFeatureMapping } from 'src/constants/DetectionModelTypeApiFieldMapping';

@singleton
export class TagDetectionDataProvider extends BaseDetectionModelDataProvider {
  url = getDetectionModelEndpoint(VisionDetectionModelType.TagDetection);

  features = [
    DetectionModelTypeFeatureMapping[VisionDetectionModelType.TagDetection],
  ];

  getParams = (params?: {}) => {
    return { assetTagDetectionParameters: { ...params } };
  };
}
