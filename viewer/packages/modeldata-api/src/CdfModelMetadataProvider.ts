/*!
 * Copyright 2022 Cognite AS
 */
import * as THREE from 'three';
import { BlobOutputMetadata } from './types';
import { ModelMetadataProvider } from './ModelMetadataProvider';

import { applyDefaultModelTransformation } from './applyDefaultModelTransformation';
import { Model3DOutputList } from './Model3DOutputList';

import { CogniteClient } from '@cognite/sdk';
import { ItemsResponse } from '@cognite/sdk-core';
import { ModelIdentifier } from './ModelIdentifier';
import { CdfModelIdentifier } from './CdfModelIdentifier';

// TODO 2020-06-25 larsmoa: Extend CogniteClient.files3d.retrieve() to support subpath instead of
// using URLs directly. Also add support for listing outputs in the SDK.
export class CdfModelMetadataProvider implements ModelMetadataProvider {
  private readonly _client: CogniteClient;

  constructor(client: CogniteClient) {
    this._client = client;
  }

  public async getModelMatrix(modelIdentifier: ModelIdentifier): Promise<THREE.Matrix4> {
    if (!(modelIdentifier instanceof CdfModelIdentifier)) {
      throw new Error(`Model must be a ${CdfModelIdentifier.name}, but got ${modelIdentifier.toString()}`);
    }

    const { modelId, revisionId, modelFormat } = modelIdentifier;
    const model = await this._client.revisions3D.retrieve(modelId, revisionId);

    const modelMatrix = new THREE.Matrix4();
    if (model.rotation) {
      modelMatrix.makeRotationFromEuler(new THREE.Euler(...model.rotation));
    }
    applyDefaultModelTransformation(modelMatrix, modelFormat);
    return modelMatrix;
  }

  public async getModelCamera(
    modelIdentifier: ModelIdentifier
  ): Promise<{ position: THREE.Vector3; target: THREE.Vector3 } | undefined> {
    if (!(modelIdentifier instanceof CdfModelIdentifier)) {
      throw new Error(`Model must be a ${CdfModelIdentifier.name}, but got ${modelIdentifier.toString()}`);
    }

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

  public async getModelUri(modelIdentifier: ModelIdentifier): Promise<string> {
    if (!(modelIdentifier instanceof CdfModelIdentifier)) {
      throw new Error(`Model must be a ${CdfModelIdentifier.name}, but got ${modelIdentifier.toString()}`);
    }

    const { modelId, revisionId, modelFormat } = modelIdentifier;
    const outputs = await this.getOutputs(modelIdentifier);
    const mostRecentOutput = outputs.findMostRecentOutput(modelFormat);
    if (!mostRecentOutput) {
      throw new Error(
        `Model '${modelId}/${revisionId}' is not compatible with this version of Reveal, because no outputs for format '(${modelFormat})' was found. If this model works with a previous version of Reveal it must be reprocessed to support this version.`
      );
    }
    const directoryId = mostRecentOutput.blobId;
    return `${this._client.getBaseUrl()}${this.getRequestPath(directoryId)}`;
  }

  private async getOutputs(modelIdentifier: CdfModelIdentifier): Promise<Model3DOutputList> {
    const { modelId, revisionId, modelFormat } = modelIdentifier;
    const url = `/api/v1/projects/${this._client.project}/3d/models/${modelId}/revisions/${revisionId}/outputs`;
    const params = modelFormat !== undefined ? { params: { format: modelFormat } } : undefined;
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
