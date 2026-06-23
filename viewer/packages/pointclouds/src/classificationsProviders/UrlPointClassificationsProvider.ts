/*!
 * Copyright 2022 Cognite AS
 */

import type { ModelDataProvider } from '@reveal/data-providers';
import { DMModelIdentifier, isDMIdentifier } from '@reveal/data-providers';
import { DEFAULT_POINT_CLOUD_CLASS_DEFINITION_FILE } from '../constants';
import type { IPointClassificationsProvider } from './IPointClassificationsProvider';
import type { PointCloudMetadata } from '../PointCloudMetadata';
import type { PointCloudClassificationInfoWithSignedFiles } from '../types';
import type { ClassificationInfo } from '../potree-three-loader';

const EMPTY_CLASSIFICATION: PointCloudClassificationInfoWithSignedFiles = {
  type: 'classificationInfo',
  signedFiles: { items: [] },
  fileData: { classificationSets: [] }
};

export class UrlPointClassificationsProvider implements IPointClassificationsProvider {
  _dataProvider: ModelDataProvider;

  constructor(dataProvider: ModelDataProvider) {
    this._dataProvider = dataProvider;
  }

  async getClassifications(modelMetadata: PointCloudMetadata): Promise<PointCloudClassificationInfoWithSignedFiles> {
    if (modelMetadata.modelIdentifier instanceof DMModelIdentifier && isDMIdentifier(modelMetadata.modelIdentifier)) {
      return this._dataProvider
        .getDMSJsonFileFromFileName(
          modelMetadata.signedFilesBaseUrl,
          modelMetadata.modelIdentifier,
          DEFAULT_POINT_CLOUD_CLASS_DEFINITION_FILE
        )
        .then(json => ({
          type: 'classificationInfo' as const,
          signedFiles: { items: [] },
          fileData: json as ClassificationInfo
        }))
        .catch(() => EMPTY_CLASSIFICATION);
    }
    return this._dataProvider
      .getJsonFile(modelMetadata.modelBaseUrl, DEFAULT_POINT_CLOUD_CLASS_DEFINITION_FILE)
      .then(json => ({
        type: 'classificationInfo' as const,
        signedFiles: { items: [] },
        fileData: json as ClassificationInfo
      }))
      .catch(() => EMPTY_CLASSIFICATION);
  }
}
