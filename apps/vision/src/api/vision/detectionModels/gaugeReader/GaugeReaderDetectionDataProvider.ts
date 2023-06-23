import { singleton } from '@keenondrums/singleton';
import { BaseLegacyDetectionModelDataProvider } from '@vision/api/vision/detectionModels/BaseLegacyDetectionModelDataProvider';
import { getDetectionModelEndpoint } from '@vision/api/vision/detectionModels/detectionUtils';
import { VisionDetectionModelType } from '@vision/api/vision/detectionModels/types';

@singleton
export class GaugeReaderDataProvider extends BaseLegacyDetectionModelDataProvider {
  url = getDetectionModelEndpoint(VisionDetectionModelType.GaugeReader);
}
