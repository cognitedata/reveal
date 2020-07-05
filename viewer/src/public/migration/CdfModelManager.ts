/*!
 * Copyright 2020 Cognite AS
 */

import { Observable, Subscription, fromEventPattern } from 'rxjs';
import { CogniteClient } from '@cognite/sdk';

import { Cognite3DModel } from './Cognite3DModel';
import { AddModelOptions } from './types';
import { NotSupportedInMigrationWrapperError } from './NotSupportedInMigrationWrapperError';
import { CognitePointCloudModel } from './CognitePointCloudModel';

import { RevealManager } from '../RevealManager';
import { SectorNodeIdToTreeIndexMapLoadedEvent } from '../types';

export class CdfModelManager {
  private readonly _sdkClient: CogniteClient;
  private readonly _revealManager: RevealManager;
  private readonly _subscriptions = new Subscription();

  constructor(sdkClient: CogniteClient) {
    this._sdkClient = sdkClient;
    this._revealManager = new RevealManager(sdkClient, {});
  }

  get revealManager(): RevealManager {
    return this._revealManager;
  }

  dispose(): void {
    this._revealManager.dispose();
    this._subscriptions.unsubscribe();
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

  async createPointCloudModel(modelId: number, revisionId: number): Promise<CognitePointCloudModel> {
    const [potreeGroup, potreeNode] = await this._revealManager.addModel('pointcloud', { modelId, revisionId });
    const model = new CognitePointCloudModel(modelId, revisionId, potreeGroup, potreeNode);
    return model;
  }

  async createCadModel(options: AddModelOptions): Promise<Cognite3DModel> {
    if (options.localPath) {
      throw new NotSupportedInMigrationWrapperError();
    }

    const cadNode = await this._revealManager.addModel('cad', {
      modelId: options.modelId,
      revisionId: options.revisionId
    });
    const model = new Cognite3DModel(options.modelId, options.revisionId, cadNode, this._sdkClient);

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
