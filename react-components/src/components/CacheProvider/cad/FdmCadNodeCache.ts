import { type DmsUniqueIdentifier } from '../../../data-providers';
import { type ThreeDModelFdmMappings } from '../../../hooks';
import {
  type FdmNodeDataPromises,
  type ModelRevisionId,
  type ModelRevisionToConnectionMap
} from '../types';

export type FdmCadNodeCache = {
  getMappingsForFdmInstances: (
    instances: DmsUniqueIdentifier[],
    modelRevisionIds: ModelRevisionId[]
  ) => Promise<ThreeDModelFdmMappings[]>;
  getAllMappingExternalIds: (
    modelRevisionIds: ModelRevisionId[],
    fetchViews: boolean
  ) => Promise<ModelRevisionToConnectionMap>;
  getClosestParentDataPromises: (
    modelId: number,
    revisionId: number,
    treeIndex: number
  ) => FdmNodeDataPromises;
};
