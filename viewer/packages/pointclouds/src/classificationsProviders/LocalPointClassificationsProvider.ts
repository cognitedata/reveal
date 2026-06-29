/*!
 * Copyright 2022 Cognite AS
 */

import type { IPointClassificationsProvider } from './IPointClassificationsProvider';
import type { PointCloudMetadata } from '../PointCloudMetadata';
import type { PointCloudClassificationInfoWithSignedFiles } from '../types';

export class LocalPointClassificationsProvider implements IPointClassificationsProvider {
  async getClassifications(_modelMetadata: PointCloudMetadata): Promise<PointCloudClassificationInfoWithSignedFiles> {
    return {
      type: 'pointCloudClassificationInfoWithSignedFiles',
      signedFiles: { items: [] },
      fileData: { classificationSets: [] }
    };
  }
}
