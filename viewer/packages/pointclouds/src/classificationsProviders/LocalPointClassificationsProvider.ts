/*!
 * Copyright 2022 Cognite AS
 */

import { IPointClassificationsProvider } from './IPointClassificationsProvider';
import { PointCloudMetadata } from '../PointCloudMetadata';
import { ClassificationInfo } from '../potree-three-loader/loading/ClassificationInfo';

export class LocalPointClassificationsProvider implements IPointClassificationsProvider {

  async getClassifications(_modelMetadata: PointCloudMetadata): Promise<ClassificationInfo> {
    return { classificationSets: [] };
  }
}
