/*!
 * Copyright 2022 Cognite AS
 */

import type { PointCloudMetadata } from '../PointCloudMetadata';
import type { PointCloudClassificationInfoWithSignedFiles } from '../types';

export interface IPointClassificationsProvider {
  getClassifications(modelMetadata: PointCloudMetadata): Promise<PointCloudClassificationInfoWithSignedFiles>;
}
