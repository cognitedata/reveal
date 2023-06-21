import { VisionDetectionModelType } from 'src/api/vision/detectionModels/types';
import { singleton } from '@keenondrums/singleton';
import { BaseLegacyDetectionModelDataProvider } from 'src/api/vision/detectionModels/BaseLegacyDetectionModelDataProvider';
import { getDetectionModelEndpoint } from 'src/api/vision/detectionModels/detectionUtils';

@singleton
export class GaugeReaderDataProvider extends BaseLegacyDetectionModelDataProvider {
  url = getDetectionModelEndpoint(VisionDetectionModelType.GaugeReader);
}
