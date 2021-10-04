/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';
import { ModelMetadataProvider } from './ModelMetadataProvider';
import { File3dFormat } from './types';
import { applyDefaultModelTransformation } from './applyDefaultModelTransformation';
import { ModelIdentifier, LocalModelIdentifier } from './ModelIdentifier';

export class LocalModelMetadataProvider implements ModelMetadataProvider {
  getModelUrl(modelIdentifier: ModelIdentifier): Promise<string> {
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
}
