/*!
 * Copyright 2026 Cognite AS
 */

import { vi } from 'vitest';
import { Matrix4 } from 'three';
import { UrlPointClassificationsProvider } from './UrlPointClassificationsProvider';
import type { ModelDataProvider, ModelIdentifier } from '@reveal/data-providers';
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

function createMetadata(modelIdentifier: ModelIdentifier): PointCloudMetadata {
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
  test('DM model calls getDMSJsonFileFromFileName; classic model calls getJsonFile', async () => {
    const dmProvider = createMockProvider({
      getDMSJsonFileFromFileName: vi.fn<ModelDataProvider['getDMSJsonFileFromFileName']>(async () => classificationData)
    });
    const dmResult = await new UrlPointClassificationsProvider(dmProvider).getClassifications(
      createMetadata(dmIdentifier)
    );
    expect(dmProvider.getDMSJsonFileFromFileName).toHaveBeenCalledWith(
      'https://signed-files.example.com',
      dmIdentifier,
      'classificationSets.json'
    );
    expect(dmResult.fileData).toBe(classificationData);

    const classicProvider = createMockProvider({
      getJsonFile: vi.fn<ModelDataProvider['getJsonFile']>(async () => classificationData)
    });
    const classicResult = await new UrlPointClassificationsProvider(classicProvider).getClassifications(
      createMetadata(new CdfModelIdentifier(10, 20))
    );
    expect(classicProvider.getJsonFile).toHaveBeenCalledWith('https://example.com/model', 'classificationSets.json');
    expect(classicResult.fileData).toBe(classificationData);
  });

  test.each<[string, ModelIdentifier, Partial<ModelDataProvider>]>([
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

    expect(result.fileData.classificationSets).toEqual([]);
    expect(result.signedFiles.items).toEqual([]);
  });
});
