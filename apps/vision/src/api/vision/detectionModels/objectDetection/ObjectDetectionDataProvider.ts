import { singleton } from '@keenondrums/singleton';

import { DetectionModelTypeFeatureMapping } from '../../../../constants/DetectionModelTypeApiFieldMapping';
import { BaseDetectionModelDataProvider } from '../BaseDetectionModelDataProvider';
import { getDetectionModelEndpoint } from '../detectionUtils';
import { VisionDetectionModelType } from '../types';

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
