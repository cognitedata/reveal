/*!
 * Copyright 2022 Cognite AS
 */

import { PointCloudMetadata } from '../PointCloudMetadata';
import { ClassificationInfo } from '../potree-three-loader/loading/ClassificationInfo';

export interface IPointClassificationsProvider {
  getClassifications(modelMetadata: PointCloudMetadata): Promise<ClassificationInfo>;
}
