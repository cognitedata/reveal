/*!
 * Copyright 2021 Cognite AS
 */
import type { Vector3 } from 'three';
import { Matrix4 } from 'three';

import { applyDefaultModelTransformation } from '../utilities/applyDefaultModelTransformation';
import type { ModelIdentifier } from '../ModelIdentifier';
import type { ModelMetadataProvider } from '../ModelMetadataProvider';
import type { BlobOutputMetadata } from '../types';
import { File3dFormat } from '../types';
import { LocalModelIdentifier } from '../model-identifiers/LocalModelIdentifier';
import { fetchWithStatusCheck } from '../utilities/fetchWithStatusCheck';

export class LocalModelMetadataProvider implements ModelMetadataProvider {
  getModelUri(modelIdentifier: ModelIdentifier): Promise<string> {
    if (!(modelIdentifier instanceof LocalModelIdentifier)) {
      throw new Error(`Model must be a ${LocalModelIdentifier.name}, but got ${modelIdentifier.toString()}`);
    }
    if (modelIdentifier.localPath.startsWith('http')) {
      return Promise.resolve(modelIdentifier.localPath);
    }
    return Promise.resolve(`${location.origin}/${modelIdentifier.localPath}`);
  }

  async getModelMatrix(modelIdentifier: ModelIdentifier, format: File3dFormat): Promise<Matrix4> {
    if (!(modelIdentifier instanceof LocalModelIdentifier)) {
      throw new Error(`Model must be a ${LocalModelIdentifier.name}, but got ${modelIdentifier.toString()}`);
    }

    const matrix = new Matrix4();
    applyDefaultModelTransformation(matrix, format);
    return matrix;
  }

  getModelCamera(modelIdentifier: ModelIdentifier): Promise<{ position: Vector3; target: Vector3 } | undefined> {
    if (!(modelIdentifier instanceof LocalModelIdentifier)) {
      throw new Error(`Model must be a ${LocalModelIdentifier.name}, but got ${modelIdentifier.toString()}`);
    }

    return Promise.resolve(undefined);
  }

  async getModelOutputs(modelIdentifier: ModelIdentifier): Promise<BlobOutputMetadata[]> {
    const modelUri = await this.getModelUri(modelIdentifier);

    const output = (await getCadOutput(modelUri)) ?? (await getPointCloudOutput(modelUri));

    if (output) {
      return [output];
    }

    throw new Error(`Only point cloud or CAD models (version 9) are supported)`);

    async function getCadOutput(modelUri: string): Promise<BlobOutputMetadata | undefined> {
      let version: number;

      try {
        version = (await (await fetchWithStatusCheck(modelUri + '/scene.json')).json()).version;
      } catch (error) {
        return undefined;
      }
      switch (version) {
        case 9:
          return Promise.resolve({
            blobId: -1,
            format: File3dFormat.GltfCadModel,
            version: 9
          });
        default:
          return undefined;
      }
    }

    async function getPointCloudOutput(modelUri: string): Promise<BlobOutputMetadata | undefined> {
      let scene: any;

      try {
        scene = await (await fetchWithStatusCheck(modelUri + '/ept.json')).json();
      } catch (error) {
        return undefined;
      }

      if (scene) {
        return Promise.resolve({
          blobId: -1,
          format: File3dFormat.EptPointCloud,
          version: -1
        });
      } else {
        return undefined;
      }
    }
  }
}
