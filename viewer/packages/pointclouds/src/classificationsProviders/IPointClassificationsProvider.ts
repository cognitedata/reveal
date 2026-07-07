/*!
 * Copyright 2022 Cognite AS
 */

import type { PointCloudMetadata } from '../PointCloudMetadata';
import type { ClassificationInfo } from '../potree-three-loader/loading/ClassificationInfo';

export interface IPointClassificationsProvider {
  getClassifications(modelMetadata: PointCloudMetadata): Promise<ClassificationInfo>;
}
