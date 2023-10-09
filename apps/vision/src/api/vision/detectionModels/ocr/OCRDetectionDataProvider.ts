import { singleton } from '@keenondrums/singleton';

import { DetectionModelTypeFeatureMapping } from '../../../../constants/DetectionModelTypeApiFieldMapping';
import { BaseDetectionModelDataProvider } from '../BaseDetectionModelDataProvider';
import { getDetectionModelEndpoint } from '../detectionUtils';
import { VisionDetectionModelType } from '../types';

@singleton
export class OCRDetectionDataProvider extends BaseDetectionModelDataProvider {
  url = getDetectionModelEndpoint(VisionDetectionModelType.OCR);

  features = [DetectionModelTypeFeatureMapping[VisionDetectionModelType.OCR]];

  getParams = (params?: object) => {
    return { textDetectionParameters: { ...params } };
  };
}
