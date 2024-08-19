import { AddModelOptions } from '@cognite/reveal';
import { FdmCadConnection } from '../../components/CacheProvider/types';
import { Fdm3dDataProvider } from '../Fdm3dDataProvider';
import { DmsUniqueIdentifier, FdmSDK, InstanceFilter, NodeItem, Source, ViewItem } from '../FdmSDK';
import { InstancesWithView } from '../../query/useSearchMappedEquipmentFDM';
import { TaggedAddResourceOptions } from '../../components/Reveal3DResources/types';
import { CoreDm3dFdm3dDataProvider } from './CoreDm3dDataProvider';
import { LegacyFdm3dDataProvider } from '../legacy-fdm-provider/LegacyFdm3dDataProvider';
import { Node3D } from '@cognite/sdk';

// TODO - re-evaluate if this class is actually necessary...
export class Duplex3dDataProvider implements Fdm3dDataProvider {
  readonly _fdmSdk: FdmSDK;

  readonly _dataProvider: Fdm3dDataProvider;

  constructor(isMaja: boolean, relevant3dSpaces: DmsUniqueIdentifier[], fdmSdk: FdmSDK) {
    this._fdmSdk = fdmSdk;
    this._dataProvider = isMaja
      ? new CoreDm3dFdm3dDataProvider(relevant3dSpaces, fdmSdk)
      : new LegacyFdm3dDataProvider(fdmSdk);
  }

  is3dView(view: ViewItem): boolean {
    return this._dataProvider.is3dView(view);
  }

  getDMSModels(modelId: number): Promise<DmsUniqueIdentifier[]> {
    return this._dataProvider.getDMSModels(modelId);
  }

  getEdgeConnected3dInstances(instance: DmsUniqueIdentifier): Promise<DmsUniqueIdentifier[]> {
    return this._dataProvider.getEdgeConnected3dInstances(instance);
  }

  getFdmConnectionsForNodes(
    models: DmsUniqueIdentifier[],
    revisionId: number,
    nodes: Node3D[]
  ): Promise<FdmCadConnection[]> {
    return this._dataProvider.getFdmConnectionsForNodes(models, revisionId, nodes);
  }

  listMappedFdmNodes(
    models: AddModelOptions[],
    sourcesToSearch: Source[],
    instancesFilter: InstanceFilter | undefined,
    limit: number
  ): Promise<NodeItem[]> {
    return this._dataProvider.listMappedFdmNodes(models, sourcesToSearch, instancesFilter, limit);
  }

  listAllMappedFdmNodes(
    models: AddModelOptions[],
    sourcesToSearch: Source[],
    instanceFilter: InstanceFilter | undefined
  ): Promise<NodeItem[]> {
    return this._dataProvider.listAllMappedFdmNodes(models, sourcesToSearch, instanceFilter);
  }

  filterNodesByMappedTo3d(
    nodes: InstancesWithView[],
    models: AddModelOptions[],
    spacesToSearch: string[]
  ): Promise<InstancesWithView[]> {
    return this._dataProvider.filterNodesByMappedTo3d(nodes, models, spacesToSearch);
  }

  getCadModelsForInstance(instance: DmsUniqueIdentifier): Promise<TaggedAddResourceOptions[]> {
    return this._dataProvider.getCadModelsForInstance(instance);
  }

  getCadConnectionsForRevisions(revisions: number[]): Promise<FdmCadConnection[]> {
    return this._dataProvider.getCadConnectionsForRevisions(revisions);
  }
}
