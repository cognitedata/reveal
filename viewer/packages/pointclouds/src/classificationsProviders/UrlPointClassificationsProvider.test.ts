/*!
 * Copyright 2026 Cognite AS
 */

import { vi } from 'vitest';
import { Matrix4 } from 'three';
import { UrlPointClassificationsProvider } from './UrlPointClassificationsProvider';
import type { ModelDataProvider, ModelIdentifier } from '@reveal/data-providers';
import { CdfModelIdentifier, File3dFormat } from '@reveal/data-providers';
import type { PointCloudMetadata } from '../PointCloudMetadata';
import { createMockModelDataProvider } from '../../../../test-utilities/src/createMockModelDataProvider';
import { mockDMModelIdentifier as dmIdentifier } from '../../../../test-utilities/src/mockModelIdentifiers';

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

const classificationData = { classificationSets: [{ name: 'Default', classes: [] }] };
const classificationSignedUrl = 'https://cdn.example.com/classificationSets.json';

describe(UrlPointClassificationsProvider.name, () => {
  test('DM model calls getFileUrlsForModel+getJsonFile; classic model calls getJsonFile directly', async () => {
    const dmProvider = createMockModelDataProvider({
      getFileUrlsForModel: vi.fn(async () => [
        { fileName: 'classificationSets.json', signedUrl: classificationSignedUrl, subPath: '' }
      ]),
      getJsonFile: vi.fn(async () => classificationData) as ModelDataProvider['getJsonFile']
    });
    const dmResult = await new UrlPointClassificationsProvider(dmProvider).getClassifications(
      createMetadata(dmIdentifier)
    );
    expect(dmProvider.getFileUrlsForModel).toHaveBeenCalledWith(
      'https://signed-files.example.com',
      dmIdentifier,
      'classificationSets.json'
    );
    expect(dmProvider.getJsonFile).toHaveBeenCalledWith('', classificationSignedUrl);
    expect(dmResult).toBe(classificationData);

    const classicProvider = createMockModelDataProvider({
      getJsonFile: vi.fn(async () => classificationData) as ModelDataProvider['getJsonFile']
    });
    const classicResult = await new UrlPointClassificationsProvider(classicProvider).getClassifications(
      createMetadata(new CdfModelIdentifier(10, 20))
    );
    expect(classicProvider.getJsonFile).toHaveBeenCalledWith('https://example.com/model', 'classificationSets.json');
    expect(classicResult).toBe(classificationData);
  });

  test.each<[string, ModelIdentifier, Partial<ModelDataProvider>]>([
    [
      'DM throws in getFileUrlsForModel',
      dmIdentifier,
      {
        getFileUrlsForModel: vi.fn<NonNullable<ModelDataProvider['getFileUrlsForModel']>>(async () => {
          throw new Error();
        })
      }
    ],
    ['DM has no getFileUrlsForModel support', dmIdentifier, { getFileUrlsForModel: undefined }],
    [
      'DM finds no matching file in signed files response',
      dmIdentifier,
      { getFileUrlsForModel: vi.fn<NonNullable<ModelDataProvider['getFileUrlsForModel']>>(async () => []) }
    ],
    [
      'DM throws in getJsonFile after finding the file',
      dmIdentifier,
      {
        getFileUrlsForModel: vi.fn<NonNullable<ModelDataProvider['getFileUrlsForModel']>>(async () => [
          { fileName: 'classificationSets.json', signedUrl: classificationSignedUrl, subPath: '' }
        ]),
        getJsonFile: vi.fn(async () => {
          throw new Error();
        }) as ModelDataProvider['getJsonFile']
      }
    ],
    [
      'Classic throws in getJsonFile',
      new CdfModelIdentifier(10, 20),
      {
        getJsonFile: vi.fn(async () => {
          throw new Error();
        }) as ModelDataProvider['getJsonFile']
      }
    ]
  ])('%s returns EMPTY_CLASSIFICATION', async (_, identifier, override) => {
    const result = await new UrlPointClassificationsProvider(createMockModelDataProvider(override)).getClassifications(
      createMetadata(identifier)
    );

    expect(result.classificationSets).toEqual([]);
  });

  test('DM model returns EMPTY_CLASSIFICATION when signedFilesBaseUrl is missing', async () => {
    const result = await new UrlPointClassificationsProvider(createMockModelDataProvider()).getClassifications({
      ...createMetadata(dmIdentifier),
      signedFilesBaseUrl: undefined
    });

    expect(result.classificationSets).toEqual([]);
  });

  test('DM model matches classification file by subPath suffix', async () => {
    const dmProvider = createMockModelDataProvider({
      getFileUrlsForModel: vi.fn<NonNullable<ModelDataProvider['getFileUrlsForModel']>>(async () => [
        { fileName: 'sub/classificationSets.json', signedUrl: classificationSignedUrl, subPath: 'sub' }
      ]),
      getJsonFile: vi.fn(async () => classificationData) as ModelDataProvider['getJsonFile']
    });

    const result = await new UrlPointClassificationsProvider(dmProvider).getClassifications(
      createMetadata(dmIdentifier)
    );

    expect(result).toBe(classificationData);
  });
});
