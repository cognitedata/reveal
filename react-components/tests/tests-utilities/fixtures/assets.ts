import { type Asset } from '@cognite/sdk';
import { type AssetProperties } from '../../../src/data-providers/core-dm-provider/utils/filters';
import { type ExternalIdsResultList, type NodeItem } from '../../../src/data-providers/FdmSDK';

export function createAssetMock(id: number, name?: string, description?: string): Asset {
  return {
    id,
    name: name ?? `asset-${id}`,
    description: description ?? `asset-${id}`,
    parentId: 0,
    createdTime: new Date(),
    lastUpdatedTime: new Date(),
    rootId: 0,
    externalId: 'external-id-123',
    metadata: { key: 'value' },
    source: 'source',
    dataSetId: 0,
    labels: []
  };
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
