import { type Asset } from '@cognite/sdk';
import { Mock } from 'moq.ts';
import { type AssetProperties } from '../../../src/data-providers/core-dm-provider/utils/filters';
import { type FdmNode } from '../../../src/data-providers/FdmSDK';

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

export function createDMAssetMock(externalId: string, space: string): FdmNode<AssetProperties> {
  return new Mock<FdmNode<AssetProperties>>()
    .setup((p) => p.externalId)
    .returns(externalId)
    .setup((p) => p.space)
    .returns(space)
    .setup((p) => p.createdTime)
    .returns(new Date())
    .setup((p) => p.lastUpdatedTime)
    .returns(new Date())
    .setup((p) => p.instanceType)
    .returns('node')
    .setup((p) => p.properties)
    .returns({
      name: 'name',
      description: 'description',
      object3D: { id: 1, type: 'object3D' }
    })
    .object();
}
