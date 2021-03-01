import { DetectionModelType } from 'src/api/types';
import { getDetectionModelEndpoint } from 'src/api/utils';
import { singleton } from '@keenondrums/singleton';
import { BaseDetectionModelDataProvider } from 'src/api/BaseDetectionModelDataProvider';

@singleton
export class TagDetectionDataProvider extends BaseDetectionModelDataProvider {
  url = getDetectionModelEndpoint(DetectionModelType.Tag);
}
