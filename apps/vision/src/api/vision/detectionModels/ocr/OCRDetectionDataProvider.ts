import { singleton } from '@keenondrums/singleton';
import { BaseDetectionModelDataProvider } from '@vision/api/vision/detectionModels/BaseDetectionModelDataProvider';
import { getDetectionModelEndpoint } from '@vision/api/vision/detectionModels/detectionUtils';
import { VisionDetectionModelType } from '@vision/api/vision/detectionModels/types';
import { DetectionModelTypeFeatureMapping } from '@vision/constants/DetectionModelTypeApiFieldMapping';

@singleton
export class OCRDetectionDataProvider extends BaseDetectionModelDataProvider {
  url = getDetectionModelEndpoint(VisionDetectionModelType.OCR);

  features = [DetectionModelTypeFeatureMapping[VisionDetectionModelType.OCR]];

  getParams = (params?: object) => {
    return { textDetectionParameters: { ...params } };
  };
}
