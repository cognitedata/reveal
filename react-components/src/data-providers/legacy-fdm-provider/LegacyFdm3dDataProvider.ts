/*!
 * Copyright 2024 Cognite AS
 */
import { type AddModelOptions, type DataSourceType } from '@cognite/reveal';
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
import {
  type InstancesWithView,
  type InstancesWithViewDefinition
} from '../../query/useSearchMappedEquipmentFDM';
import {
  type AddImage360CollectionDatamodelsOptions,
  type TaggedAddResourceOptions
} from '../../components/Reveal3DResources/types';
import { getEdgeConnected3dInstances } from './getEdgeConnected3dInstances';
import { getFdmConnectionsForNodes } from './getFdmConnectionsForNodeIds';
import { getDMSModels } from './getDMSModels';
import { listAllMappedFdmNodes, listMappedFdmNodes } from './listMappedFdmNodes';
import { filterNodesByMappedTo3d } from './filterNodesByMappedTo3d';
import { getCadModelsForFdmInstance } from './getCadModelsForFdmInstance';
import { getCadConnectionsForRevision } from './getCadConnectionsForRevision';
import { type CogniteClient, type Node3D } from '@cognite/sdk';
import { EMPTY_ARRAY } from '../../utilities/constants';
import { isClassicIdentifier } from '../../components/Reveal3DResources/typeGuards';

export class LegacyFdm3dDataProvider implements Fdm3dDataProvider {
  readonly _fdmSdk: FdmSDK;
  readonly _cogniteClient: CogniteClient;

  constructor(fdmSdk: FdmSDK, cogniteClient: CogniteClient) {
    this._fdmSdk = fdmSdk;
    this._cogniteClient = cogniteClient;
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
    return await getFdmConnectionsForNodes(
      this._fdmSdk,
      this._cogniteClient,
      models,
      revisionId,
      nodes
    );
  }

  async listMappedFdmNodes(
    models: Array<AddModelOptions<DataSourceType> | AddImage360CollectionDatamodelsOptions>,
    sourcesToSearch: ViewItem[],
    instanceFilter: InstanceFilter | undefined,
    limit: number
  ): Promise<NodeItem[]> {
    const classicModels = models.filter((model) => isClassicIdentifier(model));

    if (classicModels.length === 0) {
      return EMPTY_ARRAY;
    }
    return await listMappedFdmNodes(
      this._fdmSdk,
      classicModels,
      sourcesToSearch.map((view) => ({
        type: 'view',
        space: view.space,
        externalId: view.externalId,
        version: view.version
      })),
      instanceFilter,
      limit
    );
  }

  async listAllMappedFdmNodes(
    models: Array<AddModelOptions<DataSourceType> | AddImage360CollectionDatamodelsOptions>,
    sourcesToSearch: Source[]
  ): Promise<NodeItem[]> {
    const classicModels = models.filter((model) => isClassicIdentifier(model));

    if (classicModels.length === 0) {
      return EMPTY_ARRAY;
    }
    return await listAllMappedFdmNodes(this._fdmSdk, classicModels, sourcesToSearch);
  }

  async filterNodesByMappedTo3d(
    nodes: InstancesWithViewDefinition[],
    models: Array<AddModelOptions<DataSourceType> | AddImage360CollectionDatamodelsOptions>,
    spacesToSearch: string[]
  ): Promise<InstancesWithView[]> {
    const classicModels = models.filter((model) => isClassicIdentifier(model));

    if (classicModels.length === 0) {
      return EMPTY_ARRAY;
    }

    // Must transform from InstancesWithViewDefinition to InstanceWithView
    // which has a different view type
    const transformedNodes = nodes.map((node) => ({
      view: {
        type: 'view',
        space: node.view.space,
        externalId: node.view.externalId,
        version: node.view.version
      } as Source,
      instances: node.instances
    }));

    return await filterNodesByMappedTo3d(
      this._fdmSdk,
      transformedNodes,
      classicModels,
      spacesToSearch
    );
  }

  async getCadModelsForInstance(
    instance: DmsUniqueIdentifier
  ): Promise<TaggedAddResourceOptions[]> {
    return await getCadModelsForFdmInstance(this._fdmSdk, instance);
  }

  async getCadConnectionsForRevisions(
    modelOptions: Array<AddModelOptions<DataSourceType>>
  ): Promise<FdmCadConnection[]> {
    const classicModels = modelOptions.filter((model) => isClassicIdentifier(model));

    if (classicModels.length === 0) {
      return EMPTY_ARRAY;
    }
    return await getCadConnectionsForRevision(classicModels, this._fdmSdk, this._cogniteClient);
  }
}
