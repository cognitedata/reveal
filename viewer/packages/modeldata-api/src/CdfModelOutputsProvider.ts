/*!
 * Copyright 2021 Cognite AS
 */

import { CdfModelIdentifier } from './CdfModelIdentifier';
import { Model3DOutputList } from './Model3DOutputList';
import { BlobOutputMetadata, File3dFormat } from './types';

import { CogniteClient } from '@cognite/sdk';
import { ItemsResponse } from '@cognite/sdk-core';

/**
 * Helper class for getting the available 'outputs' from the Cognite
 * 3D processing pipeline for a given model.
 */
export class CdfModelOutputsProvider {
  private readonly _client: CogniteClient;

  constructor(client: CogniteClient) {
    this._client = client;
  }

  public async getOutputs(modelIdentifier: CdfModelIdentifier, modelFormat: File3dFormat): Promise<Model3DOutputList> {
    const { modelId, revisionId } = modelIdentifier;
    const url = `/api/v1/projects/${this._client.project}/3d/models/${modelId}/revisions/${revisionId}/outputs`;
    const params = modelFormat !== undefined ? { params: { format: modelFormat } } : undefined;
    const response = await this._client.get<ItemsResponse<BlobOutputMetadata>>(url, params);
    if (response.status === 200) {
      return new Model3DOutputList(modelId, revisionId, response.data.items);
    }
    throw new Error(`Unexpected response ${response.status} (payload: '${response.data})`);
  }
}
