import type { Node3D, CogniteInternalId } from '@cognite/sdk';
import type { ModelWithAssetMappings } from '../../../hooks/cad/modelWithAssetMappings';
import type { ModelId, RevisionId, AssetId } from '../types';
import type { ClassicCadAssetTreeIndexMapping, ClassicCadAssetMapping } from './assetMappingTypes';

export type ClassicCadNodeAssetMappingResult = {
  node?: Node3D;
  mappings: ClassicCadAssetMapping[];
};

export type ClassicCadAssetMappingCache = {
  getAssetMappingsForLowestAncestor: (
    modelId: ModelId,
    revisionId: RevisionId,
    ancestors: Node3D[]
  ) => Promise<ClassicCadNodeAssetMappingResult>;
  getNodesForAssetIds: (
    modelId: ModelId,
    revisionId: RevisionId,
    assetIds: CogniteInternalId[]
  ) => Promise<Map<AssetId, Node3D[]>>;
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
  ) => Promise<ClassicCadAssetTreeIndexMapping[]>;
};
