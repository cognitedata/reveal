/*!
 * Copyright 2025 Cognite AS
 */
import { describe, expect, it } from 'vitest';
import {
  listMappedFdmNodes,
  queryCadAssets,
  queryPointCloudsAssets,
  queryImage360Assets,
  listAllMappedFdmNodes
} from './listMappedFdmNodes';
import { Mock, It } from 'moq.ts';
import { type DmsUniqueIdentifier, type FdmSDK } from '../FdmSDK';
import { COGNITE_ASSET_SOURCE, COGNITE_CAD_NODE_SOURCE } from './dataModels';
import { simpleSourcesFixtures } from '#test-utils/fixtures/dm/sources';
import {
  cadNodesFixtures,
  object3dIdentifierFixture
} from '../../../tests/tests-utilities/fixtures/dm/nodeItems';
import { type QueryResult, type SelectSourceWithParams } from '../utils/queryNodesAndEdges';

const assetNode0 = {
  externalId: 'asset0',
  space: 'space0',
  instanceType: 'node' as const,
  version: 1,
  createdTime: 9000,
  lastUpdatedTime: 900,
  properties: { cdf_cdm: { 'CogniteAsset/v1': { object3D: object3dIdentifierFixture } } }
};

const assetNode1 = {
  externalId: 'asset1',
  space: 'space0',
  instanceType: 'node' as const,
  version: 1,
  createdTime: 9000,
  lastUpdatedTime: 900,
  properties: { cdf_cdm: { 'CogniteAsset/v1': { object3D: object3dIdentifierFixture } } }
};

const assetNode2 = {
  externalId: 'asset2',
  space: 'space0',
  instanceType: 'node' as const,
  version: 1,
  createdTime: 9000,
  lastUpdatedTime: 900,
  properties: { cdf_cdm: { 'CogniteAsset/v1': { object3D: object3dIdentifierFixture } } }
};

const revisionRefs: DmsUniqueIdentifier[] = [
  { externalId: 'revisionExternalId1', space: 'space1' },
  { externalId: 'revisionExternalId2', space: 'space1' }
];

describe(listMappedFdmNodes.name, async () => {
  it('returns empty array when no revisions are provided', async () => {
    const fdmSdkMock = new Mock<FdmSDK>();

    const result = await listMappedFdmNodes([], [], undefined, 1000, fdmSdkMock.object());
    expect(result).toHaveLength(0);
  });

  it('lists nothing when network request returns empty result', async () => {
    const resultData = Promise.resolve({
      items: { cad_nodes: [], cad_assets: [], pointcloud_assets: [], image360_assets: [] }
    });

    const fdmSdkMock = new Mock<FdmSDK>()
      .setup(async (p) => await p.queryAllNodesAndEdges(It.IsAny(), It.IsAny()))
      .returns(resultData)
      .object();

    const result = await listMappedFdmNodes(
      revisionRefs,
      simpleSourcesFixtures,
      undefined,
      1000,
      fdmSdkMock
    );

    expect(result).toHaveLength(0);
  });

  it('lists all mapped FDM nodes correctly', async () => {
    const fdmSdkMock = new Mock<FdmSDK>()
      .setup(async (p) => await p.queryAllNodesAndEdges(It.IsAny(), It.IsAny()))
      .returns(
        Promise.resolve({
          items: {
            cad_nodes: cadNodesFixtures,
            cad_assets: [assetNode0],
            pointcloud_assets: [assetNode1],
            image360_assets: [assetNode2]
          }
        })
      )
      .object();

    const result = await listAllMappedFdmNodes(
      revisionRefs,
      [COGNITE_ASSET_SOURCE],
      undefined,
      fdmSdkMock
    );

    expect(result).toStrictEqual([assetNode0, assetNode1, assetNode2]);
  });

  it('queries CAD assets correctly', async () => {
    const queryReturnMock = {
      items: {
        cad_assets: [assetNode0],
        cad_nodes: [
          {
            properties: {
              [COGNITE_CAD_NODE_SOURCE.space]: {
                [`${COGNITE_CAD_NODE_SOURCE.externalId}/${COGNITE_CAD_NODE_SOURCE.version}`]: {
                  object3D: object3dIdentifierFixture
                }
              }
            }
          }
        ]
      }
    } as unknown as QueryResult<any, SelectSourceWithParams>;

    const fdmSdkMock = new Mock<FdmSDK>()
      .setup(async (p) => await p.queryAllNodesAndEdges(It.IsAny(), It.IsAny()))
      .returns(Promise.resolve(queryReturnMock))
      .object();

    const result = await queryCadAssets(
      [COGNITE_ASSET_SOURCE],
      revisionRefs,
      undefined,
      fdmSdkMock,
      1000
    );

    expect(result).toStrictEqual([assetNode0]);
  });

  it('queries PointCloud assets correctly', async () => {
    const fdmSdkMock = new Mock<FdmSDK>()
      .setup(async (p) => await p.queryAllNodesAndEdges(It.IsAny(), It.IsAny()))
      .returns(
        Promise.resolve({
          items: {
            pointcloud_assets: [assetNode1]
          }
        })
      )
      .object();

    const result = await queryPointCloudsAssets(
      [COGNITE_ASSET_SOURCE],
      revisionRefs,
      undefined,
      fdmSdkMock,
      1000
    );

    expect(result).toStrictEqual([assetNode1]);
  });

  it('queries Image360 assets correctly', async () => {
    const fdmSdkMock = new Mock<FdmSDK>()
      .setup(async (p) => await p.queryAllNodesAndEdges(It.IsAny(), It.IsAny()))
      .returns(
        Promise.resolve({
          items: {
            image360_assets: [assetNode2]
          }
        })
      )
      .object();

    const result = await queryImage360Assets(
      [COGNITE_ASSET_SOURCE],
      revisionRefs,
      undefined,
      fdmSdkMock,
      1000
    );

    expect(result).toStrictEqual([assetNode2]);
  });
});
