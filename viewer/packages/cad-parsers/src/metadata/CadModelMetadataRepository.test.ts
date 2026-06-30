/*!
 * Copyright 2022 Cognite AS
 */

import { CadModelMetadataRepository } from './CadModelMetadataRepository';
import type { BlobOutputMetadata, ModelDataProvider, ModelMetadataProvider } from '@reveal/data-providers';
import { File3dFormat, LocalModelIdentifier, DMModelIdentifier } from '@reveal/data-providers';

import { vi } from 'vitest';
import { Matrix4, Vector3 } from 'three';
import { createV9SceneSectorMetadata } from '../../../../test-utilities';
import type { CadSceneRootMetadata } from './parsers/types';

export interface ModelId {
  readonly revealInternalId: symbol;
}

describe(CadModelMetadataRepository.name, () => {
  test('output v9 is returned if it is in the output list', async () => {
    const availableOutputs = [v9BlobOutputMetadata];
    const mockedMetadataProvider = createMockedMetadataProvider(availableOutputs);
    const mockedModelDataProvider = createMockedModelDataProvider();
    const cadModelMetadataRepository = new CadModelMetadataRepository(mockedMetadataProvider, mockedModelDataProvider);

    const mockIdentifier = new LocalModelIdentifier('test-model');
    const cadModelMetadata = await cadModelMetadataRepository.loadData(mockIdentifier);

    expect(cadModelMetadata.formatVersion).toBe(9);
  });

  test('Classic model wraps getJsonFile result with empty signedFiles', async () => {
    const availableOutputs = [v9BlobOutputMetadata];
    const mockedMetadataProvider = createMockedMetadataProvider(availableOutputs);
    const mockedModelDataProvider = createMockedModelDataProvider();
    const repo = new CadModelMetadataRepository(mockedMetadataProvider, mockedModelDataProvider);

    const result = await repo.loadData(new LocalModelIdentifier('test-model'));

    expect(result.scene.root.signedUrl).toBeUndefined();
  });

  test('DM model calls getDMSJsonFile and populates sector signedUrl from signedFiles', async () => {
    const signedFilesBaseUrl = 'https://api.cognitedata.com/api/v1/projects/myproj/3d/output/files';
    const sectorSignedUrl = 'https://cdn.example.com/0_textured.glb';

    const dmIdentifier = new DMModelIdentifier({
      modelId: 1,
      revisionId: 1,
      revisionExternalId: 'my-revision',
      revisionSpace: 'my-space'
    });

    const getDMSJsonFileMock = vi.fn(async () => ({
      signedFiles: {
        items: [{ signedUrl: sectorSignedUrl, fileName: '0.glb', subPath: '' }]
      },
      fileData: v9SceneSectorMetadata
    }));

    const mockedMetadataProvider = createMockedMetadataProvider([v9BlobOutputMetadata], signedFilesBaseUrl);
    const mockedModelDataProvider: ModelDataProvider = {
      ...createMockedModelDataProvider(),
      getDMSJsonFile: getDMSJsonFileMock
    };

    const repo = new CadModelMetadataRepository(mockedMetadataProvider, mockedModelDataProvider);
    const result = await repo.loadData(dmIdentifier);

    expect(getDMSJsonFileMock).toHaveBeenCalledWith(signedFilesBaseUrl, dmIdentifier, 'scene.json');
    expect(result.scene.root.signedUrl).toBe(sectorSignedUrl);
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

function createMockedMetadataProvider(
  outputList: BlobOutputMetadata[],
  signedFilesBaseUrl?: string
): ModelMetadataProvider {
  return {
    getModelOutputs: async (_id: ModelId) => {
      return outputList;
    },
    getModelUri: async (_id: ModelId, cadOutput: BlobOutputMetadata) => {
      return urlFromBlobId(cadOutput.blobId);
    },
    getModelCamera: async () => {
      return { position: new Vector3(), target: new Vector3() };
    },
    getModelMatrix: async () => {
      return new Matrix4();
    },
    getModelUriForSignedFiles: async () => {
      return signedFilesBaseUrl ?? '';
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
    getBinaryFile: async () => new ArrayBuffer(1),
    getDMSJsonFile: async () => ({ signedFiles: { items: [] }, fileData: {} })
  };
}
