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

const classificationData = { classificationSets: [{ name: 'Default', classes: [] }] };
const classificationSignedUrl = 'https://cdn.example.com/classificationSets.json';
const classicIdentifier = new CdfModelIdentifier(10, 20);
const signedFilesBaseUrl = 'https://signed-files.example.com';
const modelBaseUrl = 'https://example.com/model';

function createMetadata(
  modelIdentifier: ModelIdentifier,
  overrides: Partial<PointCloudMetadata> = {}
): PointCloudMetadata {
  return {
    format: File3dFormat.EptPointCloud,
    formatVersion: 1,
    modelBaseUrl,
    signedFilesBaseUrl,
    modelIdentifier,
    modelMatrix: new Matrix4(),
    scene: {},
    ...overrides
  };
}

const jsonFileOk = () => vi.fn(async () => classificationData) as ModelDataProvider['getJsonFile'];
const jsonFileErr = () =>
  vi.fn(async () => {
    throw new Error();
  });
const fileUrlsOk = (fileName = 'classificationSets.json', subPath = '') =>
  vi.fn<NonNullable<ModelDataProvider['getFileUrlsForModel']>>(async () => [
    { fileName, signedUrl: classificationSignedUrl, subPath }
  ]);

describe(UrlPointClassificationsProvider.name, () => {
  test('DM model calls getFileUrlsForModel+getJsonFile; classic model calls getJsonFile directly', async () => {
    const dmProvider = createMockModelDataProvider({ getFileUrlsForModel: fileUrlsOk(), getJsonFile: jsonFileOk() });
    const dmResult = await new UrlPointClassificationsProvider(dmProvider).getClassifications(
      createMetadata(dmIdentifier)
    );
    expect(dmProvider.getFileUrlsForModel).toHaveBeenCalledWith(
      signedFilesBaseUrl,
      dmIdentifier,
      'classificationSets.json'
    );
    expect(dmProvider.getJsonFile).toHaveBeenCalledWith('', classificationSignedUrl);
    expect(dmResult).toBe(classificationData);

    const classicProvider = createMockModelDataProvider({ getJsonFile: jsonFileOk() });
    const classicResult = await new UrlPointClassificationsProvider(classicProvider).getClassifications(
      createMetadata(classicIdentifier)
    );
    expect(classicProvider.getJsonFile).toHaveBeenCalledWith(modelBaseUrl, 'classificationSets.json');
    expect(classicResult).toBe(classificationData);
  });

  test.each<[string, PointCloudMetadata, Partial<ModelDataProvider>]>([
    [
      'DM throws in getFileUrlsForModel',
      createMetadata(dmIdentifier),
      {
        getFileUrlsForModel: vi.fn<NonNullable<ModelDataProvider['getFileUrlsForModel']>>(async () => {
          throw new Error();
        })
      }
    ],
    ['DM has no getFileUrlsForModel support', createMetadata(dmIdentifier), { getFileUrlsForModel: undefined }],
    [
      'DM finds no matching file',
      createMetadata(dmIdentifier),
      { getFileUrlsForModel: vi.fn<NonNullable<ModelDataProvider['getFileUrlsForModel']>>(async () => []) }
    ],
    [
      'DM throws in getJsonFile after finding file',
      createMetadata(dmIdentifier),
      { getFileUrlsForModel: fileUrlsOk(), getJsonFile: jsonFileErr() }
    ],
    ['DM missing signedFilesBaseUrl', createMetadata(dmIdentifier, { signedFilesBaseUrl: undefined }), {}],
    ['Classic throws in getJsonFile', createMetadata(classicIdentifier), { getJsonFile: jsonFileErr() }]
  ])('%s returns EMPTY_CLASSIFICATION', async (_, metadata, override) => {
    const result = await new UrlPointClassificationsProvider(createMockModelDataProvider(override)).getClassifications(
      metadata
    );
    expect(result.classificationSets).toEqual([]);
  });
});
