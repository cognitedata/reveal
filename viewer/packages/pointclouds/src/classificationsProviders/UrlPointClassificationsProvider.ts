/*!
 * Copyright 2022 Cognite AS
 */

import { DMModelIdentifier, isDMIdentifier, ModelDataProvider } from '@reveal/data-providers';
import { DEFAULT_POINT_CLOUD_CLASS_DEFINITION_FILE } from '../constants';
import { IPointClassificationsProvider } from './IPointClassificationsProvider';
import { PointCloudMetadata } from '../PointCloudMetadata';
import { PointCloudClassificationInfoWithSignedFiles } from '../types';

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
        .then(json => json as PointCloudClassificationInfoWithSignedFiles)
        .catch(_ => ({ type: 'classificationInfo', signedFiles: { items: [] }, fileData: { classificationSets: [] } }));
    }
    return this._dataProvider
      .getJsonFile(modelMetadata.modelBaseUrl, DEFAULT_POINT_CLOUD_CLASS_DEFINITION_FILE)
      .then(json => json as PointCloudClassificationInfoWithSignedFiles)
      .catch(_ => ({ type: 'classificationInfo', signedFiles: { items: [] }, fileData: { classificationSets: [] } }));
  }
}
