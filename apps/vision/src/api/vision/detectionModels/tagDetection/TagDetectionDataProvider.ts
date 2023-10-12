import { singleton } from '@keenondrums/singleton';

import { DetectionModelTypeFeatureMapping } from '../../../../constants/DetectionModelTypeApiFieldMapping';
import { BaseDetectionModelDataProvider } from '../BaseDetectionModelDataProvider';
import { getDetectionModelEndpoint } from '../detectionUtils';
import { VisionDetectionModelType } from '../types';

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
