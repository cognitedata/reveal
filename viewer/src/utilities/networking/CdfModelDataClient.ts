/*!
 * Copyright 2020 Cognite AS
 */
import * as THREE from 'three';
import { CogniteClient, ItemsResponse } from '@cognite/sdk';

import { BlobOutputMetadata, ModelDataClient } from './types';
import { Model3DOutputList } from './Model3DOutputList';
import { File3dFormat, ModelTransformation } from '../types';
import { applyDefaultModelTransformation, createModelTransformation } from './modelTransformation';

// TODO 2020-06-25 larsmoa: Extend CogniteClient.files3d.retrieve() to support subpath instead of
// using URLs directly. Also add support for listing outputs in the SDK.

/**
 * Provides 3D V2 specific extensions for the standard CogniteClient used by Reveal.
 */
export class CdfModelDataClient
  implements ModelDataClient<{ modelId: number; revisionId: number; format: File3dFormat }> {
  private readonly client: CogniteClient;

  constructor(client: CogniteClient) {
    this.client = client;
  }

  get headers() {
    return this.client.getDefaultRequestHeaders();
  }

  public async getBinaryFile(blobUrl: string, fileName: string): Promise<ArrayBuffer> {
    const url = `${blobUrl}/${fileName}`;
    const headers = {
      ...this.client.getDefaultRequestHeaders(),
      Accept: '*/*'
    };
    const response = await fetch(url, { headers, method: 'GET' });
    return response.arrayBuffer();
  }

  async getJsonFile(blobUrl: string, fileName: string): Promise<any> {
    const response = await this.client.get(`${blobUrl}/${fileName}`);
    return response.data;
  }

  public async getModelUrl(modelIdentififer: {
    modelId: number;
    revisionId: number;
    format: File3dFormat | string;
  }): Promise<string> {
    const { modelId, revisionId, format } = modelIdentififer;
    const outputs = await this.getOutputs({ modelId, revisionId, format });
    const mostRecentOutput = outputs.findMostRecentOutput(format);
    if (!mostRecentOutput) {
      throw new Error(
        `Model '${modelId}/${revisionId} (${format})' is not compatible with this version of Reveal. If this model works with a previous version of Reveal it must be reconverted to support this version.`
      );
    }
    const blobId = mostRecentOutput.blobId;
    return `${this.client.getBaseUrl()}${this.buildBlobRequestPath(blobId)}`;
  }

  public async getOutputs(modelIdentifier: {
    modelId: number;
    revisionId: number;
    format?: File3dFormat | string;
  }): Promise<Model3DOutputList> {
    const { modelId, revisionId, format } = modelIdentifier;
    const url = `/api/v1/projects/${this.client.project}/3d/models/${modelId}/revisions/${revisionId}/outputs`;
    const params = format !== undefined ? { params: { format } } : undefined;
    const response = await this.client.get<ItemsResponse<BlobOutputMetadata>>(url, params);
    if (response.status === 200) {
      return new Model3DOutputList(modelId, revisionId, response.data.items);
    }
    throw new Error(`Unexpected response ${response.status} (payload: '${response.data})`);
  }

  public async getModelTransformation(modelIdentifier: {
    modelId: number;
    revisionId: number;
    format: File3dFormat | string;
  }): Promise<ModelTransformation> {
    const { modelId, revisionId, format } = modelIdentifier;
    const model = await this.client.revisions3D.retrieve(modelId, revisionId);

    const modelMatrix = new THREE.Matrix4();
    if (model.rotation) {
      modelMatrix.makeRotationFromEuler(new THREE.Euler(...model.rotation));
    }
    applyDefaultModelTransformation(modelMatrix, format);
    return createModelTransformation(modelMatrix);
  }

  private buildBlobRequestPath(blobId: number): string {
    const url = `/api/v1/projects/${this.client.project}/3d/files/${blobId}`;
    return url;
  }
}
