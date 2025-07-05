import { type AddModelOptions, type DataSourceType } from '@cognite/reveal';
import { type FdmCadConnection } from '../components/CacheProvider/types';
import { type Fdm3dDataProvider } from './Fdm3dDataProvider';
import {
  type DmsUniqueIdentifier,
  type InstanceFilter,
  type NodeItem,
  type Source,
  type ViewItem
} from './FdmSDK';
import {
  type InstancesWithView,
  type InstancesWithViewDefinition
} from '../query/useSearchMappedEquipmentFDM';
import {
  type AddImage360CollectionDatamodelsOptions,
  type TaggedAddResourceOptions
} from '../components/Reveal3DResources/types';
import { type Node3D } from '@cognite/sdk';

/**
 * A dummy Fdm3dDataProvider that returns empty result for all queries. Intended for usage in phasing
 * out the older LegacyFdm3dDataProvider
 */
export class EmptyFdm3dDataProvider implements Fdm3dDataProvider {
  is3dView(_view: ViewItem): boolean {
    return false;
  }

  async getDMSModels(_modelId: number): Promise<DmsUniqueIdentifier[]> {
    return [];
  }

  async getEdgeConnected3dInstances(
    _instance: DmsUniqueIdentifier
  ): Promise<DmsUniqueIdentifier[]> {
    return [];
  }

  async getFdmConnectionsForNodes(
    _models: DmsUniqueIdentifier[],
    _revisionId: number,
    _nodes: Node3D[]
  ): Promise<FdmCadConnection[]> {
    return [];
  }

  async listMappedFdmNodes(
    _models: Array<AddModelOptions<DataSourceType> | AddImage360CollectionDatamodelsOptions>,
    _sourcesToSearch: ViewItem[],
    _instanceFilter: InstanceFilter | undefined,
    _limit: number
  ): Promise<NodeItem[]> {
    return [];
  }

  async listAllMappedFdmNodes(
    _models: Array<AddModelOptions<DataSourceType> | AddImage360CollectionDatamodelsOptions>,
    _sourcesToSearch: Source[]
  ): Promise<NodeItem[]> {
    return [];
  }

  async filterNodesByMappedTo3d(
    _nodes: InstancesWithViewDefinition[],
    _models: Array<AddModelOptions<DataSourceType> | AddImage360CollectionDatamodelsOptions>,
    _spacesToSearch: string[],
    _includeIndirectRelations: boolean
  ): Promise<InstancesWithView[]> {
    return [];
  }

  async getCadModelsForInstance(
    _instance: DmsUniqueIdentifier
  ): Promise<TaggedAddResourceOptions[]> {
    return [];
  }

  async getCadConnectionsForRevisions(
    _modelOptions: Array<AddModelOptions<DataSourceType>>
  ): Promise<FdmCadConnection[]> {
    return [];
  }
}
