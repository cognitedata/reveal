/*!
 * Copyright 2022 Cognite AS
 */

import { CadModelMetadataRepository } from './CadModelMetadataRepository';
import type {
  BlobOutputMetadata,
  ModelDataProvider,
  ModelIdentifier,
  ModelMetadataProvider,
  SignedFilesResponse
} from '@reveal/data-providers';
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
    const sceneJsonSignedUrl = 'https://cdn.example.com/scene.json';

    const dmIdentifier = new DMModelIdentifier({
      modelId: 1,
      revisionId: 1,
      revisionExternalId: 'my-revision',
      revisionSpace: 'my-space'
    });

    const getDMSJsonFileMock = vi.fn(
      async (_baseUrl: string, _id: ModelIdentifier, _file: string): Promise<SignedFilesResponse> => ({
        items: [
          { signedUrl: sceneJsonSignedUrl, fileName: 'scene.json', subPath: '' },
          { signedUrl: sectorSignedUrl, fileName: '0.glb', subPath: '' }
        ]
      })
    );

    const getJsonFileMock = vi.fn(
      async (_baseUrl: string, _fileName: string): Promise<unknown> => v9SceneSectorMetadata
    );

    const mockedMetadataProvider = createMockedMetadataProvider([v9BlobOutputMetadata], signedFilesBaseUrl);
    const mockedModelDataProvider: ModelDataProvider = {
      ...createMockedModelDataProvider(),
      getDMSJsonFile: getDMSJsonFileMock,
      getJsonFile: getJsonFileMock
    };

    const repo = new CadModelMetadataRepository(mockedMetadataProvider, mockedModelDataProvider);
    const result = await repo.loadData(dmIdentifier);

    expect(getDMSJsonFileMock).toHaveBeenCalledWith(signedFilesBaseUrl, dmIdentifier, '');
    expect(getJsonFileMock).toHaveBeenCalledWith('', sceneJsonSignedUrl);
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
    getJsonFile: async (baseUrl: string, _fileName: string) => {
      const isGltf = baseUrl === urlFromBlobId(v9BlobOutputMetadata.blobId);
      if (isGltf) {
        return v9SceneSectorMetadata;
      }
      return undefined;
    },
    getBinaryFile: async () => {
      return new ArrayBuffer(1);
    },
    getDMSJsonFile: async () => ({ items: [] })
  } as Partial<ModelDataProvider> as ModelDataProvider;
}
