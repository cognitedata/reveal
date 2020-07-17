/*!
 * Copyright 2020 Cognite AS
 */

import { PointCloudManager } from './PointCloudManager';
import { PointCloudMetadataRepository } from './PointCloudMetadataRepository';
import { DefaultPointCloudTransformation } from './DefaultPointCloudTransformation';
import { CdfModelDataClient } from '@/utilities/networking/CdfModelDataClient';
import { LocalModelDataClient } from '@/utilities/networking/LocalModelDataClient';
import { PointCloudFactory } from './PointCloudFactory';
import { CdfModelIdentifier, LocalModelIdentifier, ModelDataClient } from '@/utilities/networking/types';

export function createLocalPointCloudManager(client: LocalModelDataClient): PointCloudManager<LocalModelIdentifier> {
  return createPointCloudManager(client);
}
export function createCdfPointCloudManager(client: CdfModelDataClient): PointCloudManager<CdfModelIdentifier> {
  return createPointCloudManager(client);
}

export function createPointCloudManager<T>(client: ModelDataClient<T>): PointCloudManager<T> {
  const transformationProvider = new DefaultPointCloudTransformation();
  const metadataRepository = new PointCloudMetadataRepository(client, transformationProvider);
  const modelFactory = new PointCloudFactory(client);
  return new PointCloudManager(metadataRepository, modelFactory);
}
