/*!
 * Copyright 2021 Cognite AS
 */
import { NodesApiClient, NodesLocalClient } from '@reveal/nodes-api';
import {
  ModelDataProvider,
  ModelMetadataProvider,
  LocalModelDataProvider,
  LocalModelMetadataProvider
} from '@reveal/data-providers';
import { DataSource } from './DataSource';

/**
 * Data source for loading models from local storage (i.e. by URL).
 * This implementation is meant for use in development.
 */

export class LocalDataSource implements DataSource {
  getNodesApiClient(): NodesApiClient {
    return new NodesLocalClient();
  }

  getModelDataProvider(): ModelDataProvider {
    return new LocalModelDataProvider();
  }

  getModelMetadataProvider(): ModelMetadataProvider {
    throw new LocalModelMetadataProvider();
  }
}
