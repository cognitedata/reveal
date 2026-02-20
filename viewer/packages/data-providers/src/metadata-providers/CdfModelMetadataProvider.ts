/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';
import { BlobOutputMetadata, File3dFormat } from '../types';
import { ModelMetadataProvider } from '../ModelMetadataProvider';

import { applyDefaultModelTransformation } from '../utilities/applyDefaultModelTransformation';

import { CogniteClient, ItemsResponse } from '@cognite/sdk';
import { ModelIdentifier } from '../ModelIdentifier';
import { CdfModelIdentifier } from '../model-identifiers/CdfModelIdentifier';

// TODO 2020-06-25 larsmoa: Extend CogniteClient.files3d.retrieve() to support subpath instead of
// using URLs directly. Also add support for listing outputs in the SDK.
export class CdfModelMetadataProvider implements ModelMetadataProvider {
  private readonly _client: CogniteClient;

  constructor(client: CogniteClient) {
    this._client = client;
  }

  public async getModelMatrix(modelIdentifier: ModelIdentifier, format: File3dFormat): Promise<THREE.Matrix4> {
    if (!(modelIdentifier instanceof CdfModelIdentifier)) {
      throw new Error(`Model must be a ${CdfModelIdentifier.name}, but got ${modelIdentifier.toString()}`);
    }

    const { modelId, revisionId } = modelIdentifier;
    const model = await this._client.revisions3D.retrieve(modelId, revisionId);

    const modelMatrix = new THREE.Matrix4();

    if (model.rotation) {
      modelMatrix.makeRotationFromEuler(new THREE.Euler(...model.rotation));
    }
    if (model.scale) {
      const scale = new THREE.Vector3().fromArray(model.scale);
      const scaleMatrix = new THREE.Matrix4().makeScale(...scale.toArray());
      modelMatrix.multiply(scaleMatrix);
    }
    if (model.translation) {
      const translation = new THREE.Vector3().fromArray(model.translation);
      const translationMatrix = new THREE.Matrix4().makeTranslation(...translation.toArray());
      modelMatrix.premultiply(translationMatrix);
    }

    applyDefaultModelTransformation(modelMatrix, format);
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

  public async getModelUri(modelIdentifier: ModelIdentifier, formatMetadata: BlobOutputMetadata): Promise<string> {
    if (!(modelIdentifier instanceof CdfModelIdentifier)) {
      throw new Error(`Model must be a ${CdfModelIdentifier.name}, but got ${modelIdentifier.toString()}`);
    }

    return `${this._client.getBaseUrl()}${this.getRequestPath(formatMetadata.blobId)}`;
  }

  public async getModelUriForSignedFiles(): Promise<string> {
    return `${this._client.getBaseUrl()}${this.getRequestPathForSignedFiles()}`;
  }

  public async getModelOutputs(modelIdentifier: ModelIdentifier): Promise<BlobOutputMetadata[]> {
    if (!(modelIdentifier instanceof CdfModelIdentifier)) {
      throw new Error(`Model must be a ${CdfModelIdentifier.name}, but got ${modelIdentifier.toString()}`);
    }

    const { modelId, revisionId } = modelIdentifier;

    const url = `/api/v1/projects/${this._client.project}/3d/models/${modelId}/revisions/${revisionId}/outputs`;

    const response = await this._client.get<ItemsResponse<BlobOutputMetadata>>(url, {
      params: { format: File3dFormat.AnyFormat }
    });

    if (response.status === 200) {
      return response.data.items.filter(output => Object.values<string>(File3dFormat).includes(output.format));
    }

    throw new Error(`Unexpected response ${response.status} (payload: '${response.data})`);
  }

  private getRequestPath(directoryId: number): string {
    return `/api/v1/projects/${this._client.project}/3d/files/${directoryId}`;
  }

  private getRequestPathForSignedFiles(): string {
    return `/api/v1/projects/${this._client.project}/3d/output/files`;
  }
}
