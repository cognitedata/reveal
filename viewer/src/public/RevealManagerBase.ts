/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';

import { RenderManager } from './RenderManager';
import { CadManager } from '@/datamodels/cad/CadManager';
import { MaterialManager } from '@/datamodels/cad/MaterialManager';
import { PointCloudManager } from '@/datamodels/pointcloud/PointCloudManager';
import { EffectRenderManager } from '@/datamodels/cad/rendering/EffectRenderManager';

export type OnDataUpdated = () => void;

export class RevealManagerBase<TModelIdentifier> implements RenderManager {
  public get effectRenderManager(): EffectRenderManager {
    return this._effectRenderManager;
  }

  get needsRedraw(): boolean {
    return this._cadManager.needsRedraw || this._pointCloudManager.needsRedraw;
  }

  public set clippingPlanes(clippingPlanes: THREE.Plane[]) {
    this._materialManager.clippingPlanes = clippingPlanes;
    this._cadManager.clippingPlanes = clippingPlanes;
  }

  public get clippingPlanes(): THREE.Plane[] {
    return this._materialManager.clippingPlanes;
  }

  public set clipIntersection(intersection: boolean) {
    this._materialManager.clipIntersection = intersection;
    this._cadManager.clipIntersection = intersection;
  }

  public get clipIntersection() {
    return this._materialManager.clipIntersection;
  }
  protected isDisposed = false;

  // CAD
  protected readonly _cadManager: CadManager<TModelIdentifier>;
  protected readonly _materialManager: MaterialManager;

  // PointCloud
  protected readonly _pointCloudManager: PointCloudManager<TModelIdentifier>;

  private _effectRenderManager: EffectRenderManager;

  private readonly _lastCamera = {
    position: new THREE.Vector3(NaN, NaN, NaN),
    quaternion: new THREE.Quaternion(NaN, NaN, NaN, NaN),
    zoom: NaN
  };

  constructor(
    cadManager: CadManager<TModelIdentifier>,
    materialManager: MaterialManager,
    pointCloudManager: PointCloudManager<TModelIdentifier>
  ) {
    this._cadManager = cadManager;
    this._materialManager = materialManager;
    this._pointCloudManager = pointCloudManager;
    this._effectRenderManager = new EffectRenderManager(this._materialManager);
  }

  public dispose(): void {
    if (this.isDisposed) {
      return;
    }
    this.isDisposed = true;
  }

  public resetRedraw(): void {
    this._cadManager.resetRedraw();
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
}
