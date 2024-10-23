/*!
 * Copyright 2024 Cognite AS
 */

import { CogniteClient } from '@cognite/sdk';
import assert from 'assert';
import { DataModelsSdk } from '../../DataModelsSdk';
import { PointCloudStylableObjectProvider } from '../../PointCloudStylableObjectProvider';
import { getDMPointCloudObjects } from '../../utilities/getDMPointCloudObjects';
import { cdfAnnotationsToObjectInfo } from '../cdfAnnotationsToObjects';
import { DMPointCloudVolumeIdentifier, PointCloudObject } from '../types';
import { CdfModelIdentifier } from '../../model-identifiers/CdfModelIdentifier';
import { ModelIdentifier } from '../../ModelIdentifier';
import { DMDataSourceType } from 'api-entry-points/core';

export class CdfPointCloudDMStylableObjectProvider implements PointCloudStylableObjectProvider<DMDataSourceType> {
  private readonly _dmsSdk: DataModelsSdk;

  constructor(sdk: CogniteClient) {
    this._dmsSdk = new DataModelsSdk(sdk);
  }

  getDataModelIdentifier(
    modelIdentifier: CdfModelIdentifier,
    revisionSpace: string | undefined
  ): DMPointCloudVolumeIdentifier | undefined {
    if (revisionSpace === undefined || revisionSpace === '') {
      return;
    }
    const dataModelIdentifier = {
      space: revisionSpace,
      pointCloudModelExternalId: modelIdentifier.modelId.toString(),
      pointCloudModelRevisionId: modelIdentifier.revisionId.toString()
    };
    return dataModelIdentifier;
  }

  async getPointCloudObjects(
    modelIdentifier: ModelIdentifier,
    revisionSpace?: string
  ): Promise<PointCloudObject<DMDataSourceType>[]> {
    assert(modelIdentifier instanceof CdfModelIdentifier);

    const dataModelIdentifier = this.getDataModelIdentifier(modelIdentifier, revisionSpace);
    if (!dataModelIdentifier) {
      return [];
    }
    const annotations = await getDMPointCloudObjects(this._dmsSdk, dataModelIdentifier);

    return cdfAnnotationsToObjectInfo<DMDataSourceType>(annotations);
  }
}
