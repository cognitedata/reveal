import type { Node3D } from '@cognite/sdk';
import type { ModelWithAssetMappings } from '../../../hooks/cad/modelWithAssetMappings';
import type { ModelId, RevisionId } from '../types';
import type { HybridCadAssetMapping } from './assetMappingTypes';
import type { InstanceId, InstanceKey } from '../../../utilities/instanceIds';

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
  getNodesForInstanceIds: (
    modelId: ModelId,
    revisionId: RevisionId,
    instanceIds: InstanceId[]
  ) => Promise<Map<InstanceKey, Node3D[]>>;
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
  ) => Promise<HybridCadAssetMapping[]>;
};
