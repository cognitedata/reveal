/*!
 * Copyright 2021 Cognite AS
 */

import { CogniteClient } from '@cognite/sdk';
import { AddModelOptions } from '../public/types';

import { NodesApiClient, NodesCdfClient, NodesLocalClient } from '@reveal/nodes-api';
import {
  CdfModelMetadataProvider,
  ModelDataClient,
  LocalModelDataClient,
  CdfModelDataClient
} from '@reveal/modeldata-api';

/**
 *
 */
export interface StorageContext {
  /**
   * Gets a node API client that is able to fetch data about the
   * model that is about to be added given the options provided.
   * @param addModelOptions
   */
  getNodesApiClient(addModelOptions: AddModelOptions): NodesApiClient;

  // TODO 2021-10-01 larsmoa: Replace with non-generic interface
  getModelMetadataProvider(): CdfModelMetadataProvider;

  getModelDataClient(): ModelDataClient;

  // TODO 2021-10-01 larsmoa: Get rid of direct dependency to CogniteClient
  getSdkClient(): CogniteClient;
}

export class CdfStorageContext implements StorageContext {
  private readonly _sdkClient: CogniteClient;

  constructor(sdkClient: CogniteClient) {
    this._sdkClient = sdkClient;
  }

  getSdkClient(): CogniteClient {
    return this._sdkClient;
  }

  getNodesApiClient(_addModelOptions: AddModelOptions): NodesApiClient {
    return new NodesCdfClient(this._sdkClient);
  }

  getModelDataClient(): ModelDataClient {
    return new CdfModelDataClient(this._sdkClient);
  }

  getModelMetadataProvider(): CdfModelMetadataProvider {
    return new CdfModelMetadataProvider(this._sdkClient);
  }
}

export class LocalStorageContext implements StorageContext {
  getSdkClient(): CogniteClient {
    throw new Error(`Local storage doesn't support Cognite CDF`);
  }

  getNodesApiClient(addModelOptions: AddModelOptions): NodesApiClient {
    if (addModelOptions.localPath === undefined) {
      throw new Error('Only supports local models');
    }
    return new NodesLocalClient(addModelOptions.localPath);
  }

  getModelDataClient(): ModelDataClient {
    return new LocalModelDataClient();
  }

  getModelMetadataProvider(): CdfModelMetadataProvider {
    throw new Error('Not implemented yet');
  }
}
