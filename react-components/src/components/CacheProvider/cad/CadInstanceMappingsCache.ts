import type { Node3D } from '@cognite/sdk';
import type { ModelRevisionKey, ModelRevisionId, CadNodeIdData } from '../types';
import type { InstanceId, InstanceKey } from '../../../utilities/instanceIds';

export type CadModelMappingsWithNodes = Map<ModelRevisionKey, Map<InstanceKey, Node3D[]>>;

export type CadModelMappings = Map<ModelRevisionKey, Map<InstanceKey, CadNodeIdData[]>>;

export type CadInstanceMappingsCache = {
  getMappingsForModelsAndInstances: (
    instances: InstanceId[],
    models: ModelRevisionId[]
  ) => Promise<CadModelMappingsWithNodes>;
  getAllModelMappings: (models: ModelRevisionId[]) => Promise<CadModelMappings>;
};
