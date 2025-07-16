import { type ClassicCadAssetMapping } from '../../../src/components/CacheProvider/cad/assetMappingTypes';

export function createAssetMappingMock(params?: { assetId?: number }): ClassicCadAssetMapping {
  return {
    assetId: params?.assetId ?? 1,
    nodeId: Math.random(),
    treeIndex: Math.random(),
    subtreeSize: 1
  };
}
