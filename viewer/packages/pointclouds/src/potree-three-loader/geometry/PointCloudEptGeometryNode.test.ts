/*!
 * Copyright 2026 Cognite AS
 */

import { vi } from 'vitest';
import { Box3, Vector3 } from 'three';
import { Mock } from 'moq.ts';
import { PointCloudEptGeometryNode } from './PointCloudEptGeometryNode';
import type { PointCloudEptGeometry } from './PointCloudEptGeometry';
import type { EptBinaryLoader } from '../loading/EptBinaryLoader';
import type { ModelDataProvider } from '@reveal/data-providers';
import { CdfModelIdentifier, DMModelIdentifier } from '@reveal/data-providers';
import type { PointCloudMetadataWithSignedFiles } from '../../types';
import type { EptJson } from '../loading/EptJson';

const TEST_BOX = new Box3(new Vector3(0, 0, 0), new Vector3(100, 100, 100));

function createMockEpt(url = 'https://example.com/model/'): PointCloudEptGeometry {
  const mockLoader = new Mock<EptBinaryLoader>()
    .setup(l => l.extension())
    .returns('.bin')
    .object();
  return new Mock<PointCloudEptGeometry>()
    .setup(e => e.boundingBox)
    .returns(TEST_BOX)
    .setup(e => e.loader)
    .returns(mockLoader)
    .setup(e => e.spacing)
    .returns(1)
    .setup(e => e.url)
    .returns(url)
    .object();
}

function createMockDataProvider(overrides: Partial<ModelDataProvider> = {}): ModelDataProvider {
  return {
    getBinaryFile: vi.fn<ModelDataProvider['getBinaryFile']>(),
    getJsonFile: vi.fn<ModelDataProvider['getJsonFile']>(async () => ({})),
    getDMSJsonFile: vi.fn<ModelDataProvider['getDMSJsonFile']>(),
    ...overrides
  };
}

const dmIdentifier = new DMModelIdentifier({
  modelId: 1,
  revisionId: 2,
  revisionExternalId: 'ext-id',
  revisionSpace: 'my-space'
});

function makeMetadata(items: { fileName: string; signedUrl: string }[]): PointCloudMetadataWithSignedFiles {
  return {
    type: 'pointCloudMetadataWithSignedFiles',
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
        createMockDataProvider(),
        dmIdentifier,
        makeMetadata([{ fileName: '0-0-0-0.bin', signedUrl: exactUrl }]),
        'https://signed.example.com'
      );
      expect(nodeExact.signedUrl).toBe(exactUrl);

      const nodeSubPath = new PointCloudEptGeometryNode(
        createMockEpt(),
        createMockDataProvider(),
        dmIdentifier,
        makeMetadata([{ fileName: 'sub/0-0-0-0.bin', signedUrl: subPathUrl }]),
        'https://signed.example.com'
      );
      expect(nodeSubPath.signedUrl).toBe(subPathUrl);

      const nodeMissing = new PointCloudEptGeometryNode(
        createMockEpt(),
        createMockDataProvider(),
        dmIdentifier,
        makeMetadata([{ fileName: 'other.bin', signedUrl: 'https://cdn.example.com/other.bin' }]),
        'https://signed.example.com'
      );
      expect(nodeMissing.signedUrl).toBeUndefined();

      const nodeNoMetadata = new PointCloudEptGeometryNode(
        createMockEpt(),
        createMockDataProvider(),
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

      const dataProviderHit = createMockDataProvider({
        getJsonFile: vi.fn<ModelDataProvider['getJsonFile']>(async () => ({}))
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

      const dataProviderMiss = createMockDataProvider({
        getDMSJsonFile: vi.fn<ModelDataProvider['getDMSJsonFile']>(async () => ({
          items: [{ fileName: filePath, signedUrl: hierarchySignedUrl, subPath: '' }]
        })),
        getJsonFile: vi.fn<ModelDataProvider['getJsonFile']>(async () => ({}))
      });
      const nodeMiss = new PointCloudEptGeometryNode(
        createMockEpt(),
        dataProviderMiss,
        dmIdentifier,
        makeMetadata([]),
        signedFilesBaseUrl
      );
      await nodeMiss.getHierarchy('0-0-0-0.json');
      expect(dataProviderMiss.getDMSJsonFile).toHaveBeenCalledWith(signedFilesBaseUrl, dmIdentifier, filePath);
      expect(dataProviderMiss.getJsonFile).toHaveBeenCalledWith('', hierarchySignedUrl);
    });

    test('classic model uses getJsonFile with ept-hierarchy base URL', async () => {
      const dataProvider = createMockDataProvider({
        getJsonFile: vi.fn<ModelDataProvider['getJsonFile']>(async () => ({}))
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
  });
});
