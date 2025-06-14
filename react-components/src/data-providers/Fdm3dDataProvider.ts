import {
  type InstanceFilter,
  type NodeItem,
  type Source,
  type DmsUniqueIdentifier,
  type ViewItem
} from './FdmSDK';
import { type DataSourceType, type AddModelOptions } from '@cognite/reveal';
import {
  type InstancesWithView,
  type InstancesWithViewDefinition
} from '../query/useSearchMappedEquipmentFDM';
import { type FdmCadConnection } from '../components/CacheProvider/types';
import {
  type AddImage360CollectionDatamodelsOptions,
  type TaggedAddResourceOptions
} from '../components/Reveal3DResources/types';
import { type Node3D } from '@cognite/sdk';

export type Fdm3dDataProvider = {
  is3dView: (view: ViewItem) => boolean;

  getDMSModels: (modelId: number) => Promise<DmsUniqueIdentifier[]>;

  getEdgeConnected3dInstances: (instance: DmsUniqueIdentifier) => Promise<DmsUniqueIdentifier[]>;

  getFdmConnectionsForNodes: (
    models: DmsUniqueIdentifier[],
    revisionId: number,
    nodes: Node3D[]
  ) => Promise<FdmCadConnection[]>;

  listMappedFdmNodes: (
    models: Array<AddModelOptions<DataSourceType> | AddImage360CollectionDatamodelsOptions>,
    sourcesToSearch: ViewItem[],
    instancesFilter: InstanceFilter | undefined,
    limit: number
  ) => Promise<NodeItem[]>;

  listAllMappedFdmNodes: (
    models: Array<AddModelOptions<DataSourceType> | AddImage360CollectionDatamodelsOptions>,
    sourcesToSearch: Source[],
    instanceFilter: InstanceFilter | undefined
  ) => Promise<NodeItem[]>;

  filterNodesByMappedTo3d: (
    nodes: InstancesWithViewDefinition[],
    models: Array<AddModelOptions<DataSourceType> | AddImage360CollectionDatamodelsOptions>,
    spacesToSearch: string[],
    includeIndirectRelations: boolean
  ) => Promise<InstancesWithView[]>;

  getCadModelsForInstance: (instance: DmsUniqueIdentifier) => Promise<TaggedAddResourceOptions[]>;

  getCadConnectionsForRevisions: (
    modelOptions: Array<AddModelOptions<DataSourceType>>
  ) => Promise<FdmCadConnection[]>;
};
