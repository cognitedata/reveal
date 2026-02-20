/*!
 * Copyright 2022 Cognite AS
 */

import { IPointClassificationsProvider } from './IPointClassificationsProvider';
import { PointCloudMetadata } from '../PointCloudMetadata';
import { PointCloudClassificationInfoWithSignedFiles } from '../types';

export class LocalPointClassificationsProvider implements IPointClassificationsProvider {
  async getClassifications(_modelMetadata: PointCloudMetadata): Promise<PointCloudClassificationInfoWithSignedFiles> {
    return { type: 'classificationInfo', signedFiles: { items: [] }, fileData: { classificationSets: [] } };
  }
}
