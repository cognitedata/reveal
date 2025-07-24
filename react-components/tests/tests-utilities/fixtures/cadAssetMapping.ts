import { DmsUniqueIdentifier } from '../../../src';
import { type ClassicCadAssetMapping } from '../../../src/components/CacheProvider/cad/assetMappingTypes';
import { RawCdfCadAssetMappingDmInstance } from '../../../src/components/CacheProvider/cad/rawAssetMappingTypes';

export function createAssetMappingMock(params?: { assetId?: number }): ClassicCadAssetMapping {
  return {
    assetId: params?.assetId ?? 1,
    nodeId: Math.random(),
    treeIndex: Math.random(),
    subtreeSize: 1
  };
}

export function createRawDmHybridAssetMappingMock(params: {
  assetInstanceId: DmsUniqueIdentifier;
}): RawCdfCadAssetMappingDmInstance {
  return {
    assetInstanceId: params.assetInstanceId ?? {
      externalId: 'default-asset-mapping-instance-external-id',
      space: 'default-asset-mapping-instance-space'
    },
    nodeId: Math.random(),
    treeIndex: Math.random(),
    subtreeSize: 1
  };
}
