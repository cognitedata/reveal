import type { Node3D } from '@cognite/sdk';
import type { ModelRevisionKey, ModelRevisionId, CadNodeIdData, CadNodeTreeData } from '../types';
import type { InstanceId, InstanceKey } from '../../../utilities/instanceIds';

export type CadModelMappingsWithNodes = Map<ModelRevisionKey, Map<InstanceKey, Node3D[]>>;

export type CadModelMappings = Map<ModelRevisionKey, Map<InstanceKey, CadNodeIdData[]>>;
export type CadModelTreeIndexMappings = Map<ModelRevisionKey, Map<InstanceKey, CadNodeTreeData[]>>;

export type CadInstanceMappingsCache = {
  getMappingsForModelsAndInstances: (
    instances: InstanceId[],
    models: ModelRevisionId[]
  ) => Promise<CadModelMappingsWithNodes>;
  getAllModelMappings: (models: ModelRevisionId[]) => Promise<CadModelTreeIndexMappings>;
};
