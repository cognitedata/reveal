/*!
 * Copyright 2026 Cognite AS
 */

import { vi } from 'vitest';
import { PointCloudEptGeometryNode } from './PointCloudEptGeometryNode';
import type { ModelDataProvider } from '@reveal/data-providers';
import { CdfModelIdentifier } from '@reveal/data-providers';
import type { MetadataWithSignedFiles } from '@reveal/data-providers/src/metadata-providers/types';
import type { EptJson } from '../loading/EptJson';
import {
  createMockEptGeometry,
  createMockModelDataProvider,
  mockDMModelIdentifier
} from '../../../../../test-utilities';

function makeMetadata(items: { fileName: string; signedUrl: string }[]): MetadataWithSignedFiles<EptJson> {
  return {
    signedFiles: { items: items.map(i => ({ ...i, subPath: '' })) },
    fileData: {} as Partial<EptJson> as EptJson
  };
}

describe(PointCloudEptGeometryNode.name, () => {
  describe('constructor — signedUrl resolution from eptMetadata', () => {
    const exactUrl = 'https://cdn.example.com/0-0-0-0.bin';
    const subPathUrl = 'https://cdn.example.com/sub/0-0-0-0.bin';

    test.each<
      [string, MetadataWithSignedFiles<EptJson> | { fileData: EptJson }, string | undefined, string | undefined]
    >([
      [
        'exact match',
        makeMetadata([{ fileName: '0-0-0-0.bin', signedUrl: exactUrl }]),
        'https://signed.example.com',
        exactUrl
      ],
      [
        'subPath match',
        makeMetadata([{ fileName: 'sub/0-0-0-0.bin', signedUrl: subPathUrl }]),
        'https://signed.example.com',
        subPathUrl
      ],
      [
        'missing from signed files',
        makeMetadata([{ fileName: 'other.bin', signedUrl: 'https://cdn.example.com/other.bin' }]),
        'https://signed.example.com',
        undefined
      ],
      ['no metadata', { fileData: {} as Partial<EptJson> as EptJson }, undefined, undefined]
    ])('resolves signedUrl by %s', (_, eptMetadata, signedFilesBaseUrl, expectedUrl) => {
      const node = new PointCloudEptGeometryNode(
        createMockEptGeometry(),
        createMockModelDataProvider(),
        mockDMModelIdentifier,
        eptMetadata,
        signedFilesBaseUrl
      );
      expect(node.signedUrl).toBe(expectedUrl);
    });
  });

  describe('getHierarchy', () => {
    const signedFilesBaseUrl = 'https://signed.example.com';
    const hierarchySignedUrl = 'https://cdn.example.com/ept-hierarchy/0-0-0-0.json';
    const fileName = '0-0-0-0.json';
    const filePath = 'ept-hierarchy/' + fileName;

    test('DM model uses getJsonFile with empty baseUrl on cache hit', async () => {
      const dataProvider = createMockModelDataProvider({
        getJsonFile: vi.fn(async () => ({})) as ModelDataProvider['getJsonFile']
      });
      const node = new PointCloudEptGeometryNode(
        createMockEptGeometry(),
        dataProvider,
        mockDMModelIdentifier,
        makeMetadata([{ fileName: filePath, signedUrl: hierarchySignedUrl }]),
        signedFilesBaseUrl
      );

      await node.getHierarchy(fileName);

      expect(dataProvider.getJsonFile).toHaveBeenCalledWith('', hierarchySignedUrl);
    });

    test('DM model on cache miss resolves via getFileUrlsForModel then getJsonFile', async () => {
      const dataProvider = createMockModelDataProvider({
        getFileUrlsForModel: vi.fn<NonNullable<ModelDataProvider['getFileUrlsForModel']>>(async () => [
          { fileName: filePath, signedUrl: hierarchySignedUrl, subPath: '' }
        ]),
        getJsonFile: vi.fn(async () => ({})) as ModelDataProvider['getJsonFile']
      });
      const node = new PointCloudEptGeometryNode(
        createMockEptGeometry(),
        dataProvider,
        mockDMModelIdentifier,
        makeMetadata([]),
        signedFilesBaseUrl
      );

      await node.getHierarchy(fileName);

      expect(dataProvider.getFileUrlsForModel).toHaveBeenCalledWith(
        signedFilesBaseUrl,
        mockDMModelIdentifier,
        filePath
      );
      expect(dataProvider.getJsonFile).toHaveBeenCalledWith('', hierarchySignedUrl);
    });

    test('classic model uses getJsonFile with ept-hierarchy base URL', async () => {
      const dataProvider = createMockModelDataProvider({
        getJsonFile: vi.fn(async () => ({})) as ModelDataProvider['getJsonFile']
      });
      const node = new PointCloudEptGeometryNode(
        createMockEptGeometry(),
        dataProvider,
        new CdfModelIdentifier(10, 20),
        { fileData: {} as Partial<EptJson> as EptJson },
        undefined
      );

      await node.getHierarchy(fileName);

      expect(dataProvider.getJsonFile).toHaveBeenCalledWith('https://example.com/model/ept-hierarchy', '0-0-0-0.json');
    });

    test.each<[string, Partial<ModelDataProvider>, string]>([
      ['provider does not support getFileUrlsForModel', { getFileUrlsForModel: undefined }, 'does not support'],
      [
        'file is missing from the signed files response',
        { getFileUrlsForModel: vi.fn<NonNullable<ModelDataProvider['getFileUrlsForModel']>>(async () => []) },
        'not found in signed files response'
      ]
    ])('DM model on cache miss throws when %s', async (_, override, expectedMessage) => {
      const node = new PointCloudEptGeometryNode(
        createMockEptGeometry(),
        createMockModelDataProvider(override),
        mockDMModelIdentifier,
        makeMetadata([]),
        signedFilesBaseUrl
      );

      await expect(node.getHierarchy(fileName)).rejects.toThrow(expectedMessage);
    });
  });

  describe('loadHierarchy', () => {
    test('builds child nodes from the hierarchy response, keyed by depth/coordinates', async () => {
      const hierarchy = { '0-0-0-0': 100, '1-0-0-0': 10, '1-1-0-0': 5 };
      const dataProvider = createMockModelDataProvider({
        getJsonFile: vi.fn(async () => hierarchy) as ModelDataProvider['getJsonFile']
      });
      const node = new PointCloudEptGeometryNode(
        createMockEptGeometry(),
        dataProvider,
        new CdfModelIdentifier(10, 20),
        { fileData: {} as Partial<EptJson> as EptJson },
        undefined
      );

      await node.loadHierarchy();

      const children = node.getChildren();
      expect(children.map(c => c.numPoints).sort((a, b) => a - b)).toEqual([5, 10]);
    });
  });
});
