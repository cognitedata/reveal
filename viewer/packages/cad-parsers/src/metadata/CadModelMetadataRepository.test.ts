/*!
 * Copyright 2022 Cognite AS
 */

import { CadModelMetadataRepository } from './CadModelMetadataRepository';
import { BlobOutputMetadata, File3dFormat, ModelDataProvider, ModelMetadataProvider } from '@reveal/data-providers';

import * as THREE from 'three';
import { createV9SceneSectorMetadata, createMockModelIdentifier } from '../../../../test-utilities';
import { CadSceneRootMetadata } from './parsers/types';

export interface ModelId {
  readonly revealInternalId: symbol;
}

describe(CadModelMetadataRepository.name, () => {
  test('output v9 is returned if it is in the output list', async () => {
    const availableOutputs = [v9BlobOutputMetadata];
    const mockedMetadataProvider = createMockedMetadataProvider(availableOutputs);

    const mockedModelDataProvider = createMockedModelDataProvider();

    const cadModelMetadataRepository = new CadModelMetadataRepository(mockedMetadataProvider, mockedModelDataProvider);

    const mockIdentifier = createMockModelIdentifier();
    const cadModelMetadata = await cadModelMetadataRepository.loadData(mockIdentifier.object());

    expect(cadModelMetadata.formatVersion).toBe(9);
  });
});

function urlFromBlobId(blobId: number) {
  return `some_url/${blobId}`;
}

const v9BlobOutputMetadata: BlobOutputMetadata = {
  blobId: 1,
  format: File3dFormat.GltfCadModel,
  version: 9
};

const v9SceneSectorMetadata: CadSceneRootMetadata = {
  version: 9,
  maxTreeIndex: 800,
  unit: 'Meters',
  sectors: [createV9SceneSectorMetadata(0)]
};

function createMockedMetadataProvider(outputList: BlobOutputMetadata[]): ModelMetadataProvider {
  return {
    getModelOutputs: async (_id: ModelId) => {
      return outputList;
    },
    getModelUri: async (_id: ModelId, cadOutput: BlobOutputMetadata) => {
      return urlFromBlobId(cadOutput.blobId);
    },
    getModelCamera: async () => {
      return { position: new THREE.Vector3(), target: new THREE.Vector3() };
    },
    getModelMatrix: async () => {
      return new THREE.Matrix4();
    }
  };
}

function createMockedModelDataProvider(): ModelDataProvider {
  return {
    getJsonFile: async (url: string) => {
      const isGltf = url === urlFromBlobId(v9BlobOutputMetadata.blobId);
      if (isGltf) {
        return v9SceneSectorMetadata;
      }
    },
    getBinaryFile: async () => {
      return new ArrayBuffer(1);
    }
  };
}
