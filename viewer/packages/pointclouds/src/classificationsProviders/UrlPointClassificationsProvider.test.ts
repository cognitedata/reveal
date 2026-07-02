/*!
 * Copyright 2026 Cognite AS
 */

import { vi } from 'vitest';
import { Matrix4 } from 'three';
import { UrlPointClassificationsProvider } from './UrlPointClassificationsProvider';
import type { ModelDataProvider, ModelIdentifier, SignedFilesResponse } from '@reveal/data-providers';
import { CdfModelIdentifier, DMModelIdentifier, File3dFormat } from '@reveal/data-providers';
import type { PointCloudMetadata } from '../PointCloudMetadata';

function createMockProvider(overrides: Partial<ModelDataProvider> = {}): ModelDataProvider {
  return {
    getBinaryFile: vi.fn<ModelDataProvider['getBinaryFile']>(),
    getJsonFile: vi.fn(),
    getDMSJsonFile: vi.fn<NonNullable<ModelDataProvider['getDMSJsonFile']>>(),
    ...overrides
  } as ModelDataProvider;
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
const classificationSignedUrl = 'https://cdn.example.com/classificationSets.json';

describe(UrlPointClassificationsProvider.name, () => {
  test('DM model calls getDMSJsonFile+getJsonFile; classic model calls getJsonFile directly', async () => {
    const dmProvider = createMockProvider({
      getDMSJsonFile: vi.fn<NonNullable<ModelDataProvider['getDMSJsonFile']>>(
        async (): Promise<SignedFilesResponse> => ({
          items: [{ fileName: 'classificationSets.json', signedUrl: classificationSignedUrl, subPath: '' }]
        })
      ),
      getJsonFile: vi.fn(async () => classificationData) as ModelDataProvider['getJsonFile']
    });
    const dmResult = await new UrlPointClassificationsProvider(dmProvider).getClassifications(
      createMetadata(dmIdentifier)
    );
    expect(dmProvider.getDMSJsonFile).toHaveBeenCalledWith(
      'https://signed-files.example.com',
      dmIdentifier,
      'classificationSets.json'
    );
    expect(dmProvider.getJsonFile).toHaveBeenCalledWith('', classificationSignedUrl);
    expect(dmResult.fileData).toBe(classificationData);

    const classicProvider = createMockProvider({
      getJsonFile: vi.fn(async () => classificationData) as ModelDataProvider['getJsonFile']
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
        getDMSJsonFile: vi.fn<NonNullable<ModelDataProvider['getDMSJsonFile']>>(async () => {
          throw new Error();
        })
      }
    ],
    [
      'Classic',
      new CdfModelIdentifier(10, 20),
      {
        getJsonFile: vi.fn(async () => {
          throw new Error();
        }) as ModelDataProvider['getJsonFile']
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
