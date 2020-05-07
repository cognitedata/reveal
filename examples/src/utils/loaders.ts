/*!
 * Copyright 2020 Cognite AS
 */

import * as reveal from '@cognite/reveal';
import { CogniteClient } from '@cognite/sdk';

export type CdfModelIdentifier = { modelId: number; project: string };
export type UrlModelIdentifier = { modelUrl: string };
export type ModelIdentifier = CdfModelIdentifier | UrlModelIdentifier;

function isUrlModelIdentifier(model: ModelIdentifier): model is UrlModelIdentifier {
  return (model as { modelUrl: string }).modelUrl !== undefined;
}

export function createModelIdentifierFromUrlParams(
  urlParams: URLSearchParams,
  fallbackModel: ModelIdentifier | string,
  options?: {
    modelIdParameterName?: string;
    projectParameterName?: string;
    modelUrlParameterName?: string;
  }
): ModelIdentifier {
  const opts = {
    ...{
      modelIdParameterName: 'model',
      projectParameterName: 'project',
      modelUrlParameterName: 'modelUrl'
    },
    ...options
  };
  const modelId = urlParams.get(opts.modelIdParameterName);
  const modelUrl = urlParams.get(opts.modelUrlParameterName);
  const project = urlParams.get(opts.projectParameterName);
  const fallbackModelIdentifier = typeof fallbackModel === 'string' ? { modelUrl: fallbackModel } : fallbackModel;

  if (modelUrl) {
    return { modelUrl };
  } else if (modelId && project) {
    return { modelId: Number.parseInt(modelId, 10), project };
  } else if (modelId || project) {
    throw new Error('Must specify modelUrl, or both modelId and project');
  } else {
    return fallbackModelIdentifier;
  }
}

/**
 * Loads a CadModel from either CDF or by URL, depending on the the first argument.
 * @param model Model identifier. If a number, the model is assumed to be stored in CDF.
 * @param project If model is a number (i.e. model ID), project must be provided.
 */
export async function loadCadModelFromCdfOrUrl(
  model: ModelIdentifier,
  client?: CogniteClient
): Promise<reveal.CadModel> {
  if (isUrlModelIdentifier(model)) {
    return reveal.loadCadModelByUrl(model.modelUrl);
  } else if (!client) {
    throw new Error('Must provide a SDK client');
  }
  return reveal.loadCadModelFromCdf(client, { id: model.modelId });
}

export async function createClientIfNecessary(
  modelId: ModelIdentifier,
  apiKey: string | null
): Promise<CogniteClient | undefined> {
  if (isUrlModelIdentifier(modelId)) {
    // Model is not on CDF
    return undefined;
  }

  const client = new CogniteClient({ appId: 'cognite.reveal.example' });
  if (apiKey) {
    client.loginWithApiKey({ project: modelId.project, apiKey });
  } else {
    client.loginWithOAuth({ project: modelId.project });
    await client.authenticate();
  }
  return client;
}

/**
 * Loads a PointCloudModel from either CDF or by URL, depending on the the first argument.
 * @param model Model identifier. If a number, the model is assumed to be stored in CDF.
 * @param project If model is a number (i.e. model ID), project must be provided.
 */
export async function loadPointCloudModelFromCdfOrUrl(model: ModelIdentifier): Promise<reveal.PointCloudModel> {
  if (isUrlModelIdentifier(model)) {
    return reveal.createLocalPointCloudModel(model.modelUrl);
  } else {
    const client = new CogniteClient({ appId: 'cognite.reveal.example' });
    client.loginWithOAuth({ project: model.project });
    await client.authenticate();
    return reveal.createPointCloudModel(client, { id: model.modelId });
  }
}
