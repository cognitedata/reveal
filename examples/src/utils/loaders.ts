/*!
 * Copyright 2020 Cognite AS
 */

import * as reveal from '@cognite/reveal';
import { CogniteClient } from '@cognite/sdk';

/**
 * Loads a CadModel from either CDF or by URL, depending on the the first argument.
 * @param model Model identifier. If a number, the model is assumed to be stored in CDF.
 * @param project If model is a number (i.e. model ID), project must be provided.
 */
export async function loadCadModelFromCdfOrUrl(model: string, project: string | null): Promise<reveal.CadModel> {
  const isUrlModelId = !Number.isNaN(Number(model));
  if (isUrlModelId) {
    if (!project) {
      throw new Error('Must provide project when model is a modelId.');
    }
    const client = new CogniteClient({ appId: 'cognite.reveal.example' });
    client.loginWithOAuth({ project });
    await client.authenticate();
    const id = Number.parseInt(model, 10);
    return reveal.loadCadModelFromCdf(client, id);
  } else {
    return reveal.loadCadModelByUrl(model);
  }
}

/**
 * Loads a PointCloudModel from either CDF or by URL, depending on the the first argument.
 * @param model Model identifier. If a number, the model is assumed to be stored in CDF.
 * @param project If model is a number (i.e. model ID), project must be provided.
 */
export async function loadPointCloudModelFromCdfOrUrl(
  model: string,
  project: string | null
): Promise<reveal.PointCloudModel> {
  const isUrlModelId = !Number.isNaN(Number(model));
  if (isUrlModelId) {
    if (!project) {
      throw new Error('Must provide project when model is a modelId.');
    }
    const client = new CogniteClient({ appId: 'cognite.reveal.example' });
    client.loginWithOAuth({ project });
    await client.authenticate();
    return reveal.createPointCloudModel(client, Number.parseInt(model, 10));
  } else {
    return reveal.createLocalPointCloudModel(model);
  }
}

