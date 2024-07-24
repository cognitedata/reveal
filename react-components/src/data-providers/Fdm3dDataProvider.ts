/*!
 * Copyright 2024 Cognite AS
 */
import {
  InstanceFilter,
  NodeItem,
  Source,
  type DmsUniqueIdentifier,
  type ViewItem
} from './FdmSDK';
import { type AddModelOptions } from '@cognite/reveal';
import { type InstancesWithView } from '../query/useSearchMappedEquipmentFDM';
import { type FdmCadConnection } from '../components/CacheProvider/types';
import { TaggedAddResourceOptions } from '../components/Reveal3DResources/types';

export type Fdm3dDataProvider = {
  is3dView: (view: ViewItem) => boolean; // use3drelatedDirectConnection
  getDMSModels(modelId: number): Promise<DmsUniqueIdentifier[]>;
  getEdgeConnected3dInstances: (instance: DmsUniqueIdentifier) => Promise<DmsUniqueIdentifier[]>; //  use3drelateddirectconnection
  getFdmConnectionsForNodeIds(
    models: DmsUniqueIdentifier[],
    revisionId: number,
    nodeIds: number[]
  ): Promise<FdmCadConnection[]>; // CacheProvider / requests.ts / getFdmConnectionsForNodeIds

  listMappedFdmNodes(
    models: AddModelOptions[],
    sourcesToSearch: Source[],
    instancesFilter: InstanceFilter | undefined,
    limit: number
  ): Promise<NodeItem[]>; // useSearchMappedEquipmentFdm

  listAllMappedFdmNodes(
    models: AddModelOptions[],
    sourcesToSearch: Source[],
    instanceFilter: InstanceFilter | undefined
  ): Promise<NodeItem[]>;

  filterNodesByMappedTo3d(
    nodes: InstancesWithView[],
    models: AddModelOptions[],
    spacesToSearch: string[]
  ): Promise<InstancesWithView[]>; // useSearchMappedEquipmentFdm
  getCadModelsForInstance(instance: DmsUniqueIdentifier): Promise<TaggedAddResourceOptions[]>; // useModelsForInstanceQuery (only support CAD for now?)
  getCadConnectionsForRevisions(revisions: number[]): Promise<FdmCadConnection[]>; // FdmNodeCache.ts / getEdgesForRevisions
};

/* use3dRelatedDirectConnections() -
  use3dRelatedEdgeConnections(related3dEdgesQuery) -
  `useSearchMappedEquipmentFDM`(
    createMappedEquipmentQuery,
    createCheckMappedEquipmentQuery,
    createInModelsFilter
  ) -
  getCadModelsForFdmInstance.ts(getCadModelsForFdmInstance) -
  CacheProvider / requests.ts(getMappingEdgesForNodeIds, getDMSModels) -
  FdmNodeCache.ts(getEdgesForRevisions);
*/
