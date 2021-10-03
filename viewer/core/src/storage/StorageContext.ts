/*!
 * Copyright 2021 Cognite AS
 */

import { CogniteClient } from '@cognite/sdk';

import { NodesApiClient, NodesCdfClient, NodesLocalClient } from '@reveal/nodes-api';
import {
  CdfModelMetadataProvider,
  ModelDataClient,
  ModelMetadataProvider,
  LocalModelDataClient,
  LocalModelMetadataProvider,
  CdfModelDataClient
} from '@reveal/modeldata-api';

/**
 *
 */
export interface StorageContext {
  /**
   * Gets a node API client that is able to fetch data about
   * models.
   */
  getNodesApiClient(): NodesApiClient;

  /**
   * Gets a metadata provider for models.
   */
  getModelMetadataProvider(): ModelMetadataProvider;

  /**
   * Gets a client that is able to download geometry and other files
   * for models.
   */
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

  getNodesApiClient(): NodesApiClient {
    return new NodesCdfClient(this._sdkClient);
  }

  getModelDataClient(): ModelDataClient {
    return new CdfModelDataClient(this._sdkClient);
  }

  getModelMetadataProvider(): ModelMetadataProvider {
    return new CdfModelMetadataProvider(this._sdkClient);
  }
}

export class LocalStorageContext implements StorageContext {
  getSdkClient(): CogniteClient {
    throw new Error(`Local storage doesn't support Cognite CDF`);
  }

  getNodesApiClient(): NodesApiClient {
    return new NodesLocalClient();
  }

  getModelDataClient(): ModelDataClient {
    return new LocalModelDataClient();
  }

  getModelMetadataProvider(): ModelMetadataProvider {
    throw new LocalModelMetadataProvider();
  }
}
