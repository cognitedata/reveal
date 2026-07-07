/*!
 * Copyright 2026 Cognite AS
 */

import { vi } from 'vitest';
import { Matrix4, Vector3 } from 'three';
import { PointCloudMetadataRepository } from './PointCloudMetadataRepository';
import type { BlobOutputMetadata, ModelDataProvider, ModelMetadataProvider } from '@reveal/data-providers';
import { CdfModelIdentifier, DMModelIdentifier, File3dFormat } from '@reveal/data-providers';
import type { EptJson } from './potree-three-loader/loading/EptJson';

const minimalEptJson: EptJson = {
  schema: [
    { name: 'X', type: 'float', size: 8, scale: 1, offset: 0 },
    { name: 'Y', type: 'float', size: 8, scale: 1, offset: 0 },
    { name: 'Z', type: 'float', size: 8, scale: 1, offset: 0 }
  ],
  bounds: [0, 0, 0, 100, 100, 100],
  boundsConforming: [0, 0, 0, 100, 100, 100],
  ticks: 128,
  dataType: 'binary'
};

const eptOutput: BlobOutputMetadata = { blobId: 1, format: File3dFormat.EptPointCloud, version: 1 };

const dmIdentifier = new DMModelIdentifier({
  modelId: 1,
  revisionId: 2,
  revisionExternalId: 'ext-id',
  revisionSpace: 'my-space'
});

function createMockedMetadataProvider(signedFilesBaseUrl = ''): ModelMetadataProvider {
  return {
    getModelOutputs: vi.fn<ModelMetadataProvider['getModelOutputs']>(async () => [eptOutput]),
    getModelUri: vi.fn<ModelMetadataProvider['getModelUri']>(async () => 'https://example.com/model'),
    getModelMatrix: vi.fn<ModelMetadataProvider['getModelMatrix']>(async () => new Matrix4()),
    getModelCamera: vi.fn<ModelMetadataProvider['getModelCamera']>(async () => ({
      position: new Vector3(),
      target: new Vector3()
    })),
    getModelUriForSignedFiles: vi.fn<NonNullable<ModelMetadataProvider['getModelUriForSignedFiles']>>(
      () => signedFilesBaseUrl
    )
  };
}

function createMockedModelDataProvider(): ModelDataProvider {
  return {
    getBinaryFile: vi.fn<ModelDataProvider['getBinaryFile']>(),
    getJsonFile: vi.fn(async () => minimalEptJson),
    getFileUrlsForModel: vi.fn(async () => [])
  } as Partial<ModelDataProvider> as ModelDataProvider;
}

describe(PointCloudMetadataRepository.name, () => {
  test('classic model uses getJsonFile and returns empty signedFiles', async () => {
    const classicIdentifier = new CdfModelIdentifier(10, 20);
    const dataProvider = createMockedModelDataProvider();
    const repo = new PointCloudMetadataRepository(createMockedMetadataProvider(), dataProvider);

    const result = await repo.loadData(classicIdentifier);

    expect(dataProvider.getJsonFile).toHaveBeenCalledWith('https://example.com/model', 'ept.json');
    expect(dataProvider.getFileUrlsForModel).not.toHaveBeenCalled();
    expect(result.signedFiles?.items).toEqual([]);
  });

  test('DM model calls getFileUrlsForModel and populates signedFiles and signedFilesBaseUrl', async () => {
    const signedFilesBaseUrl = 'https://api.example.com/3d/output/files';
    const eptJsonSignedUrl = 'https://cdn.example.com/ept.json';
    const eptJsonItem = { signedUrl: eptJsonSignedUrl, fileName: 'ept.json', subPath: '' };
    const signedItem = { signedUrl: 'https://cdn.example.com/0-0-0-0.bin', fileName: '0-0-0-0.bin', subPath: '' };
    const dataProvider: ModelDataProvider = {
      ...createMockedModelDataProvider(),
      getFileUrlsForModel: vi.fn(async () => [eptJsonItem, signedItem]),
      getJsonFile: vi.fn(async () => minimalEptJson)
    } as Partial<ModelDataProvider> as ModelDataProvider;
    const repo = new PointCloudMetadataRepository(createMockedMetadataProvider(signedFilesBaseUrl), dataProvider);

    const result = await repo.loadData(dmIdentifier);

    expect(dataProvider.getFileUrlsForModel).toHaveBeenCalledWith(signedFilesBaseUrl, dmIdentifier);
    expect(dataProvider.getJsonFile).toHaveBeenCalledWith('', eptJsonSignedUrl);
    expect(result.signedFiles?.items).toContainEqual(signedItem);
    expect(result.signedFilesBaseUrl).toBe(signedFilesBaseUrl);
  });
});
