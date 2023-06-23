import { singleton } from '@keenondrums/singleton';
import { BaseDetectionModelDataProvider } from '@vision/api/vision/detectionModels/BaseDetectionModelDataProvider';
import { getDetectionModelEndpoint } from '@vision/api/vision/detectionModels/detectionUtils';
import { VisionDetectionModelType } from '@vision/api/vision/detectionModels/types';
import { DetectionModelTypeFeatureMapping } from '@vision/constants/DetectionModelTypeApiFieldMapping';

@singleton
export class TagDetectionDataProvider extends BaseDetectionModelDataProvider {
  url = getDetectionModelEndpoint(VisionDetectionModelType.TagDetection);

  features = [
    DetectionModelTypeFeatureMapping[VisionDetectionModelType.TagDetection],
  ];

  getParams = (params?: object) => {
    return { assetTagDetectionParameters: { ...params } };
  };
}
