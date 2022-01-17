/*!
 * Copyright 2021 Cognite AS
 */

import { NodesApiClient } from '@reveal/nodes-api';
import { ModelDataProvider, ModelMetadataProvider } from '@reveal/modeldata-api';

/**
 * Describes how Reveal data is stored, and provides means to create custom storage providers
 * that Reveal will fetch data from.
 */
export interface DataSource {
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
  getModelDataProvider(): ModelDataProvider;
}
