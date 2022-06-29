/*!
 * Copyright 2022 Cognite AS
 */

import { BlobOutputMetadata } from 'extensions/datasource';
import { CadModelMetadataRepository } from './CadModelMetadataRepository';
import { File3dFormat, ModelDataProvider, ModelMetadataProvider } from '@reveal/modeldata-api';

import * as THREE from 'three';
import { createV8SceneSectorMetadata, createV9SceneSectorMetadata } from '../../../../test-utilities';
import { CadSceneRootMetadata } from './parsers/types';

export interface ModelId {
  readonly revealInternalId: symbol;
}

describe(CadModelMetadataRepository.name, () => {
  test('output v8 is returned if v9 is not available', async () => {
    // Arrange

    /* Only return v8 from model metadata provider */
    const availableOutputs = [v8BlobOutputMetadata];
    const mockedMetadataProvider = createMockedMetadataProvider(availableOutputs);

    const mockedModelDataProvider = createMockedModelDataProvider();

    const cadModelMetadataRepository = new CadModelMetadataRepository(mockedMetadataProvider, mockedModelDataProvider);

    // Act
    const cadModelMetadata = await cadModelMetadataRepository.loadData({ revealInternalId: Symbol('some_model_id') });

    // Assert
    expect(cadModelMetadata.formatVersion).toBe(8);
  });

  test('output v9 is returned even if not first in output list', async () => {
    const availableOutputs = [v8BlobOutputMetadata, v9BlobOutputMetadata];
    const mockedMetadataProvider = createMockedMetadataProvider(availableOutputs);

    const mockedModelDataProvider = createMockedModelDataProvider();

    const cadModelMetadataRepository = new CadModelMetadataRepository(mockedMetadataProvider, mockedModelDataProvider);

    const cadModelMetadata = await cadModelMetadataRepository.loadData({ revealInternalId: Symbol('some_model_id') });

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

const v8BlobOutputMetadata: BlobOutputMetadata = {
  blobId: 0,
  format: File3dFormat.RevealCadModel,
  version: 8
};

const v8SceneSectorMetadata: CadSceneRootMetadata = {
  version: 8,
  maxTreeIndex: 800,
  unit: 'Meters',
  sectors: [createV8SceneSectorMetadata(0)]
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
      } else {
        return v8SceneSectorMetadata;
      }
    },
    getBinaryFile: async () => {
      return new ArrayBuffer(1);
    }
  };
}
