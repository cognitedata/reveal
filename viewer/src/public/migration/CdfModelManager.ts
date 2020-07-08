/*!
 * Copyright 2020 Cognite AS
 */

import { Observable, Subscription, fromEventPattern } from 'rxjs';
import { CogniteClient } from '@cognite/sdk';

import { Cognite3DModel, CdfCognite3DModel, LocalCognite3DModel } from './Cognite3DModel';
import { AddModelOptions, Cognite3DViewerOptions } from './types';
import { NotSupportedInMigrationWrapperError } from './NotSupportedInMigrationWrapperError';
import { CognitePointCloudModel } from './CognitePointCloudModel';

import { SectorNodeIdToTreeIndexMapLoadedEvent, RevealOptions } from '../types';
import { RevealManagerBase } from '../RevealManagerBase';
import { RevealManager } from '../RevealManager';
import { LocalHostRevealManager } from '../LocalHostRevealManager';

class ModelManagerBase<TModelIdentifier> {
  protected readonly _revealManager: RevealManagerBase<TModelIdentifier>;

  constructor(manager: RevealManagerBase<TModelIdentifier>) {
    this._revealManager = manager;
  }

  dispose(): void {
    this._revealManager.dispose();
  }

  getLoadingStateObserver(): Observable<boolean> {
    return fromEventPattern(
      h => this._revealManager.on('loadingStateChanged', h),
      h => this._revealManager.off('loadingStateChanged', h)
    );
  }

  setSlicingPlanes(planes: THREE.Plane[]): void {
    this._revealManager.clippingPlanes = planes;
  }

  getSlicingPlanes(): THREE.Plane[] {
    return this._revealManager.clippingPlanes;
  }

  needsRedraw(): boolean {
    return this._revealManager.needsRedraw;
  }

  requestRedraw(): void {
    this._revealManager.requestRedraw();
  }

  resetRedraw(): void {
    this._revealManager.resetRedraw();
  }

  update(camera: THREE.PerspectiveCamera): void {
    this._revealManager.update(camera);
  }
}

export class CdfModelManager extends ModelManagerBase<{ modelId: number; revisionId: number }> {
  private readonly _sdkClient: CogniteClient;
  private readonly _subscriptions = new Subscription();

  public get revealManager(): RevealManager {
    return this._revealManager as RevealManager;
  }

  constructor(sdkClient: CogniteClient, options: Cognite3DViewerOptions) {
    super(new RevealManager(sdkClient, transformOptions(options)));
    this._sdkClient = sdkClient;
  }

  dispose(): void {
    this._subscriptions.unsubscribe();
    super.dispose();
  }

  async createPointCloudModel(modelId: number, revisionId: number): Promise<CognitePointCloudModel> {
    const [potreeGroup, potreeNode] = await this.revealManager.addModel('pointcloud', { modelId, revisionId });
    const model = new CognitePointCloudModel(modelId, revisionId, potreeGroup, potreeNode);
    return model;
  }

  async createCadModel(options: AddModelOptions): Promise<Cognite3DModel> {
    if (options.localPath) {
      throw new NotSupportedInMigrationWrapperError();
    }

    const cadNode = await this.revealManager.addModel('cad', {
      modelId: options.modelId,
      revisionId: options.revisionId
    });
    const model = new CdfCognite3DModel(options.modelId, options.revisionId, cadNode, this._sdkClient);

    // Update nodeId -> treeIndex mapping when sectors are loaded
    this._subscriptions.add(
      this.getNodeIdToTreeIndexMapObserver().subscribe(event => {
        // TODO 2020-07-05 larsmoa: Fix a better way of identifying a model than blobUrl
        if (event.blobUrl === cadNode.cadModelMetadata.blobUrl) {
          model.updateNodeIdMaps(event.nodeIdToTreeIndexMap);
        }
      })
    );
    return model;
  }

  private getNodeIdToTreeIndexMapObserver(): Observable<SectorNodeIdToTreeIndexMapLoadedEvent> {
    return fromEventPattern(
      h => this._revealManager.on('nodeIdToTreeIndexMapLoaded', h),
      h => this._revealManager.off('nodeIdToTreeIndexMapLoaded', h)
    );
  }
}

export class LocalModelManager extends ModelManagerBase<{ fileName: string }> {
  constructor(options: Cognite3DViewerOptions) {
    super(new LocalHostRevealManager(transformOptions(options)));
  }

  async createPointCloudModel(fileName: string): Promise<CognitePointCloudModel> {
    const [potreeGroup, potreeNode] = await this._revealManager.loadModel('pointcloud', { fileName });
    const model = new CognitePointCloudModel(-1, -1, potreeGroup, potreeNode);
    return model;
  }

  async createCadModel(options: AddModelOptions): Promise<Cognite3DModel> {
    if (!options.localPath) {
      throw new NotSupportedInMigrationWrapperError();
    }

    const cadNode = await this._revealManager.loadModel('cad', {
      fileName: options.localPath
    });
    const model = new LocalCognite3DModel(options.modelId, options.revisionId, cadNode);
    return model;
  }
}

function transformOptions(options: Cognite3DViewerOptions): RevealOptions {
  const result: RevealOptions = {};
  if (options._sectorCuller) {
    result.internal = { sectorCuller: options._sectorCuller };
  }
  return result;
}
