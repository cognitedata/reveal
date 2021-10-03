/*!
 * Copyright 2021 Cognite AS
 */

import { PointCloudManager } from './PointCloudManager';
import { PointCloudMetadataRepository } from './PointCloudMetadataRepository';
import { PointCloudFactory } from './PointCloudFactory';

import { ModelDataClient, ModelMetadataProvider } from '@reveal/modeldata-api';

export function createPointCloudManager(
  modelMetadataProvider: ModelMetadataProvider,
  modelDataClient: ModelDataClient
): PointCloudManager {
  const metadataRepository = new PointCloudMetadataRepository(modelMetadataProvider, modelDataClient);
  const modelFactory = new PointCloudFactory(modelDataClient);
  return new PointCloudManager(metadataRepository, modelFactory);
}
