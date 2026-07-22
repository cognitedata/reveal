/*!
 * Copyright 2026 Cognite AS
 */

import { vi } from 'vitest';
import { PointCloudEptGeometryNode } from './PointCloudEptGeometryNode';
import type { ModelDataProvider } from '@reveal/data-providers';
import { CdfModelIdentifier } from '@reveal/data-providers';
import { HttpError } from '@cognite/sdk';
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

const SIGNED_FILES_BASE_URL = 'https://signed.example.com';
const ROOT_BINARY_NAME = '0-0-0-0';
const ROOT_BINARY_DOMAIN_URL = 'https://cognite.example.com';
const EPT_HIERARCHY_BASE = 'ept-hierarchy';

describe(PointCloudEptGeometryNode.name, () => {
  describe('constructor — signedUrl resolution from eptMetadata', () => {
    const exactUrl = `${ROOT_BINARY_DOMAIN_URL}/${ROOT_BINARY_NAME}.bin`;
    const subPathUrl = `${ROOT_BINARY_DOMAIN_URL}/sub/${ROOT_BINARY_NAME}.bin`;

    test.each<
      [string, MetadataWithSignedFiles<EptJson> | { fileData: EptJson }, string | undefined, string | undefined]
    >([
      [
        'exact match',
        makeMetadata([{ fileName: '0-0-0-0.bin', signedUrl: exactUrl }]),
        SIGNED_FILES_BASE_URL,
        exactUrl
      ],
      [
        'subPath match',
        makeMetadata([{ fileName: 'sub/0-0-0-0.bin', signedUrl: subPathUrl }]),
        SIGNED_FILES_BASE_URL,
        subPathUrl
      ],
      [
        'missing from signed files',
        makeMetadata([{ fileName: 'other.bin', signedUrl: `${ROOT_BINARY_DOMAIN_URL}/other.bin` }]),
        SIGNED_FILES_BASE_URL,
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
    const hierarchySignedUrl = `${ROOT_BINARY_DOMAIN_URL}/${EPT_HIERARCHY_BASE}/${ROOT_BINARY_NAME}.json`;
    const fileName = `${ROOT_BINARY_NAME}.json`;
    const filePath = `${EPT_HIERARCHY_BASE}/${fileName}`;

    test('DM model uses getJsonFile with empty baseUrl on cache hit', async () => {
      const dataProvider = createMockModelDataProvider({
        getJsonFile: vi.fn(async () => ({})) as ModelDataProvider['getJsonFile']
      });
      const node = new PointCloudEptGeometryNode(
        createMockEptGeometry(),
        dataProvider,
        mockDMModelIdentifier,
        makeMetadata([{ fileName: filePath, signedUrl: hierarchySignedUrl }]),
        SIGNED_FILES_BASE_URL
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
        SIGNED_FILES_BASE_URL
      );

      await node.getHierarchy(fileName);

      expect(dataProvider.getFileUrlsForModel).toHaveBeenCalledWith(
        SIGNED_FILES_BASE_URL,
        mockDMModelIdentifier,
        filePath
      );
      expect(dataProvider.getJsonFile).toHaveBeenCalledWith('', hierarchySignedUrl);
    });

    test('DM model with an expired cached signedUrl refreshes, retries, and updates the shared signedFiles list', async () => {
      const freshUrl = `${ROOT_BINARY_DOMAIN_URL}/${EPT_HIERARCHY_BASE}/${ROOT_BINARY_NAME}-fresh.json`;
      const metadata = makeMetadata([{ fileName: filePath, signedUrl: hierarchySignedUrl }]);
      const getJsonFileMock = vi
        .fn<ModelDataProvider['getJsonFile']>()
        .mockRejectedValueOnce(new HttpError(403, { error: { code: 403, message: 'Forbidden' } }, {}))
        .mockResolvedValueOnce({});
      const dataProvider = createMockModelDataProvider({
        getJsonFile: getJsonFileMock,
        getFileUrlsForModel: vi.fn<NonNullable<ModelDataProvider['getFileUrlsForModel']>>(async () => [
          { fileName: filePath, signedUrl: freshUrl, subPath: '' }
        ])
      });
      const node = new PointCloudEptGeometryNode(
        createMockEptGeometry(),
        dataProvider,
        mockDMModelIdentifier,
        metadata,
        SIGNED_FILES_BASE_URL
      );

      await node.getHierarchy(fileName);

      expect(getJsonFileMock).toHaveBeenLastCalledWith('', freshUrl);
      expect(metadata.signedFiles!.items.find(i => i.fileName === filePath)?.signedUrl).toBe(freshUrl);
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

      expect(dataProvider.getJsonFile).toHaveBeenCalledWith(
        `https://example.com/model/${EPT_HIERARCHY_BASE}`,
        `${ROOT_BINARY_NAME}.json`
      );
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
        SIGNED_FILES_BASE_URL
      );

      await expect(node.getHierarchy(fileName)).rejects.toThrow(expectedMessage);
    });
  });

  describe('findBinarySignedUrlInPreload: cache invalidation by items.length', () => {
    const rootBinaryUrl = `${ROOT_BINARY_DOMAIN_URL}/${ROOT_BINARY_NAME}.bin`;

    function createNode(metadata: MetadataWithSignedFiles<EptJson>) {
      return new PointCloudEptGeometryNode(
        createMockEptGeometry(),
        createMockModelDataProvider(),
        mockDMModelIdentifier,
        metadata,
        SIGNED_FILES_BASE_URL
      );
    }

    test.each<[string, { fileName: string; signedUrl: string }[]]>([
      ['empty', []],
      ['partial (root binary missing)', [{ fileName: 'other.bin', signedUrl: `${ROOT_BINARY_DOMAIN_URL}/other.bin` }]]
    ])('rebuilds the map when items grow after construction (starting %s)', (_, initialItems) => {
      const metadata = makeMetadata(initialItems);
      const node = createNode(metadata);

      expect(node.findBinarySignedUrlInPreload()).toBeUndefined();

      metadata.signedFiles!.items.push({ fileName: `${ROOT_BINARY_NAME}.bin`, signedUrl: rootBinaryUrl, subPath: '' });

      expect(node.findBinarySignedUrlInPreload()).toBe(rootBinaryUrl);
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
