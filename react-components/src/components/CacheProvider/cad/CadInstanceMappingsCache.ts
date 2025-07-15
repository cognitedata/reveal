import type { Node3D } from '@cognite/sdk';
import type { DmsUniqueIdentifier } from '../../../data-providers';
import type {
  ModelRevisionKey,
  FdmKey,
  AssetId,
  ModelRevisionId,
  CadNodeIdData,
  CadNodeTreeData
} from '../types';
import type { InstanceKey } from '../../../utilities/instanceIds';

export type CadModelMappingsWithNodes = Map<ModelRevisionKey, Map<FdmKey | AssetId, Node3D[]>>;

export type CadModelMappings = Map<ModelRevisionKey, Map<FdmKey | AssetId, CadNodeIdData[]>>;
export type CadModelTreeIndexMappings = Map<ModelRevisionKey, Map<InstanceKey, CadNodeTreeData[]>>;

export type CadInstanceMappingsCache = {
  getMappingsForModelsAndInstances: (
    instances: Array<AssetId | DmsUniqueIdentifier>,
    models: ModelRevisionId[]
  ) => Promise<CadModelMappingsWithNodes>;
  getAllModelMappings: (models: ModelRevisionId[]) => Promise<CadModelTreeIndexMappings>;
};
