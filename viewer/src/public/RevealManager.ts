/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';

import { RenderManager } from './RenderManager';
import { CadManager } from '@/datamodels/cad/CadManager';
import { PointCloudManager } from '@/datamodels/pointcloud/PointCloudManager';
import {
  SectorNodeIdToTreeIndexMapLoadedListener,
  SectorNodeIdToTreeIndexMapLoadedEvent,
  LoadingStateChangeListener
} from './types';
import { Subscription, combineLatest } from 'rxjs';
import { distinctUntilChanged, map, share, filter } from 'rxjs/operators';
import { trackError, trackLoadModel } from '@/utilities/metrics';
import { NodeAppearanceProvider, CadNode } from '@/datamodels/cad';
import { PotreeGroupWrapper } from '@/datamodels/pointcloud/PotreeGroupWrapper';
import { PotreeNodeWrapper } from '@/datamodels/pointcloud/PotreeNodeWrapper';
import { RenderMode } from '@/datamodels/cad/rendering/RenderMode';

export class RevealManager<TModelIdentifier> implements RenderManager {
  private readonly _cadManager: CadManager<TModelIdentifier>;
  private readonly _pointCloudManager: PointCloudManager<TModelIdentifier>;

  private readonly _lastCamera = {
    position: new THREE.Vector3(NaN, NaN, NaN),
    quaternion: new THREE.Quaternion(NaN, NaN, NaN, NaN),
    zoom: NaN
  };

  private _isDisposed = false;
  private readonly _subscriptions = new Subscription();
  private readonly eventListeners = {
    sectorNodeIdToTreeIndexMapLoaded: new Array<SectorNodeIdToTreeIndexMapLoadedListener>(),
    loadingStateChanged: new Array<LoadingStateChangeListener>()
  };

  constructor(cadManager: CadManager<TModelIdentifier>, pointCloudManager: PointCloudManager<TModelIdentifier>) {
    this._cadManager = cadManager;
    this._pointCloudManager = pointCloudManager;
    this.initLoadingStateObserver(this._cadManager, this._pointCloudManager);
  }

  public dispose(): void {
    if (this._isDisposed) {
      return;
    }
    this._cadManager.dispose();
    this._subscriptions.unsubscribe();
    this._isDisposed = true;
  }

  public requestRedraw(): void {
    this._cadManager.requestRedraw();
    this._pointCloudManager.requestRedraw();
  }

  public resetRedraw(): void {
    this._cadManager.resetRedraw();
  }

  get needsRedraw(): boolean {
    return this._cadManager.needsRedraw || this._pointCloudManager.needsRedraw;
  }

  public update(camera: THREE.PerspectiveCamera) {
    const hasCameraChanged =
      this._lastCamera.zoom !== camera.zoom ||
      !this._lastCamera.position.equals(camera.position) ||
      !this._lastCamera.quaternion.equals(camera.quaternion);

    if (hasCameraChanged) {
      this._lastCamera.position.copy(camera.position);
      this._lastCamera.quaternion.copy(camera.quaternion);
      this._lastCamera.zoom = camera.zoom;

      this._cadManager.updateCamera(camera);
    }
  }

  public get renderMode(): RenderMode {
    return this._cadManager.renderMode;
  }

  public set renderMode(renderMode: RenderMode) {
    this._cadManager.renderMode = renderMode;
  }

  public set clippingPlanes(clippingPlanes: THREE.Plane[]) {
    this._cadManager.clippingPlanes = clippingPlanes;
  }

  public get clippingPlanes(): THREE.Plane[] {
    return this._cadManager.clippingPlanes;
  }

  public set clipIntersection(intersection: boolean) {
    this._cadManager.clipIntersection = intersection;
  }

  public get clipIntersection() {
    return this._cadManager.clipIntersection;
  }

  public on(event: 'loadingStateChanged', listener: LoadingStateChangeListener): void;
  public on(event: 'nodeIdToTreeIndexMapLoaded', listener: SectorNodeIdToTreeIndexMapLoadedListener): void;
  public on(
    event: 'loadingStateChanged' | 'nodeIdToTreeIndexMapLoaded',
    listener: LoadingStateChangeListener | SectorNodeIdToTreeIndexMapLoadedListener
  ): void {
    switch (event) {
      case 'loadingStateChanged':
        this.eventListeners.loadingStateChanged.push(listener as LoadingStateChangeListener);
        break;

      case 'nodeIdToTreeIndexMapLoaded':
        this.eventListeners.sectorNodeIdToTreeIndexMapLoaded.push(listener as SectorNodeIdToTreeIndexMapLoadedListener);
        break;

      default:
        throw new Error(`Unsupported event '${event}'`);
    }
  }

  public off(event: 'loadingStateChanged', listener: LoadingStateChangeListener): void;
  public off(event: 'nodeIdToTreeIndexMapLoaded', listener: SectorNodeIdToTreeIndexMapLoadedListener): void;
  public off(
    event: 'loadingStateChanged' | 'nodeIdToTreeIndexMapLoaded',
    listener: LoadingStateChangeListener | SectorNodeIdToTreeIndexMapLoadedListener
  ): void {
    switch (event) {
      case 'loadingStateChanged':
        this.eventListeners.loadingStateChanged.filter(x => x !== listener);
        break;

      case 'nodeIdToTreeIndexMapLoaded':
        this.eventListeners.sectorNodeIdToTreeIndexMapLoaded.filter(x => x !== listener);
        break;

      default:
        throw new Error(`Unsupported event '${event}'`);
    }
  }

  public addModel(
    type: 'cad',
    modelIdentifier: TModelIdentifier,
    nodeApperanceProvider?: NodeAppearanceProvider
  ): Promise<CadNode>;
  public addModel(
    type: 'pointcloud',
    modelIdentifier: TModelIdentifier
  ): Promise<[PotreeGroupWrapper, PotreeNodeWrapper]>;
  public async addModel(
    type: 'cad' | 'pointcloud',
    modelIdentifier: TModelIdentifier,
    nodeApperanceProvider?: NodeAppearanceProvider
  ): Promise<[PotreeGroupWrapper, PotreeNodeWrapper] | CadNode> {
    trackLoadModel(
      {
        moduleName: 'RevealManagerBase',
        methodName: 'loadModel',
        options: { nodeApperanceProvider }
      },
      modelIdentifier
    );

    switch (type) {
      case 'cad': {
        const cadNode = await this._cadManager.addModel(modelIdentifier);
        this._subscriptions.add(
          this._cadManager
            .getParsedData()
            .pipe(
              share(),
              filter(x => x.blobUrl === cadNode.cadModelMetadata.blobUrl)
            )
            .subscribe(parseSector => {
              this.notifySectorNodeIdToTreeIndexMapLoaded(parseSector.blobUrl, parseSector.data.nodeIdToTreeIndexMap);
            })
        );
        return cadNode;
      }

      case 'pointcloud': {
        return this._pointCloudManager.addModel(modelIdentifier);
      }

      default:
        throw new Error(`Model type '${type}' is not supported`);
    }
  }

  private notifySectorNodeIdToTreeIndexMapLoaded(blobUrl: string, nodeIdToTreeIndexMap: Map<number, number>): void {
    const event: SectorNodeIdToTreeIndexMapLoadedEvent = { blobUrl, nodeIdToTreeIndexMap };
    this.eventListeners.sectorNodeIdToTreeIndexMapLoaded.forEach(listener => {
      listener(event);
    });
  }

  private notifyLoadingStateChanged(isLoaded: boolean) {
    this.eventListeners.loadingStateChanged.forEach(handler => {
      handler(isLoaded);
    });
  }

  private initLoadingStateObserver(
    cadManager: CadManager<TModelIdentifier>,
    pointCloudManager: PointCloudManager<TModelIdentifier>
  ) {
    this._subscriptions.add(
      combineLatest([cadManager.getLoadingStateObserver(), pointCloudManager.getLoadingStateObserver()])
        .pipe(
          map(loading => loading.some(x => x)),
          distinctUntilChanged()
        )
        .subscribe(this.notifyLoadingStateChanged.bind(this), error =>
          trackError(error, {
            moduleName: 'RevealManager',
            methodName: 'constructor'
          })
        )
    );
  }
}
