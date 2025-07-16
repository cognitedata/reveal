import type { Node3D } from '@cognite/sdk';
import type { ModelWithAssetMappings } from '../../../hooks/cad/modelWithAssetMappings';
import type { AssetId, FdmKey, ModelId, RevisionId } from '../types';
import type { HybridCadAssetMapping, HybridCadAssetTreeIndexMapping } from './assetMappingTypes';
import type { InstanceId } from '../../../utilities/instanceIds';

export type HybridCadNodeAssetMappingResult = {
  node?: Node3D;
  mappings: HybridCadAssetMapping[];
};

export type ClassicCadAssetMappingCache = {
  getAssetMappingsForLowestAncestor: (
    modelId: ModelId,
    revisionId: RevisionId,
    ancestors: Node3D[]
  ) => Promise<HybridCadNodeAssetMappingResult>;
  getNodesForAssetIds: (
    modelId: ModelId,
    revisionId: RevisionId,
    instanceIds: InstanceId[]
  ) => Promise<Map<FdmKey | AssetId, Node3D[]>>;
  generateNode3DCachePerItem: (
    modelId: ModelId,
    revisionId: RevisionId,
    nodeIds: number[] | undefined
  ) => Promise<void>;
  generateAssetMappingsCachePerItemFromModelCache: (
    modelId: ModelId,
    revisionId: RevisionId,
    assetMappingsPerModel: ModelWithAssetMappings[] | undefined
  ) => Promise<void>;
  getAssetMappingsForModel: (
    modelId: ModelId,
    revisionId: RevisionId
  ) => Promise<HybridCadAssetTreeIndexMapping[]>;
};
