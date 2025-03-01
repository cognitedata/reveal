/*!
 * Copyright 2025 Cognite AS
 */
import { describe, expect, it } from 'vitest';
import { listMappedFdmNodes } from './listMappedFdmNodes';
import { Mock, It } from 'moq.ts';
import { type DmsUniqueIdentifier, type FdmSDK } from '../FdmSDK';
import { type cadAndPointCloudAndImage36AssetQuery } from './cadAndPointCloudAndImage360AssetQuery';
import { isEqual } from 'lodash';

const modelIdentifier0 = { externalId: 'model0', space: 'space0' };
const modelIdentifier1 = { externalId: 'model1', space: 'space0' };
const modelIdentifier2 = { externalId: 'model2', space: 'space0' };

const object3dIdentifier = { externalId: 'object3d_0', space: 'space0' };
const assetNode0 = {
  externalId: 'asset0',
  space: 'space0',
  instanceType: 'node' as const,
  version: 1,
  createdTime: 9000,
  lastUpdatedTime: 900,
  properties: { cdf_cdm: { 'CogniteAsset/v1': { object3D: object3dIdentifier } } }
};

const assetNode1 = {
  externalId: 'asset1',
  space: 'space0',
  instanceType: 'node' as const,
  version: 1,
  createdTime: 9000,
  lastUpdatedTime: 900,
  properties: { cdf_cdm: { 'CogniteAsset/v1': { object3D: object3dIdentifier } } }
};

const assetNode2 = {
  externalId: 'asset2',
  space: 'space0',
  instanceType: 'node' as const,
  version: 1,
  createdTime: 9000,
  lastUpdatedTime: 900,
  properties: { cdf_cdm: { 'CogniteAsset/v1': { object3D: object3dIdentifier } } }
};

describe(listMappedFdmNodes.name, () => {
  it('lists nothing when no revisions are input', async () => {
    const fdmSdkMock = new Mock<FdmSDK>();

    const result = await listMappedFdmNodes([], [], undefined, 1000, fdmSdkMock.object());
    expect(result).toHaveLength(0);
  });

  it('lists nothing when network request returns empty result', async () => {
    const fdmSdkMock = new Mock<FdmSDK>()
      .setup(async (p) => await p.queryNodesAndEdges(It.IsAny()))
      .returns(
        Promise.resolve({ items: { cad_assets: [], pointcloud_assets: [], image360_assets: [] } })
      )
      .object();

    const result = await listMappedFdmNodes([modelIdentifier0], [], undefined, 1000, fdmSdkMock);

    expect(result).toHaveLength(0);
  });

  it('sends model identifiers in query, and correctly returns all results', async () => {
    const fdmSdkMock = new Mock<FdmSDK>()
      .setup(
        async (p) =>
          await p.queryNodesAndEdges(
            It.Is(
              (
                query: ReturnType<typeof cadAndPointCloudAndImage36AssetQuery> & {
                  parameters: { revisionRefs: DmsUniqueIdentifier[] };
                }
              ) =>
                isEqual(query.parameters.revisionRefs, [
                  modelIdentifier0,
                  modelIdentifier1,
                  modelIdentifier2
                ])
            )
          )
      )
      .returns(
        Promise.resolve({
          items: {
            cad_assets: [assetNode0],
            pointcloud_assets: [assetNode1],
            image360_assets: [assetNode2]
          }
        })
      )
      .object();

    const result = await listMappedFdmNodes(
      [modelIdentifier0, modelIdentifier1, modelIdentifier2],
      [],
      undefined,
      1000,
      fdmSdkMock
    );

    expect(result).toStrictEqual([assetNode0, assetNode1, assetNode2]);
  });
});
