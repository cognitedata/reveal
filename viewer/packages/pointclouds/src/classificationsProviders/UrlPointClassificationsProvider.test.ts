/*!
 * Copyright 2026 Cognite AS
 */

import { vi } from 'vitest';
import { Matrix4 } from 'three';
import { UrlPointClassificationsProvider } from './UrlPointClassificationsProvider';
import type { ModelDataProvider } from '@reveal/data-providers';
import { CdfModelIdentifier, DMModelIdentifier, File3dFormat } from '@reveal/data-providers';
import type { PointCloudMetadata } from '../PointCloudMetadata';

function createMockProvider(overrides: Partial<ModelDataProvider> = {}): ModelDataProvider {
  const base: ModelDataProvider = {
    getBinaryFile: vi.fn<ModelDataProvider['getBinaryFile']>(),
    getJsonFile: vi.fn<ModelDataProvider['getJsonFile']>(),
    getSignedBinaryFile: vi.fn<ModelDataProvider['getSignedBinaryFile']>(),
    getSignedJsonFile: vi.fn<ModelDataProvider['getSignedJsonFile']>(),
    getDMSJsonFile: vi.fn<ModelDataProvider['getDMSJsonFile']>(),
    getDMSJsonFileFromFileName: vi.fn<ModelDataProvider['getDMSJsonFileFromFileName']>()
  };
  Object.assign(base, overrides);
  return base;
}

function createMetadata(modelIdentifier: InstanceType<typeof CdfModelIdentifier>): PointCloudMetadata {
  return {
    format: File3dFormat.EptPointCloud,
    formatVersion: 1,
    modelBaseUrl: 'https://example.com/model',
    signedFilesBaseUrl: 'https://signed-files.example.com',
    modelIdentifier,
    modelMatrix: new Matrix4(),
    scene: {}
  };
}

const dmIdentifier = new DMModelIdentifier({
  modelId: 1,
  revisionId: 2,
  revisionExternalId: 'ext-id',
  revisionSpace: 'my-space'
});

const classificationData = { classificationSets: [{ name: 'Default', classes: [] }] };

describe(UrlPointClassificationsProvider.name, () => {
  test('DM model calls getDMSJsonFileFromFileName with correct file and base URL', async () => {
    const mockProvider = createMockProvider({
      getDMSJsonFileFromFileName: vi.fn<ModelDataProvider['getDMSJsonFileFromFileName']>(async () => classificationData)
    });
    const provider = new UrlPointClassificationsProvider(mockProvider);
    const metadata = createMetadata(dmIdentifier);

    const result = await provider.getClassifications(metadata);

    expect(mockProvider.getDMSJsonFileFromFileName).toHaveBeenCalledWith(
      'https://signed-files.example.com',
      dmIdentifier,
      'classificationSets.json'
    );
    expect(result.type).toBe('classificationInfo');
    expect(result.fileData).toBe(classificationData);
    expect(result.signedFiles.items).toEqual([]);
  });

  test('Classic model calls getJsonFile with correct base URL and file', async () => {
    const classicIdentifier = new CdfModelIdentifier(10, 20);
    const mockProvider = createMockProvider({
      getJsonFile: vi.fn<ModelDataProvider['getJsonFile']>(async () => classificationData)
    });
    const provider = new UrlPointClassificationsProvider(mockProvider);
    const metadata = createMetadata(classicIdentifier);

    const result = await provider.getClassifications(metadata);

    expect(mockProvider.getJsonFile).toHaveBeenCalledWith('https://example.com/model', 'classificationSets.json');
    expect(result.type).toBe('classificationInfo');
    expect(result.fileData).toBe(classificationData);
  });

  test.each<[string, CdfModelIdentifier, Partial<ModelDataProvider>]>([
    [
      'DM',
      dmIdentifier,
      {
        getDMSJsonFileFromFileName: vi.fn<ModelDataProvider['getDMSJsonFileFromFileName']>(async () => {
          throw new Error();
        })
      }
    ],
    [
      'Classic',
      new CdfModelIdentifier(10, 20),
      {
        getJsonFile: vi.fn<ModelDataProvider['getJsonFile']>(async () => {
          throw new Error();
        })
      }
    ]
  ])('%s returns EMPTY_CLASSIFICATION when provider throws', async (_, identifier, override) => {
    const result = await new UrlPointClassificationsProvider(createMockProvider(override)).getClassifications(
      createMetadata(identifier)
    );

    expect(result.type).toBe('classificationInfo');
    expect(result.fileData.classificationSets).toEqual([]);
    expect(result.signedFiles.items).toEqual([]);
  });
});
