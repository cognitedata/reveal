import { VisionAPIType } from 'src/api/vision/detectionModels/types';
import { singleton } from '@keenondrums/singleton';
import { BaseDetectionModelDataProvider } from 'src/api/vision/detectionModels/BaseDetectionModelDataProvider';
import { getDetectionModelEndpoint } from 'src/api/vision/detectionModels/detectionUtils';

@singleton
export class OCRDetectionDataProvider extends BaseDetectionModelDataProvider {
  url = getDetectionModelEndpoint(VisionAPIType.OCR);
}
