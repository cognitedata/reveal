import { VisionAPIType } from 'src/api/types';
import { singleton } from '@keenondrums/singleton';
import { BaseDetectionModelDataProvider } from 'src/api/BaseDetectionModelDataProvider';
import { getDetectionModelEndpoint } from 'src/api/detectionUtils';

@singleton
export class ObjectDetectionDataProvider extends BaseDetectionModelDataProvider {
  url = getDetectionModelEndpoint(VisionAPIType.ObjectDetection);
}
