/*!
 * Copyright 2024 Cognite AS
 */

import type { CogniteClient } from '@cognite/sdk';
import { DataModelsSdk } from '../../DataModelsSdk';
import type { PointCloudStylableObjectProvider } from '../../PointCloudStylableObjectProvider';
import { getDMPointCloudObjects } from './getDMPointCloudObjects';
import { cdfAnnotationsToObjects } from '../cdfAnnotationsToObjects';
import type { PointCloudObject } from '../types';
import type { DMDataSourceType, DMModelIdentifierType } from '../../DataSourceType';

export class CdfPointCloudDMStylableObjectProvider implements PointCloudStylableObjectProvider<DMDataSourceType> {
  private readonly _dmsSdk: DataModelsSdk;

  constructor(sdk: CogniteClient) {
    this._dmsSdk = new DataModelsSdk(sdk);
  }

  async getPointCloudObjects(modelIdentifier: DMModelIdentifierType): Promise<PointCloudObject<DMDataSourceType>[]> {
    if (!modelIdentifier) {
      return [];
    }
    const annotations = await getDMPointCloudObjects(this._dmsSdk, modelIdentifier);

    return cdfAnnotationsToObjects<DMDataSourceType>(annotations);
  }
}
