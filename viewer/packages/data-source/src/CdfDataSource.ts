/*!
 * Copyright 2021 Cognite AS
 */
import { CogniteClient } from '@cognite/sdk';

import { DataSource } from './DataSource';

import { NodesApiClient, NodesCdfClient } from '@reveal/nodes-api';
import {
  CdfModelMetadataProvider,
  ModelDataProvider,
  ModelMetadataProvider,
  CdfModelDataProvider
} from '@reveal/data-providers';

/**
 * Data source for Cognite Data Fusion.
 */

export class CdfDataSource implements DataSource {
  private readonly _metadataProvider: CdfModelMetadataProvider;
  private readonly _nodesApiClient: NodesCdfClient;
  private readonly _modelDataClient: CdfModelDataProvider;

  constructor(sdkClient: CogniteClient) {
    this._metadataProvider = new CdfModelMetadataProvider(sdkClient);
    this._nodesApiClient = new NodesCdfClient(sdkClient);
    this._modelDataClient = new CdfModelDataProvider(sdkClient);
  }

  getNodesApiClient(): NodesApiClient {
    return this._nodesApiClient;
  }

  getModelDataProvider(): ModelDataProvider {
    return this._modelDataClient;
  }

  getModelMetadataProvider(): ModelMetadataProvider {
    return this._metadataProvider;
  }
}
