import { type Asset } from '@cognite/sdk';
import { Mock } from 'moq.ts';
import { type AssetProperties } from '../../../src/data-providers/core-dm-provider/utils/filters';
import { type ExternalIdsResultList, type NodeItem } from '../../../src/data-providers/FdmSDK';

export function createAssetMock(id: number, name?: string, description?: string): Asset {
  return new Mock<Asset>()
    .setup((p) => p.id)
    .returns(id)
    .setup((p) => p.name)
    .returns(name ?? `asset-${id}`)
    .setup((p) => p.description)
    .returns(description)
    .setup((p) => p.parentId)
    .returns(0)
    .setup((p) => p.createdTime)
    .returns(new Date())
    .setup((p) => p.lastUpdatedTime)
    .returns(new Date())
    .setup((p) => p.rootId)
    .returns(0)
    .setup((p) => p.externalId)
    .returns('external-id-123')
    .setup((p) => p.metadata)
    .returns({ key: 'value' })
    .setup((p) => p.source)
    .returns('source')
    .setup((p) => p.dataSetId)
    .returns(0)
    .setup((p) => p.labels)
    .returns([])
    .object();
}

export function createDMAssetMock(externalId: string): ExternalIdsResultList<AssetProperties> {
  const nodeItem: NodeItem<AssetProperties> = {
    instanceType: 'node',
    version: 0,
    space: 'asset-space',
    externalId,
    createdTime: 123456,
    lastUpdatedTime: 987654,
    properties: {
      cdf_cdm: {
        'CogniteAsset/v1': {
          name: 'asset-1',
          object3D: {
            externalId: 'object3d-external-id-1',
            space: 'object3d-space-1'
          },
          description: 'asset-1'
        }
      }
    }
  };

  return {
    items: [nodeItem],
    typing: {}
  };
}
