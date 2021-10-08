/*!
 * Copyright 2021 Cognite AS
 */


import { PointCloudManager } from './PointCloudManager';
import { PointCloudMetadataRepository } from './PointCloudMetadataRepository';
import { PointCloudFactory } from './PointCloudFactory';

import {
  CdfModelDataClient,
  LocalModelDataClient,
  CdfModelIdentifier,
  LocalModelIdentifier,
  ModelDataClient,
  LocalModelMetadataProvider,
  ModelMetadataProvider,
  CdfModelMetadataProvider
} from '@reveal/modeldata-api';

export function createLocalPointCloudManager(
  modelMetadataProvider: LocalModelMetadataProvider,
  modelDataClient: LocalModelDataClient
): PointCloudManager<LocalModelIdentifier> {
  return createPointCloudManager(modelMetadataProvider, modelDataClient);
}

export function createCdfPointCloudManager(
  modelMetadataProvider: CdfModelMetadataProvider,
  modelDataClient: CdfModelDataClient
): PointCloudManager<CdfModelIdentifier> {
  return createPointCloudManager(modelMetadataProvider, modelDataClient);
}

export function createPointCloudManager<T>(
  modelMetadataProvider: ModelMetadataProvider<T>,
  modelDataClient: ModelDataClient
): PointCloudManager<T> {
  const metadataRepository = new PointCloudMetadataRepository(modelMetadataProvider, modelDataClient);
  const modelFactory = new PointCloudFactory(modelDataClient);
  return new PointCloudManager(metadataRepository, modelFactory);
}
