/*!
 * Copyright 2024 Cognite AS
 */

import { CogniteClient } from '@cognite/sdk';
import { DataModelsSdk } from '../../DataModelsSdk';
import { PointCloudStylableObjectProvider } from '../../PointCloudStylableObjectProvider';
import { getDMPointCloudObjects } from '../../utilities/getDMPointCloudObjects';
import { cdfAnnotationsToObjectInfo } from '../cdfAnnotationsToObjects';
import { PointCloudObject } from '../types';
import { DMDataSourceType, DMModelIdentifierType } from 'api-entry-points/core';

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

    return cdfAnnotationsToObjectInfo<DMDataSourceType>(annotations);
  }
}
