import type { Node3D } from '@cognite/sdk';
import type { DmsUniqueIdentifier } from '../../../data-providers';
import type { ModelRevisionKey, FdmKey, AssetId, ModelRevisionId } from '../types';

export type CadModelMappings = Map<ModelRevisionKey, Map<FdmKey | AssetId, Node3D[]>>;

export type CadInstanceMappingsCache = {
  getMappingsForModelsAndInstances: (
    instances: Array<AssetId | DmsUniqueIdentifier>,
    models: ModelRevisionId[]
  ) => Promise<CadModelMappings>;
};
