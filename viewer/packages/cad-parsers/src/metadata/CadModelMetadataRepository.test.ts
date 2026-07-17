/*!
 * Copyright 2022 Cognite AS
 */

import { CadModelMetadataRepository } from './CadModelMetadataRepository';
import type {
  BlobOutputMetadata,
  ModelDataProvider,
  ModelIdentifier,
  ModelMetadataProvider
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

  test('DM model calls getFileUrlsForModel and populates sector signedUrl from signedFiles', async () => {
    const signedFilesBaseUrl = 'https://api.cognitedata.com/api/v1/projects/myproj/3d/output/files';
    const sectorSignedUrl = 'https://cdn.example.com/0_textured.glb';
    const sceneJsonSignedUrl = 'https://cdn.example.com/scene.json';

    const dmIdentifier = new DMModelIdentifier({
      modelId: 1,
      revisionId: 1,
      revisionExternalId: 'my-revision',
      revisionSpace: 'my-space'
    });

    const sceneJsonItem = { signedUrl: sceneJsonSignedUrl, fileName: 'scene.json', subPath: '' };
    const sectorItem = { signedUrl: sectorSignedUrl, fileName: '0.glb', subPath: '' };
    const getFileUrlsForModelMock = vi.fn(async (_baseUrl: string, _id: ModelIdentifier, fileNameFilter?: string) =>
      fileNameFilter === 'scene.json' ? [sceneJsonItem] : [sceneJsonItem, sectorItem]
    );

    const getJsonFileMock = vi.fn(async () => v9SceneSectorMetadata);

    const mockedMetadataProvider = createMockedMetadataProvider([v9BlobOutputMetadata], signedFilesBaseUrl);
    const mockedModelDataProvider = {
      ...createMockedModelDataProvider(),
      getFileUrlsForModel: getFileUrlsForModelMock,
      getJsonFile: getJsonFileMock
    };

    const repo = new CadModelMetadataRepository(mockedMetadataProvider, mockedModelDataProvider);
    const result = await repo.loadData(dmIdentifier);

    expect(getFileUrlsForModelMock).toHaveBeenCalledWith(signedFilesBaseUrl, dmIdentifier, 'scene.json');
    expect(getFileUrlsForModelMock).toHaveBeenCalledWith(signedFilesBaseUrl, dmIdentifier);
    expect(getJsonFileMock).toHaveBeenCalledWith('', sceneJsonSignedUrl);
    expect(result.scene.root.signedUrl).toBe(sectorSignedUrl);
  });

  test('DM model requests scene.json via filter in parallel with the full signed-files list', async () => {
    const signedFilesBaseUrl = 'https://api.cognitedata.com/api/v1/projects/myproj/3d/output/files';
    const sectorSignedUrl = 'https://cdn.example.com/0_textured.glb';
    const sceneJsonSignedUrl = 'https://cdn.example.com/scene.json';
    const sceneJsonItem = { signedUrl: sceneJsonSignedUrl, fileName: 'scene.json', subPath: '' };
    const sectorItem = { signedUrl: sectorSignedUrl, fileName: '0.glb', subPath: '' };

    const dmIdentifier = new DMModelIdentifier({
      modelId: 1,
      revisionId: 1,
      revisionExternalId: 'my-revision',
      revisionSpace: 'my-space'
    });

    let releaseFilteredCall!: () => void;
    let releaseFullCall!: () => void;
    const filteredCallStarted = vi.fn();
    const fullCallStarted = vi.fn();
    const getFileUrlsForModelMock = vi.fn(async (_baseUrl: string, _id: ModelIdentifier, fileNameFilter?: string) => {
      if (fileNameFilter === 'scene.json') {
        filteredCallStarted();
        await new Promise<void>(resolve => (releaseFilteredCall = resolve));
        return [sceneJsonItem];
      }
      fullCallStarted();
      await new Promise<void>(resolve => (releaseFullCall = resolve));
      return [sceneJsonItem, sectorItem];
    });

    const mockedModelDataProvider = {
      ...createMockedModelDataProvider(),
      getFileUrlsForModel: getFileUrlsForModelMock,
      getJsonFile: vi.fn(async () => v9SceneSectorMetadata)
    };

    const repo = new CadModelMetadataRepository(
      createMockedMetadataProvider([v9BlobOutputMetadata], signedFilesBaseUrl),
      mockedModelDataProvider
    );
    const loadPromise = repo.loadData(dmIdentifier);

    // Yield to let both getFileUrlsForModel invocations register before either resolves.
    await new Promise(resolve => setImmediate(resolve));
    expect(filteredCallStarted).toHaveBeenCalledTimes(1);
    expect(fullCallStarted).toHaveBeenCalledTimes(1);

    releaseFilteredCall();
    releaseFullCall();
    const result = await loadPromise;

    expect(result.scene.root.signedUrl).toBe(sectorSignedUrl);
  });

  test('DM model falls back to base URL fetching when loading via signed files fails', async () => {
    const signedFilesBaseUrl = 'https://api.cognitedata.com/api/v1/projects/myproj/3d/output/files';
    const dmIdentifier = new DMModelIdentifier({
      modelId: 1,
      revisionId: 1,
      revisionExternalId: 'my-revision',
      revisionSpace: 'my-space'
    });

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const mockedMetadataProvider = createMockedMetadataProvider([v9BlobOutputMetadata], signedFilesBaseUrl);
    const mockedModelDataProvider = {
      ...createMockedModelDataProvider(),
      getFileUrlsForModel: vi.fn(async () => {
        throw new Error('signed files endpoint unavailable');
      })
    };

    const repo = new CadModelMetadataRepository(mockedMetadataProvider, mockedModelDataProvider);
    const result = await repo.loadData(dmIdentifier);

    expect(result.signedFilesBaseUrl).toBeUndefined();
    expect(result.scene.root.signedUrl).toBeUndefined();
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Failed to load CAD metadata from signed files'));

    warnSpy.mockRestore();
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
    getModelUriForSignedFiles: () => {
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
    getFileUrlsForModel: async () => []
  };
}
