/*!
 * Copyright 2022 Cognite AS
 */

import type { ModelDataProvider } from '@reveal/data-providers';
import { DMModelIdentifier, isDMIdentifier } from '@reveal/data-providers';
import { DEFAULT_POINT_CLOUD_CLASS_DEFINITION_FILE } from '../constants';
import type { IPointClassificationsProvider } from './IPointClassificationsProvider';
import type { PointCloudMetadata } from '../PointCloudMetadata';
import type { ClassificationInfo } from '../potree-three-loader';

const EMPTY_CLASSIFICATION: ClassificationInfo = {
  classificationSets: []
};

export class UrlPointClassificationsProvider implements IPointClassificationsProvider {
  _dataProvider: ModelDataProvider;

  constructor(dataProvider: ModelDataProvider) {
    this._dataProvider = dataProvider;
  }

  async getClassifications(modelMetadata: PointCloudMetadata): Promise<ClassificationInfo> {
    if (modelMetadata.modelIdentifier instanceof DMModelIdentifier && isDMIdentifier(modelMetadata.modelIdentifier)) {
      if (!this._dataProvider.getFileUrlsForModel) return EMPTY_CLASSIFICATION;
      const items = await this._dataProvider
        .getFileUrlsForModel(
          modelMetadata.signedFilesBaseUrl,
          modelMetadata.modelIdentifier,
          DEFAULT_POINT_CLOUD_CLASS_DEFINITION_FILE
        )
        .catch(() => null);
      if (!items) return EMPTY_CLASSIFICATION;
      const found = items.find(
        item =>
          item.fileName === DEFAULT_POINT_CLOUD_CLASS_DEFINITION_FILE ||
          item.fileName.endsWith('/' + DEFAULT_POINT_CLOUD_CLASS_DEFINITION_FILE)
      );
      if (!found) return EMPTY_CLASSIFICATION;
      const json = await this._dataProvider.getJsonFile('', found.signedUrl).catch(() => null);
      if (!json) return EMPTY_CLASSIFICATION;
      return json as ClassificationInfo;
    }
    return this._dataProvider
      .getJsonFile(modelMetadata.modelBaseUrl, DEFAULT_POINT_CLOUD_CLASS_DEFINITION_FILE)
      .then(json => json as ClassificationInfo)
      .catch(() => EMPTY_CLASSIFICATION);
  }
}
