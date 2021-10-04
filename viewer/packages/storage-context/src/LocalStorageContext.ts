/*!
 * Copyright 2021 Cognite AS
 */
import { NodesApiClient, NodesLocalClient } from '@reveal/nodes-api';
import {
  ModelDataProvider,
  ModelMetadataProvider,
  LocalModelDataProvider,
  LocalModelMetadataProvider
} from '@reveal/modeldata-api';
import { StorageContext } from './StorageContext';

/**
 * Storage context for loading models from local storage (i.e. by URL).
 * This implementation is meant for use in development.
 */

export class LocalStorageContext implements StorageContext {
  getNodesApiClient(): NodesApiClient {
    return new NodesLocalClient();
  }

  getModelDataClient(): ModelDataProvider {
    return new LocalModelDataProvider();
  }

  getModelMetadataProvider(): ModelMetadataProvider {
    throw new LocalModelMetadataProvider();
  }
}
