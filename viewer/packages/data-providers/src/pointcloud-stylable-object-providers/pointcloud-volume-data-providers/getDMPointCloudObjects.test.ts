/*!
 * Copyright 2024 Cognite AS
 */

import { Mock, It } from 'moq.ts';
import { DataModelsSdk } from '../../DataModelsSdk';
import { getDMPointCloudObjects } from './getDMPointCloudObjects';
import { CdfDMPointCloudVolumeQuery } from './getDMPointCloudVolumeCollectionQuery';
import { QueryNextCursors } from '../../types';
import { isVolumeDMReference } from '../types';
import type { DMInstanceRef } from '@reveal/utilities';

const VOLUME_LIMIT = 1000;
const PAGE1_SIZE = 1000;
const PAGE2_SIZE = 500;
const TOTAL_VOLUMES = PAGE1_SIZE + PAGE2_SIZE;

/** Mock DMS response shape used by getDMPointCloudObjects (allows volume: number[]). */
type MockPointCloudVolume = {
  instanceType: 'node';
  version: number;
  space: string;
  externalId: string;
  createdTime: number;
  lastUpdatedTime: number;
  properties: {
    cdf_cdm: {
      'CognitePointCloudVolume/v1': {
        revisions: unknown[];
        volumeReferences: unknown[];
        volumeType: string;
        volume: number[];
        object3D: DMInstanceRef;
      };
    };
  };
};

/** Mock DMS response shape for assets. */
type MockAsset = {
  instanceType: 'node';
  version: number;
  space: string;
  externalId: string;
  createdTime: number;
  lastUpdatedTime: number;
  properties: {
    cdf_cdm: {
      'CogniteAsset/v1': {
        name: string;
        description: string;
        object3D: DMInstanceRef;
      };
    };
  };
};

/** Mock page result shape compatible with QueryResult for this query. */
type MockPageResult = {
  pointCloudVolumes: MockPointCloudVolume[];
  object3D: unknown[];
  assets: MockAsset[];
  nextCursor?: QueryNextCursors<CdfDMPointCloudVolumeQuery>;
};

function createVolume(index: number, page: number): MockPointCloudVolume {
  const id = page * VOLUME_LIMIT + index;
  const obj3dId = `obj3d_${id}`;
  return {
    instanceType: 'node',
    version: 1,
    space: 'test_space',
    externalId: `volume_${id}`,
    createdTime: 0,
    lastUpdatedTime: 0,
    properties: {
      cdf_cdm: {
        'CognitePointCloudVolume/v1': {
          revisions: [],
          volumeReferences: [],
          volumeType: 'Box',
          volume: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
          object3D: { externalId: obj3dId, space: 'objSpace' }
        }
      }
    }
  };
}

function createAsset(index: number, page: number): MockAsset {
  const id = page * VOLUME_LIMIT + index;
  const obj3dId = `obj3d_${id}`;
  return {
    instanceType: 'node',
    version: 1,
    space: 'test_space',
    externalId: `asset_${id}`,
    createdTime: 0,
    lastUpdatedTime: 0,
    properties: {
      cdf_cdm: {
        'CogniteAsset/v1': {
          name: `asset_${id}`,
          description: '',
          object3D: { externalId: obj3dId, space: 'objSpace' }
        }
      }
    }
  };
}

function createPage(pageNumber: number, size: number): MockPageResult {
  const volumes = Array.from({ length: size }, (_, i) => createVolume(i, pageNumber));
  const assets = Array.from({ length: size }, (_, i) => createAsset(i, pageNumber));
  const hasMore = pageNumber === 0 && size === VOLUME_LIMIT;
  const nextCursor: QueryNextCursors<CdfDMPointCloudVolumeQuery> | undefined = hasMore
    ? { pointCloudVolumes: 'cursor-page2', assets: 'cursor-assets' }
    : undefined;
  return {
    pointCloudVolumes: volumes,
    object3D: [],
    assets,
    ...(nextCursor !== undefined && { nextCursor })
  };
}

function createMisalignedPage2(): MockPageResult {
  const volumes = Array.from({ length: VOLUME_LIMIT }, (_, i) => createVolume(i, 1));
  const assets = [createAsset(0, 1)]; // only first volume has a matching asset
  return {
    pointCloudVolumes: volumes,
    object3D: [],
    assets
  };
}

const modelIdentifier = {
  revisionSpace: 'test_space',
  revisionExternalId: 'revision-1',
  modelId: 123,
  revisionId: 456
};

describe(getDMPointCloudObjects.name, () => {
  test('paginates using only pointCloudVolumes cursor and returns all volumes from multiple pages (fails if fix is reverted)', async () => {
    const page1 = createPage(0, PAGE1_SIZE);
    const page2 = createPage(1, PAGE2_SIZE);
    const misalignedPage2 = createMisalignedPage2();

    // Order matters: most specific first. When BOTH cursors are passed (buggy behavior),
    // DMS returns misaligned data -> we return misalignedPage2 so result would be ~1001.
    // When ONLY pointCloudVolumes cursor is passed (fix), we return page2 -> 1500 total.
    const dmsSdkMock = new Mock<DataModelsSdk>()
      .setup(m =>
        m.queryNodesAndEdges(
          It.IsAny(),
          It.Is<QueryNextCursors<CdfDMPointCloudVolumeQuery> | undefined>(
            (c): c is QueryNextCursors<CdfDMPointCloudVolumeQuery> =>
              c !== undefined && c.pointCloudVolumes !== undefined && c.assets !== undefined
          )
        )
      )
      .returns(Promise.resolve(misalignedPage2) as unknown as ReturnType<DataModelsSdk['queryNodesAndEdges']>)
      .setup(m =>
        m.queryNodesAndEdges(
          It.IsAny(),
          It.Is<QueryNextCursors<CdfDMPointCloudVolumeQuery> | undefined>(
            (c): c is QueryNextCursors<CdfDMPointCloudVolumeQuery> =>
              c !== undefined && c.pointCloudVolumes !== undefined
          )
        )
      )
      .returns(Promise.resolve(page2) as unknown as ReturnType<DataModelsSdk['queryNodesAndEdges']>)
      .setup(m =>
        m.queryNodesAndEdges(
          It.IsAny(),
          It.Is<QueryNextCursors<CdfDMPointCloudVolumeQuery> | undefined>(c => c === undefined)
        )
      )
      .returns(Promise.resolve(page1) as unknown as ReturnType<DataModelsSdk['queryNodesAndEdges']>);

    const result = await getDMPointCloudObjects(dmsSdkMock.object(), modelIdentifier);

    // With fix: we pass only pointCloudVolumes cursor -> get page2 (500 more) = 1500 total.
    // Without fix: we would pass both cursors -> get misalignedPage2 -> only 1001 total; this expect would fail.
    expect(result).toHaveLength(TOTAL_VOLUMES);
    const first = result[0];
    const fromSecondPage = result[PAGE1_SIZE];
    expect(first).toBeDefined();
    expect(fromSecondPage).toBeDefined();
    if (first && isVolumeDMReference(first.volumeMetadata)) {
      expect(first.volumeMetadata.instanceRef.externalId).toBe('volume_0');
      expect(first.volumeMetadata.asset?.externalId).toBe('asset_0');
    }
    if (fromSecondPage && isVolumeDMReference(fromSecondPage.volumeMetadata)) {
      expect(fromSecondPage.volumeMetadata.instanceRef.externalId).toBe('volume_1000');
      expect(fromSecondPage.volumeMetadata.asset?.externalId).toBe('asset_1000');
    }
  });

  test('single page returns all annotations without pagination', async () => {
    const singlePageSize = 100;
    const singlePage = createPage(0, singlePageSize);

    const dmsSdkMock = new Mock<DataModelsSdk>()
      .setup(m => m.queryNodesAndEdges(It.IsAny(), It.IsAny()))
      .returns(Promise.resolve(singlePage) as unknown as ReturnType<DataModelsSdk['queryNodesAndEdges']>);

    const result = await getDMPointCloudObjects(dmsSdkMock.object(), modelIdentifier);

    expect(result).toHaveLength(singlePageSize);
  });
});
