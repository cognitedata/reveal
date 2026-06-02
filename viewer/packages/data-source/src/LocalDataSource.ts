/*!
 * Copyright 2021 Cognite AS
 */
import type { NodesApiClient } from '@reveal/nodes-api';
import { NodesLocalClient } from '@reveal/nodes-api';
import type { ModelDataProvider, ModelMetadataProvider } from '@reveal/data-providers';
import { LocalModelDataProvider, LocalModelMetadataProvider } from '@reveal/data-providers';
import type { DataSource } from './DataSource';

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
    return new LocalModelMetadataProvider();
  }
}
