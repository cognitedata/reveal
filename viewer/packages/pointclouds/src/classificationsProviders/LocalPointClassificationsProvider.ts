/*!
 * Copyright 2022 Cognite AS
 */

import type { IPointClassificationsProvider } from './IPointClassificationsProvider';
import type { PointCloudMetadata } from '../PointCloudMetadata';
import type { ClassificationInfo } from '../potree-three-loader';

export class LocalPointClassificationsProvider implements IPointClassificationsProvider {
  async getClassifications(_modelMetadata: PointCloudMetadata): Promise<ClassificationInfo> {
    return {
      classificationSets: []
    };
  }
}
