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
import { mockDMModelIdentifier as dmIdentifier } from '../../../../test-utilities';

type ClassificationData = {
  classificationSets: { name: string; classes: any[] }[];
};

type ExpectedCall = { mock: 'getFileUrlsForModel' | 'getJsonFile'; args: unknown[] };

const CLASSIFICATION_DEFINITION_FILE = 'classificationSets.json';
const CLASSIFICATION_DATA: ClassificationData = { classificationSets: [{ name: 'Default', classes: [] }] };
const CLASSIFICATION_SIGNED_URL = 'https://cdn.example.com/classificationSets.json';
const CLASSIC_IDENTIFIER = new CdfModelIdentifier(10, 20);
const SIGNED_FILES_BASE_URL = 'https://signed-files.example.com';
const MODEL_BASE_URL = 'https://example.com/model';

function createMetadata(
  modelIdentifier: ModelIdentifier,
  overrides: Partial<PointCloudMetadata> = {}
): PointCloudMetadata {
  return {
    format: File3dFormat.EptPointCloud,
    formatVersion: 1,
    modelBaseUrl: MODEL_BASE_URL,
    signedFilesBaseUrl: SIGNED_FILES_BASE_URL,
    modelIdentifier,
    modelMatrix: new Matrix4(),
    scene: {},
    ...overrides
  };
}

const jsonFileOk = () => vi.fn(async () => CLASSIFICATION_DATA) as ModelDataProvider['getJsonFile'];
const jsonFileErr = () =>
  vi.fn(async () => {
    throw new Error();
  });
const fileUrlsOk = (fileName = CLASSIFICATION_DEFINITION_FILE, subPath = '') =>
  vi.fn<NonNullable<ModelDataProvider['getFileUrlsForModel']>>(async () => [
    { fileName, signedUrl: CLASSIFICATION_SIGNED_URL, subPath }
  ]);

describe(UrlPointClassificationsProvider.name, () => {
  test.each<[string, PointCloudMetadata, Partial<ModelDataProvider>, ExpectedCall[]]>([
    [
      'DM model calls getFileUrlsForModel+getJsonFile',
      createMetadata(dmIdentifier),
      { getFileUrlsForModel: fileUrlsOk(), getJsonFile: jsonFileOk() },
      [
        { mock: 'getFileUrlsForModel', args: [SIGNED_FILES_BASE_URL, dmIdentifier, CLASSIFICATION_DEFINITION_FILE] },
        { mock: 'getJsonFile', args: ['', CLASSIFICATION_SIGNED_URL] }
      ]
    ],
    [
      'classic model calls getJsonFile directly',
      createMetadata(CLASSIC_IDENTIFIER),
      { getJsonFile: jsonFileOk() },
      [{ mock: 'getJsonFile', args: [MODEL_BASE_URL, CLASSIFICATION_DEFINITION_FILE] }]
    ]
  ])('%s and returns classification data', async (_, metadata, override, expectedCalls) => {
    const provider = createMockModelDataProvider(override);

    const result = await new UrlPointClassificationsProvider(provider).getClassifications(metadata);

    expectedCalls.forEach(({ mock, args }) => expect(provider[mock]).toHaveBeenCalledWith(...args));
    expect(result).toBe(CLASSIFICATION_DATA);
  });

  test.each<[string, PointCloudMetadata, Partial<ModelDataProvider>, Array<'getFileUrlsForModel' | 'getJsonFile'>]>([
    [
      'DM throws in getFileUrlsForModel',
      createMetadata(dmIdentifier),
      {
        getFileUrlsForModel: vi.fn<NonNullable<ModelDataProvider['getFileUrlsForModel']>>(async () => {
          throw new Error();
        })
      },
      []
    ],
    ['DM has no getFileUrlsForModel support', createMetadata(dmIdentifier), { getFileUrlsForModel: undefined }, []],
    [
      'DM finds no matching file',
      createMetadata(dmIdentifier),
      { getFileUrlsForModel: vi.fn<NonNullable<ModelDataProvider['getFileUrlsForModel']>>(async () => []) },
      []
    ],
    [
      'DM throws in getJsonFile after finding file',
      createMetadata(dmIdentifier),
      { getFileUrlsForModel: fileUrlsOk(), getJsonFile: jsonFileErr() },
      []
    ],
    [
      'DM missing signedFilesBaseUrl',
      createMetadata(dmIdentifier, { signedFilesBaseUrl: undefined }),
      {},
      ['getFileUrlsForModel', 'getJsonFile']
    ],
    ['Classic throws in getJsonFile', createMetadata(CLASSIC_IDENTIFIER), { getJsonFile: jsonFileErr() }, []]
  ])('%s returns EMPTY_CLASSIFICATION', async (_, metadata, override, notCalled) => {
    const provider = createMockModelDataProvider(override);

    const result = await new UrlPointClassificationsProvider(provider).getClassifications(metadata);

    expect(result.classificationSets).toEqual([]);
    notCalled.forEach(mock => expect(provider[mock]).not.toHaveBeenCalled());
  });
});
