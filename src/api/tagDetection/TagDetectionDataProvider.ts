import { VisionAPIType } from 'src/api/types';
import { singleton } from '@keenondrums/singleton';
import { BaseDetectionModelDataProvider } from 'src/api/BaseDetectionModelDataProvider';
import { getDetectionModelEndpoint } from 'src/api/detectionUtils';

@singleton
export class TagDetectionDataProvider extends BaseDetectionModelDataProvider {
  url = getDetectionModelEndpoint(VisionAPIType.TagDetection);
}
