/*!
 * Copyright 2022 Cognite AS
 */

import { getApplicationSDK } from '../../../test-utilities/src/appUtils';
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
} from '../../../packages/data-providers';
import { CogniteClient } from '@cognite/sdk';

export function createDataProviders(defaultModelLocalUrl = 'primitives'): Promise<{
  modelMetadataProvider: ModelMetadataProvider;
  modelDataProvider: ModelDataProvider;
  modelIdentifier: ModelIdentifier;
  cogniteClient?: CogniteClient;
}> {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);

  if (urlParams.has('modelId') && urlParams.has('revisionId')) {
    return createCdfDataProviders(urlParams);
  }

  return Promise.resolve(createLocalDataProviders(urlParams, defaultModelLocalUrl));
}

function createLocalDataProviders(urlParams: URLSearchParams, defaultModelLocalUrl: string) {
  const modelUrl = urlParams.get('modelUrl') ?? defaultModelLocalUrl;
  const modelIdentifier = new LocalModelIdentifier(modelUrl);
  const modelMetadataProvider = new LocalModelMetadataProvider();
  const modelDataProvider = new LocalModelDataProvider();
  return { modelMetadataProvider, modelDataProvider, modelIdentifier };
}

async function createCdfDataProviders(urlParams: URLSearchParams): Promise<{
  modelMetadataProvider: ModelMetadataProvider;
  modelDataProvider: ModelDataProvider;
  modelIdentifier: ModelIdentifier;
  cogniteClient: CogniteClient;
}> {
  const cogniteClient = await getApplicationSDK(urlParams);

  const modelId = parseInt(urlParams.get('modelId')!);
  const revisionId = parseInt(urlParams.get('revisionId')!);

  const modelIdentifier = new CdfModelIdentifier(modelId, revisionId);
  const modelMetadataProvider = new CdfModelMetadataProvider(cogniteClient);
  const modelDataProvider = new CdfModelDataProvider(cogniteClient);
  return { modelMetadataProvider, modelDataProvider, modelIdentifier, cogniteClient };
}
