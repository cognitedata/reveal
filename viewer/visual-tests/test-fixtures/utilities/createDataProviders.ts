/*!
 * Copyright 2022 Cognite AS
 */

import { createApplicationSDK } from '../../../test-utilities/src/appUtils';
import {
  ModelMetadataProvider,
  ModelDataProvider,
  ModelIdentifier,
  LocalModelMetadataProvider,
  LocalModelDataProvider,
  CdfModelMetadataProvider,
  CdfModelDataProvider,
  LocalModelIdentifier,
  CdfModelIdentifier
} from '../../../packages/modeldata-api';

export function createDataProviders(): Promise<{
  modelMetadataProvider: ModelMetadataProvider;
  modelDataProvider: ModelDataProvider;
  modelIdentifier: ModelIdentifier;
}> {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);

  if (urlParams.has('modelId') && urlParams.has('revisionId')) {
    return createCdfDataProviders(urlParams);
  }

  return Promise.resolve(createLocalDataProviders(urlParams));
}

function createLocalDataProviders(urlParams: URLSearchParams) {
  const modelUrl = urlParams.get('modelUrl') ?? 'primitives';
  const modelIdentifier = new LocalModelIdentifier(modelUrl);
  const modelMetadataProvider = new LocalModelMetadataProvider();
  const modelDataProvider = new LocalModelDataProvider();
  return { modelMetadataProvider, modelDataProvider, modelIdentifier };
}

async function createCdfDataProviders(urlParams: URLSearchParams): Promise<{
  modelMetadataProvider: ModelMetadataProvider;
  modelDataProvider: ModelDataProvider;
  modelIdentifier: ModelIdentifier;
}> {
  const client = await createApplicationSDK('reveal.example.simple', {
    project: '3d-test',
    cluster: 'greenfield',
    clientId: 'a03a8caf-7611-43ac-87f3-1d493c085579',
    tenantId: '20a88741-8181-4275-99d9-bd4451666d6e'
  });

  const modelId = parseInt(urlParams.get('modelId')!);
  const revisionId = parseInt(urlParams.get('revisionId')!);

  const modelIdentifier = new CdfModelIdentifier(modelId, revisionId);
  const modelMetadataProvider = new CdfModelMetadataProvider(client);
  const modelDataProvider = new CdfModelDataProvider(client);
  return { modelMetadataProvider, modelDataProvider, modelIdentifier };
}
