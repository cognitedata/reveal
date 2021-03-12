import { DetectionModelType } from 'src/api/types';
import { getDetectionModelEndpoint } from 'src/api/utils';
import { singleton } from '@keenondrums/singleton';
import { BaseDetectionModelDataProvider } from 'src/api/BaseDetectionModelDataProvider';

@singleton
export class ObjectDetectionDataProvider extends BaseDetectionModelDataProvider {
  url = getDetectionModelEndpoint(DetectionModelType.GDPR);
}
