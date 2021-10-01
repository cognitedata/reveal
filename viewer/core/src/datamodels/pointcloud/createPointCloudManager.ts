/*!
 * Copyright 2021 Cognite AS
 */

import { PointCloudManager } from './PointCloudManager';
import { PointCloudMetadataRepository } from './PointCloudMetadataRepository';
import {
  CdfModelDataClient,
  LocalModelDataClient,
  CdfModelIdentifier,
  LocalModelIdentifier,
  ModelDataClient
} from '@reveal/modeldata-api';
import { PointCloudFactory } from './PointCloudFactory';

export function createLocalPointCloudManager(client: LocalModelDataClient): PointCloudManager<LocalModelIdentifier> {
  return createPointCloudManager(client);
}

export function createCdfPointCloudManager(client: CdfModelDataClient): PointCloudManager<CdfModelIdentifier> {
  return createPointCloudManager(client);
}

export function createPointCloudManager<T>(client: ModelDataClient<T>): PointCloudManager<T> {
  const metadataRepository = new PointCloudMetadataRepository(client);
  const modelFactory = new PointCloudFactory(client);
  return new PointCloudManager(metadataRepository, modelFactory);
}
