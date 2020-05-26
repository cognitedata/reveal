/*!
 * Copyright 2020 Cognite AS
 */

import { RenderManager } from './RenderManager';
import { SectorGeometry } from '@/dataModels/cad/sector/types';
import { SectorQuads } from '@/dataModels/cad/rendering/types';
import { SectorCuller } from '@/internal';
import { CadManager } from '@/dataModels/cad/CadManager';
import { MaterialManager } from '@/dataModels/cad/MaterialManager';
import { ModelNodeAppearance } from '@/dataModels/cad';
import { PointCloudManager } from '@/dataModels/pointCloud/internal/PointCloudManager';

export interface RevealOptions {
  nodeAppearance?: ModelNodeAppearance;
  // internal options are experimental and may change in the future
  internal?: {
    parseCallback?: (parsed: { lod: string; data: SectorGeometry | SectorQuads }) => void;
    sectorCuller?: SectorCuller;
  };
}

export type OnDataUpdated = () => void;

export class RevealManagerBase<TModelIdentifier> implements RenderManager {
  // CAD
  protected readonly _cadManager: CadManager<TModelIdentifier>;
  protected readonly _materialManager: MaterialManager;

  // PointCloud
  protected readonly _pointCloudManager: PointCloudManager<TModelIdentifier>;

  constructor(
    cadManager: CadManager<TModelIdentifier>,
    materialManager: MaterialManager,
    pointCloudManager: PointCloudManager<TModelIdentifier>
  ) {
    this._cadManager = cadManager;
    this._materialManager = materialManager;
    this._pointCloudManager = pointCloudManager;
  }

  public resetRedraw(): void {
    this._cadManager.resetRedraw();
  }

  get needsRedraw(): boolean {
    return this._cadManager.needsRedraw || this._pointCloudManager.needsRedraw;
  }

  public update(camera: THREE.PerspectiveCamera) {
    this._cadManager.updateCamera(camera);
  }

  public set clippingPlanes(clippingPlanes: THREE.Plane[]) {
    this._materialManager.clippingPlanes = clippingPlanes;
  }

  public get clippingPlanes() {
    return this._materialManager.clippingPlanes;
  }

  public set clipIntersection(intersection: boolean) {
    this._materialManager.clipIntersection = intersection;
  }

  public get clipIntersection() {
    return this._materialManager.clipIntersection;
  }
}
