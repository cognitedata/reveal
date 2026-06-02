/*!
 * Copyright 2022 Cognite AS
 */

import type { ModelDataProvider } from '@reveal/data-providers';
import { DEFAULT_POINT_CLOUD_CLASS_DEFINITION_FILE } from '../constants';
import type { IPointClassificationsProvider } from './IPointClassificationsProvider';
import type { PointCloudMetadata } from '../PointCloudMetadata';
import type { ClassificationInfo } from '../potree-three-loader/loading/ClassificationInfo';

export class UrlPointClassificationsProvider implements IPointClassificationsProvider {
  _dataProvider: ModelDataProvider;

  constructor(dataProvider: ModelDataProvider) {
    this._dataProvider = dataProvider;
  }

  async getClassifications(modelMetadata: PointCloudMetadata): Promise<ClassificationInfo> {
    return this._dataProvider
      .getJsonFile(modelMetadata.modelBaseUrl, DEFAULT_POINT_CLOUD_CLASS_DEFINITION_FILE)
      .then(json => json as ClassificationInfo)
      .catch(_ => ({ classificationSets: [] }));
  }
}
