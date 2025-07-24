import { DmsUniqueIdentifier } from '../../../src';
import { type ClassicCadAssetMapping } from '../../../src/components/CacheProvider/cad/assetMappingTypes';
import { RawCdfHybridDmCadAssetMapping } from '../../../src/components/CacheProvider/cad/rawAssetMappingTypes';

let globalIdCounter = 0;

export function createAssetMappingMock(params?: { assetId?: number }): ClassicCadAssetMapping {
  return {
    assetId: params?.assetId ?? 1,
    nodeId: globalIdCounter++,
    treeIndex: globalIdCounter++,
    subtreeSize: 1
  };
}

export function createRawDmHybridAssetMappingMock(params: {
  assetInstanceId?: DmsUniqueIdentifier;
}): RawCdfHybridDmCadAssetMapping {
  return {
    assetInstanceId: params.assetInstanceId ?? {
      externalId: `default-asset-mapping-external-id-${globalIdCounter++}`,
      space: `default-asset-mapping-space-${globalIdCounter}`
    },
    nodeId: globalIdCounter++,
    treeIndex: globalIdCounter++,
    subtreeSize: 1
  };
}
