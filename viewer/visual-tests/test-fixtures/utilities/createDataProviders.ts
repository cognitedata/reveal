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
<<<<<<< HEAD
import cdfEnvironments from '../../.cdf-environments.json';
=======
>>>>>>> chore: initial port of rendering package

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
  const tenant = urlParams.get('env') as keyof typeof cdfEnvironments.environments;

  const tenantInfo = cdfEnvironments.environments[tenant ?? 'cog-3d'];

  const project = urlParams.get('project') ?? '3d-test';
  const cluster = urlParams.get('cluster') ?? 'greenfield';

  const client = await createApplicationSDK('reveal.example.simple', {
    project,
    cluster,
    clientId: tenantInfo.clientId,
    tenantId: tenantInfo.tenantId
  });

  const modelId = parseInt(urlParams.get('modelId')!);
  const revisionId = parseInt(urlParams.get('revisionId')!);

  const modelIdentifier = new CdfModelIdentifier(modelId, revisionId);
  const modelMetadataProvider = new CdfModelMetadataProvider(client);
  const modelDataProvider = new CdfModelDataProvider(client);
  return { modelMetadataProvider, modelDataProvider, modelIdentifier };
}
