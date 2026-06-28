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
  const mockLoader = new Mock<EptBinaryLoader>().setup(l => l.extension()).returns('.bin').object();
  return new Mock<PointCloudEptGeometry>()
    .setup(e => e.boundingBox).returns(TEST_BOX)
    .setup(e => e.loader).returns(mockLoader)
    .setup(e => e.spacing).returns(1)
    .setup(e => e.url).returns(url)
    .object();
}

function createMockDataProvider(overrides: Partial<ModelDataProvider> = {}): ModelDataProvider {
  return {
    getBinaryFile: vi.fn<ModelDataProvider['getBinaryFile']>(),
    getJsonFile: vi.fn<ModelDataProvider['getJsonFile']>(async () => ({})),
    getSignedBinaryFile: vi.fn<ModelDataProvider['getSignedBinaryFile']>(),
    getSignedJsonFile: vi.fn<ModelDataProvider['getSignedJsonFile']>(async () => ({})),
    getDMSJsonFile: vi.fn<ModelDataProvider['getDMSJsonFile']>(),
    getDMSJsonFileFromFileName: vi.fn<ModelDataProvider['getDMSJsonFileFromFileName']>(async () => ({})),
    ...overrides
  };
}

const dmIdentifier = new DMModelIdentifier({
  modelId: 1,
  revisionId: 2,
  revisionExternalId: 'ext-id',
  revisionSpace: 'my-space'
});

const minimalEptJson: EptJson = {
  schema: [
    { name: 'X', type: 'float', size: 8, scale: 1, offset: 0 },
    { name: 'Y', type: 'float', size: 8, scale: 1, offset: 0 },
    { name: 'Z', type: 'float', size: 8, scale: 1, offset: 0 }
  ],
  bounds: [0, 0, 0, 100, 100, 100],
  boundsConforming: [0, 0, 0, 100, 100, 100],
  ticks: 128,
  dataType: 'binary'
};

function makeMetadata(items: { fileName: string; signedUrl: string }[]): PointCloudMetadataWithSignedFiles {
  return {
    type: 'pointCloudMetadataWithSignedFiles',
    signedFiles: { items: items.map(i => ({ ...i, subPath: '' })) },
    fileData: minimalEptJson
  };
}

describe(PointCloudEptGeometryNode.name, () => {
  describe('constructor — signedUrl resolution from eptMetadata', () => {
    test('resolves signedUrl by exact and subPath fileName match; undefined when not found', () => {
      const exactUrl = 'https://cdn.example.com/0-0-0-0.bin';
      const subPathUrl = 'https://cdn.example.com/sub/0-0-0-0.bin';

      const nodeExact = new PointCloudEptGeometryNode(
        createMockEpt(), createMockDataProvider(), dmIdentifier,
        makeMetadata([{ fileName: '0-0-0-0.bin', signedUrl: exactUrl }]),
        'https://signed.example.com'
      );
      expect(nodeExact.signedUrl).toBe(exactUrl);

      const nodeSubPath = new PointCloudEptGeometryNode(
        createMockEpt(), createMockDataProvider(), dmIdentifier,
        makeMetadata([{ fileName: 'sub/0-0-0-0.bin', signedUrl: subPathUrl }]),
        'https://signed.example.com'
      );
      expect(nodeSubPath.signedUrl).toBe(subPathUrl);

      const nodeMissing = new PointCloudEptGeometryNode(
        createMockEpt(), createMockDataProvider(), dmIdentifier,
        makeMetadata([{ fileName: 'other.bin', signedUrl: 'https://cdn.example.com/other.bin' }]),
        'https://signed.example.com'
      );
      expect(nodeMissing.signedUrl).toBeUndefined();
    });

    test('signedUrl is undefined when metadata has no signedFiles property', () => {
      const node = new PointCloudEptGeometryNode(
        createMockEpt(), createMockDataProvider(), dmIdentifier,
        { fileData: minimalEptJson }, undefined
      );
      expect(node.signedUrl).toBeUndefined();
    });
  });

  describe('getHierarchy', () => {
    test('DM model uses getSignedJsonFile on cache hit or getDMSJsonFileFromFileName on cache miss', async () => {
      const signedFilesBaseUrl = 'https://signed.example.com';
      const hierarchySignedUrl = 'https://cdn.example.com/ept-hierarchy/0-0-0-0.json';

      const dataProviderHit = createMockDataProvider({ getSignedJsonFile: vi.fn<ModelDataProvider['getSignedJsonFile']>(async () => ({})) });
      const nodeHit = new PointCloudEptGeometryNode(
        createMockEpt(), dataProviderHit, dmIdentifier,
        makeMetadata([{ fileName: 'ept-hierarchy/0-0-0-0.json', signedUrl: hierarchySignedUrl }]),
        signedFilesBaseUrl
      );
      await nodeHit.getHierarchy('0-0-0-0.json');
      expect(dataProviderHit.getSignedJsonFile).toHaveBeenCalledWith(hierarchySignedUrl);

      const dataProviderMiss = createMockDataProvider({ getDMSJsonFileFromFileName: vi.fn<ModelDataProvider['getDMSJsonFileFromFileName']>(async () => ({})) });
      const nodeMiss = new PointCloudEptGeometryNode(
        createMockEpt(), dataProviderMiss, dmIdentifier,
        makeMetadata([]),
        signedFilesBaseUrl
      );
      await nodeMiss.getHierarchy('0-0-0-0.json');
      expect(dataProviderMiss.getDMSJsonFileFromFileName).toHaveBeenCalledWith(
        signedFilesBaseUrl, dmIdentifier, 'ept-hierarchy/0-0-0-0.json'
      );
    });

    test('classic model uses getJsonFile with ept-hierarchy base URL', async () => {
      const eptUrl = 'https://example.com/model/';
      const dataProvider = createMockDataProvider({ getJsonFile: vi.fn<ModelDataProvider['getJsonFile']>(async () => ({})) });
      const node = new PointCloudEptGeometryNode(
        createMockEpt(eptUrl), dataProvider,
        new CdfModelIdentifier(10, 20),
        { fileData: minimalEptJson }, undefined
      );

      await node.getHierarchy('0-0-0-0.json');

      expect(dataProvider.getJsonFile).toHaveBeenCalledWith(`${eptUrl}ept-hierarchy`, '0-0-0-0.json');
    });
  });
});
