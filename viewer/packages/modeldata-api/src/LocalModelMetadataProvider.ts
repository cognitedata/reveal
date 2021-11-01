/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';

import { applyDefaultModelTransformation } from './applyDefaultModelTransformation';
import { LocalModelIdentifier } from './LocalModelIdentifier';
import { ModelIdentifier } from './ModelIdentifier';
import { ModelMetadataProvider } from './ModelMetadataProvider';
import { BlobOutputMetadata, File3dFormat } from './types';
import { fetchWithStatusCheck } from './utilities';

export class LocalModelMetadataProvider implements ModelMetadataProvider {
  getModelUri(modelIdentifier: ModelIdentifier): Promise<string> {
    if (!(modelIdentifier instanceof LocalModelIdentifier)) {
      throw new Error(`Model must be a ${LocalModelIdentifier.name}, but got ${modelIdentifier.toString()}`);
    }
    return Promise.resolve(`${location.origin}/${modelIdentifier.localPath}`);
  }

  async getModelMatrix(modelIdentifier: ModelIdentifier): Promise<THREE.Matrix4> {
    if (!(modelIdentifier instanceof LocalModelIdentifier)) {
      throw new Error(`Model must be a ${LocalModelIdentifier.name}, but got ${modelIdentifier.toString()}`);
    }

    const matrix = new THREE.Matrix4();
    applyDefaultModelTransformation(matrix, File3dFormat.RevealCadModel);
    return matrix;
  }

  getModelCamera(
    modelIdentifier: ModelIdentifier
  ): Promise<{ position: THREE.Vector3; target: THREE.Vector3 } | undefined> {
    if (!(modelIdentifier instanceof LocalModelIdentifier)) {
      throw new Error(`Model must be a ${LocalModelIdentifier.name}, but got ${modelIdentifier.toString()}`);
    }

    return Promise.resolve(undefined);
  }

  async getModelOutputs(modelIdentifier: ModelIdentifier): Promise<BlobOutputMetadata[]> {
    const modelUri = await this.getModelUri(modelIdentifier);
    const version: number = (await (await fetchWithStatusCheck(modelUri + '/scene.json')).json()).version;

    switch (version) {
      case 8:
        return Promise.resolve([
          {
            blobId: -1,
            format: File3dFormat.RevealCadModel,
            version: version
          }
        ]);
      case 9:
        return Promise.resolve([
          {
            blobId: -1,
            format: File3dFormat.GltfCadModel,
            version: version
          }
        ]);
      default:
        throw new Error(`Only versions 8, 9 are supported(not supported version: ${version})`);
    }
  }
}
