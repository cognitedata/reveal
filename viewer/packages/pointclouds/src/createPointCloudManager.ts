/*!
 * Copyright 2021 Cognite AS
 */

import { PointCloudManager } from './PointCloudManager';
import { PointCloudMetadataRepository } from './PointCloudMetadataRepository';
import { PointCloudFactory } from './PointCloudFactory';

import { ModelDataProvider, ModelMetadataProvider } from '@reveal/modeldata-api';

export function createPointCloudManager(
  modelMetadataProvider: ModelMetadataProvider,
  modelDataProvider: ModelDataProvider
): PointCloudManager {
  const metadataRepository = new PointCloudMetadataRepository(modelMetadataProvider, modelDataProvider);
  const modelFactory = new PointCloudFactory(modelDataProvider);
  return new PointCloudManager(metadataRepository, modelFactory);
}
