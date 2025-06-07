import { type CdfAssetMapping } from '../../../src/components/CacheProvider/types';

export function createAssetMappingMock(params?: { assetId?: number }): CdfAssetMapping {
  return {
    assetId: params?.assetId ?? 1,
    nodeId: Math.random(),
    treeIndex: Math.random(),
    subtreeSize: 1
  };
}
