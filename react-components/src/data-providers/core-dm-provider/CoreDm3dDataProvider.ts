import { AddModelOptions, isDefaultCameraManager } from '@cognite/reveal';
import { FdmCadConnection } from '../../components/CacheProvider/types';
import { Fdm3dDataProvider } from '../Fdm3dDataProvider';
import { DmsUniqueIdentifier, FdmSDK, InstanceFilter, NodeItem, Source, ViewItem } from '../FdmSDK';
import { InstancesWithView } from '../../query/useSearchMappedEquipmentFDM';
import { TaggedAddResourceOptions } from '../../components/Reveal3DResources/types';
import { COGNITE_3D_OBJECT_SOURCE } from './dataModels';
import { getDMSModels } from './getDMSModels';
import { getEdgeConnected3dInstances } from './getEdgeConnected3dInstances';
import { getFdmConnectionsForNodes } from './getFdmConnectionsForNodeIds';
import { Node3D } from '@cognite/sdk';
import { getDMSRevision } from './getDMSRevision';
import assert from 'assert';
import { listAllMappedFdmNodes, listMappedFdmNodes } from './listMappedFdmNodes';
import { isDefined } from '../../utilities/isDefined';
import { executeParallel } from '../../utilities/executeParallel';
import { zip } from 'lodash';

const MAX_PARALLEL_QUERIES = 2;

export class CoreDm3dFdm3dDataProvider implements Fdm3dDataProvider {
  readonly _fdmSdk: FdmSDK;

  readonly _relevant3dSpaces: DmsUniqueIdentifier[];

  readonly _revisionIdToDMSIdentifier = new Map<number, DmsUniqueIdentifier>();
  readonly _modelIdToDMSIdentifier = new Map<number, DmsUniqueIdentifier[]>();

  constructor(relevant3dSpaces: DmsUniqueIdentifier[], fdmSdk: FdmSDK) {
    this._fdmSdk = fdmSdk;
    this._relevant3dSpaces = relevant3dSpaces;
  }

  is3dView(view: ViewItem): boolean {
    return view.implements.some(
      (type) =>
        type.externalId === COGNITE_3D_OBJECT_SOURCE.externalId &&
        type.space === COGNITE_3D_OBJECT_SOURCE.space &&
        type.version === COGNITE_3D_OBJECT_SOURCE.version
    );
  }

  async getDMSModels(modelId: number): Promise<DmsUniqueIdentifier[]> {
    const cachedModels = this._modelIdToDMSIdentifier.get(modelId);
    if (cachedModels !== undefined) {
      return cachedModels;
    }

    const models = await getDMSModels(modelId, this._fdmSdk);

    this._modelIdToDMSIdentifier.set(modelId, models);
    return models;
  }

  private async getDMSRevision(
    modelRef: DmsUniqueIdentifier,
    revisionId: number
  ): Promise<DmsUniqueIdentifier> {
    let revisionRef = this._revisionIdToDMSIdentifier.get(revisionId);

    if (revisionRef === undefined) {
      const revisionResult = await getDMSRevision(modelRef, revisionId, this._fdmSdk);

      this._revisionIdToDMSIdentifier.set(revisionId, revisionResult);
      revisionRef = revisionResult;
    }

    if (revisionRef === undefined) {
      throw Error(`No revision with id ${revisionId} found`);
    }

    return revisionRef;
  }

  private async getDMSModelsForIds(
    modelIds: number[]
  ): Promise<(DmsUniqueIdentifier | undefined)[]> {
    return (
      await executeParallel(
        modelIds.map((id) => () => this.getDMSModels(id)),
        MAX_PARALLEL_QUERIES
      )
    ).flat();
  }

  private async getDMSRevisionsForRevisionIdsAndModelRefs(
    modelRefs: (DmsUniqueIdentifier | undefined)[],
    revisionIds: number[]
  ): Promise<DmsUniqueIdentifier[]> {
    return (
      await executeParallel(
        revisionIds.map(
          (revisionId, ind) => () =>
            modelRefs[ind] === undefined
              ? Promise.resolve(undefined)
              : this.getDMSRevision(modelRefs[ind], revisionId)
        ),
        MAX_PARALLEL_QUERIES
      )
    ).filter(isDefined);
  }

  getEdgeConnected3dInstances(instance: DmsUniqueIdentifier): Promise<DmsUniqueIdentifier[]> {
    return getEdgeConnected3dInstances(instance, this._fdmSdk);
  }

  async getFdmConnectionsForNodes(
    models: DmsUniqueIdentifier[],
    revisionId: number,
    nodes: Node3D[]
  ): Promise<FdmCadConnection[]> {
    if (models.length !== 1) {
      throw new Error(`Expected 1 model, got ${models.length}`);
    }

    const model = models[0];

    const revisionRef = await this.getDMSRevision(model, revisionId);

    return getFdmConnectionsForNodes(model, revisionRef, revisionId, nodes, this._fdmSdk);
  }

  async listMappedFdmNodes(
    models: AddModelOptions[],
    sourcesToSearch: Source[],
    instanceFilter: InstanceFilter | undefined,
    limit: number
  ): Promise<NodeItem[]> {
    const modelRefs = await this.getDMSModelsForIds(models.map((model) => model.modelId));

    const revisionRefs = await this.getDMSRevisionsForRevisionIdsAndModelRefs(
      modelRefs,
      models.map((model) => model.revisionId)
    );

    return listMappedFdmNodes(revisionRefs, sourcesToSearch, instanceFilter, limit, this._fdmSdk);
  }

  async listAllMappedFdmNodes(
    models: AddModelOptions[],
    sourcesToSearch: Source[],
    instanceFilter: InstanceFilter | undefined
  ): Promise<NodeItem[]> {
    const modelRefs = await this.getDMSModelsForIds(models.map((model) => model.modelId));

    const revisionRefs = await this.getDMSRevisionsForRevisionIdsAndModelRefs(
      modelRefs,
      models.map((model) => model.revisionId)
    );

    return listAllMappedFdmNodes(revisionRefs, sourcesToSearch, instanceFilter, this._fdmSdk);
  }

  filterNodesByMappedTo3d(
    nodes: InstancesWithView[],
    models: AddModelOptions[],
    spacesToSearch: string[]
  ): Promise<InstancesWithView[]> {}

  getCadModelsForInstance(instance: DmsUniqueIdentifier): Promise<TaggedAddResourceOptions[]> {}

  getCadConnectionsForRevisions(revisions: number[]): Promise<FdmCadConnection[]> {}
}
