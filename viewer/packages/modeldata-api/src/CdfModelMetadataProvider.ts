/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';
import { CogniteClient, ItemsResponse } from '@cognite/sdk';
import { File3dFormat, CameraConfiguration, ModelMetadataProvider, BlobOutputMetadata } from './types';


import { applyDefaultModelTransformation } from './applyDefaultModelTransformation';
import { Model3DOutputList } from './Model3DOutputList';

// TODO 2020-06-25 larsmoa: Extend CogniteClient.files3d.retrieve() to support subpath instead of
// using URLs directly. Also add support for listing outputs in the SDK.

export class CdfModelMetadataProvider
  implements ModelMetadataProvider<{ modelId: number; revisionId: number; format: File3dFormat }>
{
  private readonly _client: CogniteClient;

  constructor(client: CogniteClient) {
    this._client = client;
  }

  public async getModelMatrix(modelIdentifier: {
    modelId: number;
    revisionId: number;
    format: File3dFormat | string;
  }): Promise<THREE.Matrix4> {
    const { modelId, revisionId, format } = modelIdentifier;
    const model = await this._client.revisions3D.retrieve(modelId, revisionId);

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
    const model = await this._client.revisions3D.retrieve(modelId, revisionId);
    if (model.camera && model.camera.position && model.camera.target) {
      const { position, target } = model.camera;
      return {
        position: new THREE.Vector3(position[0], position[1], position[2]),
        target: new THREE.Vector3(target[0], target[1], target[2])
      };
    }
    return undefined;
  }

  public async getModelUrl(modelIdentifier: {
    modelId: number;
    revisionId: number;
    format: File3dFormat | string;
  }): Promise<string> {
    const { modelId, revisionId, format } = modelIdentifier;
    const outputs = await this.getOutputs({ modelId, revisionId, format });
    const mostRecentOutput = outputs.findMostRecentOutput(format);
    if (!mostRecentOutput) {
      throw new Error(
        `Model '${modelId}/${revisionId}' is not compatible with this version of Reveal, because no outputs for format '(${format})' was found. If this model works with a previous version of Reveal it must be reprocessed to support this version.`
      );
    }
    const directoryId = mostRecentOutput.blobId;
    return `${this._client.getBaseUrl()}${this.getRequestPath(directoryId)}`;
  }

  public async getOutputs(modelIdentifier: {
    modelId: number;
    revisionId: number;
    format?: File3dFormat | string;
  }): Promise<Model3DOutputList> {
    const { modelId, revisionId, format } = modelIdentifier;
    const url = `/api/v1/projects/${this._client.project}/3d/models/${modelId}/revisions/${revisionId}/outputs`;
    const params = format !== undefined ? { params: { format } } : undefined;
    const response = await this._client.get<ItemsResponse<BlobOutputMetadata>>(url, params);
    if (response.status === 200) {
      return new Model3DOutputList(modelId, revisionId, response.data.items);
    }
    throw new Error(`Unexpected response ${response.status} (payload: '${response.data})`);
  }

  private getRequestPath(directoryId: number): string {
    return `/api/v1/projects/${this._client.project}/3d/files/${directoryId}`;
  }
}
