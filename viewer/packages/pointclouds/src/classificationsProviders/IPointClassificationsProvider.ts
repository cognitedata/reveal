/*!
 * Copyright 2022 Cognite AS
 */

import { PointCloudMetadata } from '../PointCloudMetadata';
import { PointCloudClassificationInfoWithSignedFiles } from '../types';
import type { ClassificationInfo } from '../potree-three-loader/loading/ClassificationInfo';

export interface IPointClassificationsProvider {
  getClassifications(modelMetadata: PointCloudMetadata): Promise<PointCloudClassificationInfoWithSignedFiles>;
}
