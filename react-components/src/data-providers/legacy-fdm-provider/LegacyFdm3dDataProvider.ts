import { AddModelOptions } from '@cognite/reveal';
import { FdmCadConnection } from '../../components/CacheProvider/types';
import { Fdm3dDataProvider } from '../Fdm3dDataProvider';
import { DmsUniqueIdentifier, FdmSDK, InstanceFilter, NodeItem, Source, ViewItem } from '../FdmSDK';
import { InstancesWithView } from '../../query/useSearchMappedEquipmentFDM';
import { TaggedAddResourceOptions } from '../../components/Reveal3DResources/types';
import { getEdgeConnected3dInstances } from './getEdgeConnected3dInstances';
import { getFdmConnectionsForNodeIds } from './getFdmConnectionsForNodeIds';
import { getDMSModels } from './getDMSModels';
import { listAllMappedFdmNodes, listMappedFdmNodes } from './listMappedFdmNodes';
import { filterNodesByMappedTo3d } from './filterNodesByMappedTo3d';

export class LegacyFdm3dDataProvider implements Fdm3dDataProvider {
  readonly _fdmSdk: FdmSDK;

  constructor(fdmSdk: FdmSDK) {
    this._fdmSdk = fdmSdk;
  }

  is3dView(view: ViewItem): boolean {
    return Object.keys(view.properties).some((propName) => propName === 'inModel3d');
  }

  getDMSModels(modelId: number): Promise<DmsUniqueIdentifier[]> {
    return getDMSModels(this._fdmSdk, modelId);
  }

  getEdgeConnected3dInstances(instance: DmsUniqueIdentifier): Promise<DmsUniqueIdentifier[]> {
    return getEdgeConnected3dInstances(this._fdmSdk, instance);
  }

  getFdmConnectionsForNodeIds(
    models: DmsUniqueIdentifier[],
    revisionId: number,
    nodeIds: number[]
  ): Promise<FdmCadConnection[]> {
    return getFdmConnectionsForNodeIds(this._fdmSdk, models, revisionId, nodeIds);
  }

  listMappedFdmNodes(
    models: AddModelOptions[],
    sourcesToSearch: Source[],
    instanceFilter: InstanceFilter | undefined,
    limit: number
  ): Promise<NodeItem[]> {
    return listMappedFdmNodes(this._fdmSdk, models, sourcesToSearch, instanceFilter, limit);
  } // useSearchMappedEquipmentFdm

  listAllMappedFdmNodes(models: AddModelOptions[], sourcesToSearch: Source[]): Promise<NodeItem[]> {
    return listAllMappedFdmNodes(this._fdmSdk, models, sourcesToSearch);
  }

  filterNodesByMappedTo3d(
    nodes: InstancesWithView[],
    models: AddModelOptions[],
    spacesToSearch: string[]
  ): Promise<InstancesWithView[]> {
    return filterNodesByMappedTo3d(this._fdmSdk, nodes, models, spacesToSearch);
  }

  getModelsForInstance(instance: DmsUniqueIdentifier): Promise<TaggedAddResourceOptions[]> {
    // useModelsForInstanceQuery (only support CAD for now?)
  }
  getCadConnectionsForRevisions(revisions: number[]): Promise<FdmCadConnection[]>; // FdmNodeCache.ts / getEdgesForRevisions
}
