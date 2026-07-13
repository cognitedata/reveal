/*!
 * Copyright 2022 Cognite AS
 */

import type { ModelDataProvider } from '@reveal/data-providers';
import { DMModelIdentifier } from '@reveal/data-providers';
import { DEFAULT_POINT_CLOUD_CLASS_DEFINITION_FILE } from '../constants';
import type { IPointClassificationsProvider } from './IPointClassificationsProvider';
import type { PointCloudMetadata } from '../PointCloudMetadata';
import type { ClassificationInfo } from '../potree-three-loader';

const EMPTY_CLASSIFICATION: ClassificationInfo = {
  classificationSets: []
};

export class UrlPointClassificationsProvider implements IPointClassificationsProvider {
  private readonly _dataProvider: ModelDataProvider;

  constructor(dataProvider: ModelDataProvider) {
    this._dataProvider = dataProvider;
  }

  async getClassifications(modelMetadata: PointCloudMetadata): Promise<ClassificationInfo> {
    if (modelMetadata.modelIdentifier instanceof DMModelIdentifier) {
      const classificationInfoAlreadyLoaded = modelMetadata.signedFiles?.items.find(
        item =>
          item.fileName === DEFAULT_POINT_CLOUD_CLASS_DEFINITION_FILE ||
          item.fileName.endsWith('/' + DEFAULT_POINT_CLOUD_CLASS_DEFINITION_FILE)
      );

      if (classificationInfoAlreadyLoaded !== undefined) {
        return this.getClassificationsFromSignedUrl(classificationInfoAlreadyLoaded.signedUrl);
      }

      if (this._dataProvider.getFileUrlsForModel === undefined || modelMetadata.signedFilesBaseUrl === undefined)
        return EMPTY_CLASSIFICATION;

      const items = await this._dataProvider
        .getFileUrlsForModel(
          modelMetadata.signedFilesBaseUrl,
          modelMetadata.modelIdentifier,
          DEFAULT_POINT_CLOUD_CLASS_DEFINITION_FILE
        )
        .catch(() => null);

      if (items === null) return EMPTY_CLASSIFICATION;

      const found = items.find(
        item =>
          item.fileName === DEFAULT_POINT_CLOUD_CLASS_DEFINITION_FILE ||
          item.fileName.endsWith('/' + DEFAULT_POINT_CLOUD_CLASS_DEFINITION_FILE)
      );

      if (found === undefined) return EMPTY_CLASSIFICATION;

      return this.getClassificationsFromSignedUrl(found.signedUrl);
    }
    const classicClassification = await this._dataProvider
      .getJsonFile(modelMetadata.modelBaseUrl, DEFAULT_POINT_CLOUD_CLASS_DEFINITION_FILE)
      .catch(() => EMPTY_CLASSIFICATION);

    if (classicClassification === undefined || classicClassification === null) return EMPTY_CLASSIFICATION;

    return classicClassification;
  }

  private async getClassificationsFromSignedUrl(signedUrl: string): Promise<ClassificationInfo> {
    const item = await this._dataProvider.getJsonFile('', signedUrl).catch(() => EMPTY_CLASSIFICATION);
    if (item === undefined || item === null) return EMPTY_CLASSIFICATION;
    return item;
  }
}
