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
}

export class CdfStorageContext implements StorageContext {
  private readonly _metadataProvider: CdfModelMetadataProvider;
  private readonly _nodesApiClient: NodesCdfClient;
  private readonly _modelDataClient: CdfModelDataClient;

  constructor(sdkClient: CogniteClient) {
    this._metadataProvider = new CdfModelMetadataProvider(sdkClient);
    this._nodesApiClient = new NodesCdfClient(sdkClient);
    this._modelDataClient = new CdfModelDataClient(sdkClient);
  }

  getNodesApiClient(): NodesApiClient {
    return this._nodesApiClient;
  }

  getModelDataClient(): ModelDataClient {
    return this._modelDataClient;
  }

  getModelMetadataProvider(): ModelMetadataProvider {
    return this._metadataProvider;
  }
}

export class LocalStorageContext implements StorageContext {
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
