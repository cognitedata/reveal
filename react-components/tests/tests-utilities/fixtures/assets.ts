import { type Asset } from '@cognite/sdk';
import { type AssetProperties } from '../../../src/data-providers/core-dm-provider/utils/filters';
import { FdmNode, type ExternalIdsResultList, type NodeItem } from '../../../src/data-providers/FdmSDK';

const fixedDate = new Date('2025-01-01T00:00:00.000Z');

export function createAssetMock(id: number, name?: string, description?: string): Asset {
  return {
    id,
    name: name ?? `asset-${id}`,
    description: description ?? `asset-${id}`,
    parentId: 0,
    createdTime: fixedDate,
    lastUpdatedTime: fixedDate,
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

export function createFdmNodeItem(
  id: { externalId: string; space: string },
): FdmNode<AssetProperties> {
  return {
    instanceType: 'node',
    version: 0,
    space: id.space,
    externalId: id.externalId,
    createdTime: 0,
    lastUpdatedTime: 0,
    properties: {
      object3D: {
        space: id.space,
        externalId: `${id.externalId}-object3D`
      },
      name: '',
      description: ''
    }
  };
}
