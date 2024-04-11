/*!
 * Copyright 2022 Cognite AS
 */

import { PointCloudMetadata } from '../PointCloudMetadata';
import { ClassificationInfo } from '../potree-three-loader/loading/ClassificationInfo';

export type IPointClassificationsProvider = {
  getClassifications(modelMetadata: PointCloudMetadata): Promise<ClassificationInfo>;
};
