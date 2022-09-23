/*!
 * Copyright 2022 Cognite AS
 */

import { ModelDataProvider } from '@reveal/modeldata-api';
import { DEFAULT_POINT_CLOUD_CLASS_DEFINITION_FILE } from '../constants';
import { IPointClassificationsProvider } from './IPointClassificationsProvider';
import { PointCloudMetadata } from '../PointCloudMetadata';
import { ClassificationInfo } from '../potree-three-loader/loading/ClassificationInfo';

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
    ;
  }
}
