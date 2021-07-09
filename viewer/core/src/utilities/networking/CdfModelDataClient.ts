/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';
import { CogniteClient, ItemsResponse } from '@cognite/sdk';

import { BlobOutputMetadata, ModelDataClient } from './types';
import { Model3DOutputList } from './Model3DOutputList';
import { File3dFormat, CameraConfiguration } from '../types';
import { applyDefaultModelTransformation } from './applyDefaultModelTransformation';
import { getSdkApplicationId } from './utilities';

// TODO 2020-06-25 larsmoa: Extend CogniteClient.files3d.retrieve() to support subpath instead of
// using URLs directly. Also add support for listing outputs in the SDK.

/**
 * Provides 3D V2 specific extensions for the standard CogniteClient used by Reveal.
 */
export class CdfModelDataClient
  implements ModelDataClient<{ modelId: number; revisionId: number; format: File3dFormat }>
{
  private readonly client: CogniteClient;
  private appId: string | undefined;

  constructor(client: CogniteClient) {
    this.client = client;
  }

  get headers() {
    return this.client.getDefaultRequestHeaders();
  }

  public async getBinaryFile(baseUrl: string, fileName: string): Promise<ArrayBuffer> {
    const url = `${baseUrl}/${fileName}`;
    const headers = {
      ...this.client.getDefaultRequestHeaders(),
      Accept: '*/*'
    };

    const response = await fetchWithRetry(url, { headers, method: 'GET' });
    return response.arrayBuffer();
  }

  async getJsonFile(baseUrl: string, fileName: string): Promise<any> {
    const response = await this.client.get(`${baseUrl}/${fileName}`);
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
        `Model '${modelId}/${revisionId}' is not compatible with this version of Reveal, because no outputs for format '(${format})' was found. If this model works with a previous version of Reveal it must be reprocessed to support this version.`
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

  public async getModelMatrix(modelIdentifier: {
    modelId: number;
    revisionId: number;
    format: File3dFormat | string;
  }): Promise<THREE.Matrix4> {
    const { modelId, revisionId, format } = modelIdentifier;
    const model = await this.client.revisions3D.retrieve(modelId, revisionId);

    const modelMatrix = new THREE.Matrix4();
    if (model.rotation) {
      modelMatrix.makeRotationFromEuler(new THREE.Euler(...model.rotation));
    }
    applyDefaultModelTransformation(modelMatrix, format);
    return modelMatrix;
  }

  public async getModelCamera(modelIdentifier: {
    modelId: number;
    revisionId: number;
    format: File3dFormat | string;
  }): Promise<CameraConfiguration | undefined> {
    const { modelId, revisionId } = modelIdentifier;
    const model = await this.client.revisions3D.retrieve(modelId, revisionId);
    if (model.camera && model.camera.position && model.camera.target) {
      const { position, target } = model.camera;
      return {
        position: new THREE.Vector3(position[0], position[1], position[2]),
        target: new THREE.Vector3(target[0], target[1], target[2])
      };
    }
    return undefined;
  }

  public getApplicationIdentifier(): string {
    if (this.appId === undefined) {
      this.appId = getSdkApplicationId(this.client);
    }
    return this.appId;
  }

  private buildBlobRequestPath(blobId: number): string {
    const url = `/api/v1/projects/${this.client.project}/3d/files/${blobId}`;
    return url;
  }
}

async function fetchWithRetry(input: RequestInfo, options: RequestInit | undefined, retries: number = 3) {
  let error: Error | undefined;
  for (let i = 0; i < retries; i++) {
    try {
      return await fetch(input, options);
    } catch (err) {
      // Keep first error only
      if (error !== undefined) {
        error = err;
      }
    }
  }
  throw error;
}
