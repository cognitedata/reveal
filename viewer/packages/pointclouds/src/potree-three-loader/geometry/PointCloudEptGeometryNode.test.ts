/*!
 * Copyright 2026 Cognite AS
 */

import { vi } from 'vitest';
import { PointCloudEptGeometryNode } from './PointCloudEptGeometryNode';
import type { ModelDataProvider } from '@reveal/data-providers';
import { CdfModelIdentifier } from '@reveal/data-providers';
import type { MetadataWithSignedFiles } from '@reveal/data-providers/src/metadata-providers/types';
import type { EptJson } from '../loading/EptJson';
import { createMockModelDataProvider } from '../../../../../test-utilities/src/createMockModelDataProvider';
import { createMockEptGeometry as createMockEpt } from '../../../../../test-utilities/src/createMockEptGeometry';
import { mockDMModelIdentifier as dmIdentifier } from '../../../../../test-utilities/src/mockModelIdentifiers';

function makeMetadata(items: { fileName: string; signedUrl: string }[]): MetadataWithSignedFiles<EptJson> {
  return {
    signedFiles: { items: items.map(i => ({ ...i, subPath: '' })) },
    fileData: {} as Partial<EptJson> as EptJson
  };
}

describe(PointCloudEptGeometryNode.name, () => {
  describe('constructor — signedUrl resolution from eptMetadata', () => {
    test('resolves signedUrl by exact match, subPath match, missing, and no metadata', () => {
      const exactUrl = 'https://cdn.example.com/0-0-0-0.bin';
      const subPathUrl = 'https://cdn.example.com/sub/0-0-0-0.bin';

      const nodeExact = new PointCloudEptGeometryNode(
        createMockEpt(),
        createMockModelDataProvider(),
        dmIdentifier,
        makeMetadata([{ fileName: '0-0-0-0.bin', signedUrl: exactUrl }]),
        'https://signed.example.com'
      );
      expect(nodeExact.signedUrl).toBe(exactUrl);

      const nodeSubPath = new PointCloudEptGeometryNode(
        createMockEpt(),
        createMockModelDataProvider(),
        dmIdentifier,
        makeMetadata([{ fileName: 'sub/0-0-0-0.bin', signedUrl: subPathUrl }]),
        'https://signed.example.com'
      );
      expect(nodeSubPath.signedUrl).toBe(subPathUrl);

      const nodeMissing = new PointCloudEptGeometryNode(
        createMockEpt(),
        createMockModelDataProvider(),
        dmIdentifier,
        makeMetadata([{ fileName: 'other.bin', signedUrl: 'https://cdn.example.com/other.bin' }]),
        'https://signed.example.com'
      );
      expect(nodeMissing.signedUrl).toBeUndefined();

      const nodeNoMetadata = new PointCloudEptGeometryNode(
        createMockEpt(),
        createMockModelDataProvider(),
        dmIdentifier,
        { fileData: {} as Partial<EptJson> as EptJson },
        undefined
      );
      expect(nodeNoMetadata.signedUrl).toBeUndefined();
    });
  });

  describe('getHierarchy', () => {
    test('DM model uses getJsonFile with empty baseUrl on cache hit; getDMSJsonFile+getJsonFile on cache miss', async () => {
      const signedFilesBaseUrl = 'https://signed.example.com';
      const hierarchySignedUrl = 'https://cdn.example.com/ept-hierarchy/0-0-0-0.json';
      const filePath = 'ept-hierarchy/0-0-0-0.json';

      const dataProviderHit = createMockModelDataProvider({
        getJsonFile: vi.fn(async () => ({})) as ModelDataProvider['getJsonFile']
      });
      const nodeHit = new PointCloudEptGeometryNode(
        createMockEpt(),
        dataProviderHit,
        dmIdentifier,
        makeMetadata([{ fileName: filePath, signedUrl: hierarchySignedUrl }]),
        signedFilesBaseUrl
      );
      await nodeHit.getHierarchy('0-0-0-0.json');
      expect(dataProviderHit.getJsonFile).toHaveBeenCalledWith('', hierarchySignedUrl);

      const dataProviderMiss = createMockModelDataProvider({
        getFileUrlsForModel: vi.fn<NonNullable<ModelDataProvider['getFileUrlsForModel']>>(async () => [
          { fileName: filePath, signedUrl: hierarchySignedUrl, subPath: '' }
        ]),
        getJsonFile: vi.fn(async () => ({})) as ModelDataProvider['getJsonFile']
      });
      const nodeMiss = new PointCloudEptGeometryNode(
        createMockEpt(),
        dataProviderMiss,
        dmIdentifier,
        makeMetadata([]),
        signedFilesBaseUrl
      );
      await nodeMiss.getHierarchy('0-0-0-0.json');
      expect(dataProviderMiss.getFileUrlsForModel).toHaveBeenCalledWith(signedFilesBaseUrl, dmIdentifier, filePath);
      expect(dataProviderMiss.getJsonFile).toHaveBeenCalledWith('', hierarchySignedUrl);
    });

    test('classic model uses getJsonFile with ept-hierarchy base URL', async () => {
      const dataProvider = createMockModelDataProvider({
        getJsonFile: vi.fn(async () => ({})) as ModelDataProvider['getJsonFile']
      });
      const node = new PointCloudEptGeometryNode(
        createMockEpt(),
        dataProvider,
        new CdfModelIdentifier(10, 20),
        { fileData: {} as Partial<EptJson> as EptJson },
        undefined
      );

      await node.getHierarchy('0-0-0-0.json');

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
        createMockEpt(),
        createMockModelDataProvider(override),
        dmIdentifier,
        makeMetadata([]),
        'https://signed.example.com'
      );

      await expect(node.getHierarchy('0-0-0-0.json')).rejects.toThrow(expectedMessage);
    });
  });

  describe('loadHierarchy', () => {
    test('builds child nodes from the hierarchy response, keyed by depth/coordinates', async () => {
      const hierarchy = { '0-0-0-0': 100, '1-0-0-0': 10, '1-1-0-0': 5 };
      const dataProvider = createMockModelDataProvider({
        getJsonFile: vi.fn(async () => hierarchy) as ModelDataProvider['getJsonFile']
      });
      const node = new PointCloudEptGeometryNode(
        createMockEpt(),
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
