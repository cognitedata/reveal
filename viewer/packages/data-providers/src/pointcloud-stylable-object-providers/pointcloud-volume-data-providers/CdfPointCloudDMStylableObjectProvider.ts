/*!
 * Copyright 2024 Cognite AS
 */

import { CogniteClient } from '@cognite/sdk';
import { DataModelsSdk } from '../../DataModelsSdk';
import { PointCloudStylableObjectProvider } from '../../PointCloudStylableObjectProvider';
import { getDMPointCloudObjects } from './getDMPointCloudObjects';
import { cdfAnnotationsToObjectInfo } from '../cdfAnnotationsToObjects';
import { PointCloudObject } from '../types';
import { CoreDMDataSourceType, DMModelIdentifierType } from '../../DataSourceType';

export class CdfPointCloudDMStylableObjectProvider implements PointCloudStylableObjectProvider<CoreDMDataSourceType> {
  private readonly _dmsSdk: DataModelsSdk;

  constructor(sdk: CogniteClient) {
    this._dmsSdk = new DataModelsSdk(sdk);
  }

  async getPointCloudObjects(
    modelIdentifier: DMModelIdentifierType
  ): Promise<PointCloudObject<CoreDMDataSourceType>[]> {
    if (!modelIdentifier) {
      return [];
    }
    const annotations = await getDMPointCloudObjects(this._dmsSdk, modelIdentifier);

    return cdfAnnotationsToObjectInfo<CoreDMDataSourceType>(annotations);
  }
}
