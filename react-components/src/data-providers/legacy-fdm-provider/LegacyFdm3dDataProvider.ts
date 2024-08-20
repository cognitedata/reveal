/*!
 * Copyright 2024 Cognite AS
 */
import { type AddModelOptions } from '@cognite/reveal';
import { type FdmCadConnection } from '../../components/CacheProvider/types';
import { type Fdm3dDataProvider } from '../Fdm3dDataProvider';
import {
  type DmsUniqueIdentifier,
  type FdmSDK,
  type InstanceFilter,
  type NodeItem,
  type Source,
  type ViewItem
} from '../FdmSDK';
import { type InstancesWithView } from '../../query/useSearchMappedEquipmentFDM';
import { type TaggedAddResourceOptions } from '../../components/Reveal3DResources/types';
import { getEdgeConnected3dInstances } from './getEdgeConnected3dInstances';
import { getFdmConnectionsForNodes } from './getFdmConnectionsForNodeIds';
import { getDMSModels } from './getDMSModels';
import { listAllMappedFdmNodes, listMappedFdmNodes } from './listMappedFdmNodes';
import { filterNodesByMappedTo3d } from './filterNodesByMappedTo3d';
import { getCadModelsForFdmInstance } from './getCadModelsForFdmInstance';
import { getCadConnectionsForRevision } from './getCadConnectionsForRevision';
import { Node3D } from '@cognite/sdk/dist/src';

export class LegacyFdm3dDataProvider implements Fdm3dDataProvider {
  readonly _fdmSdk: FdmSDK;

  constructor(fdmSdk: FdmSDK) {
    this._fdmSdk = fdmSdk;
  }

  is3dView(view: ViewItem): boolean {
    return Object.keys(view.properties).some((propName) => propName === 'inModel3d');
  }

  async getDMSModels(modelId: number): Promise<DmsUniqueIdentifier[]> {
    return await getDMSModels(this._fdmSdk, modelId);
  }

  async getEdgeConnected3dInstances(instance: DmsUniqueIdentifier): Promise<DmsUniqueIdentifier[]> {
    return await getEdgeConnected3dInstances(instance, this._fdmSdk);
  }

  async getFdmConnectionsForNodes(
    models: DmsUniqueIdentifier[],
    revisionId: number,
    nodes: Node3D[]
  ): Promise<FdmCadConnection[]> {
    return await getFdmConnectionsForNodes(this._fdmSdk, models, revisionId, nodes);
  }

  async listMappedFdmNodes(
    models: AddModelOptions[],
    sourcesToSearch: Source[],
    instanceFilter: InstanceFilter | undefined,
    limit: number
  ): Promise<NodeItem[]> {
    return await listMappedFdmNodes(this._fdmSdk, models, sourcesToSearch, instanceFilter, limit);
  }

  async listAllMappedFdmNodes(
    models: AddModelOptions[],
    sourcesToSearch: Source[]
  ): Promise<NodeItem[]> {
    return await listAllMappedFdmNodes(this._fdmSdk, models, sourcesToSearch);
  }

  async filterNodesByMappedTo3d(
    nodes: InstancesWithView[],
    models: AddModelOptions[],
    spacesToSearch: string[]
  ): Promise<InstancesWithView[]> {
    return await filterNodesByMappedTo3d(this._fdmSdk, nodes, models, spacesToSearch);
  }

  async getCadModelsForInstance(
    instance: DmsUniqueIdentifier
  ): Promise<TaggedAddResourceOptions[]> {
    return await getCadModelsForFdmInstance(this._fdmSdk, instance);
  }

  async getCadConnectionsForRevisions(
    modelOptions: AddModelOptions[]
  ): Promise<FdmCadConnection[]> {
    return await getCadConnectionsForRevision(modelOptions, this._fdmSdk);
  }
}
