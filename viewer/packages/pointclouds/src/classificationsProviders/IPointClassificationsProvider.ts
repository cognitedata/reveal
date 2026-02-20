/*!
 * Copyright 2022 Cognite AS
 */

import { PointCloudMetadata } from '../PointCloudMetadata';
import { PointCloudClassificationInfoWithSignedFiles } from '../types';

export interface IPointClassificationsProvider {
  getClassifications(modelMetadata: PointCloudMetadata): Promise<PointCloudClassificationInfoWithSignedFiles>;
}
