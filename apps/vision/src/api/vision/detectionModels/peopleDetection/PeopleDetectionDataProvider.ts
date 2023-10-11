import { singleton } from '@keenondrums/singleton';

import { DetectionModelTypeFeatureMapping } from '../../../../constants/DetectionModelTypeApiFieldMapping';
import { BaseDetectionModelDataProvider } from '../BaseDetectionModelDataProvider';
import { getDetectionModelEndpoint } from '../detectionUtils';
import { VisionDetectionModelType } from '../types';

@singleton
export class PeopleDetectionDataProvider extends BaseDetectionModelDataProvider {
  url = getDetectionModelEndpoint(VisionDetectionModelType.PeopleDetection);

  features = [
    DetectionModelTypeFeatureMapping[VisionDetectionModelType.PeopleDetection],
  ];

  getParams = (params?: object) => {
    return { peopleDetectionParameters: { ...params } };
  };
}
