/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import { CadNode } from './CadNode';
import { CadModelFactory } from './CadModelFactory';
import { CadModelMetadataRepository } from './CadModelMetadataRepository';
import { CadModelUpdateHandler } from './CadModelUpdateHandler';
import { discardSector } from './sector/sectorUtilities';
import { Subscription, Observable } from 'rxjs';
import { NodeAppearanceProvider } from './NodeAppearance';
import { trackError } from '@/utilities/metrics';
import { SectorGeometry } from './sector/types';
import { SectorQuads } from './rendering/types';
import { MaterialManager } from './MaterialManager';
import { RenderMode } from './rendering/RenderMode';
import { Progress } from '@/utilities/types';

export class CadManager<TModelIdentifier> {
  private readonly _materialManager: MaterialManager;
  private readonly _cadModelMetadataRepository: CadModelMetadataRepository<TModelIdentifier>;
  private readonly _cadModelFactory: CadModelFactory;
  private readonly _cadModelUpdateHandler: CadModelUpdateHandler;

  private readonly _cadModelMap: Map<string, CadNode> = new Map();
  private readonly _subscription: Subscription = new Subscription();

  private _needsRedraw: boolean = false;

  get materialManager() {
    return this._materialManager;
  }

  constructor(
    materialManger: MaterialManager,
    cadModelMetadataRepository: CadModelMetadataRepository<TModelIdentifier>,
    cadModelFactory: CadModelFactory,
    cadModelUpdateHandler: CadModelUpdateHandler
  ) {
    this._materialManager = materialManger;
    this._cadModelMetadataRepository = cadModelMetadataRepository;
    this._cadModelFactory = cadModelFactory;
    this._cadModelUpdateHandler = cadModelUpdateHandler;
    this._subscription.add(
      this._cadModelUpdateHandler.consumedSectorObservable().subscribe(
        sector => {
          const cadModel = this._cadModelMap.get(sector.blobUrl);
          if (!cadModel) {
            throw new Error(`Model ${sector.blobUrl} not found`);
          }
          if (cadModel.renderHints.showSectorBoundingBoxes) {
            cadModel!.updateSectorBoundingBox(sector);
          }
          const sectorNodeParent = cadModel.rootSector;
          const sectorNode = sectorNodeParent!.sectorNodeMap.get(sector.metadata.id);
          if (!sectorNode) {
            throw new Error(`Could not find 3D node for sector ${sector.metadata.id} - invalid id?`);
          }
          if (sectorNode.group) {
            sectorNode.group.userData.refCount -= 1;
            if (sectorNode.group.userData.refCount === 0) {
              discardSector(sectorNode.group);
            }
            sectorNode.remove(sectorNode.group);
          }
          if (sector.group) {
            // Is this correct now?
            sectorNode.add(sector.group);
          }
          sectorNode.group = sector.group;
          this._needsRedraw = true;
        },
        error => {
          trackError(error, {
            moduleName: 'CadManager',
            methodName: 'constructor'
          });
        }
      )
    );
  }

  dispose() {
    this._subscription.unsubscribe();
  }

  requestRedraw(): void {
    this._needsRedraw = true;
  }

  resetRedraw(): void {
    this._needsRedraw = false;
  }

  get needsRedraw(): boolean {
    return this._needsRedraw;
  }

  updateCamera(camera: THREE.PerspectiveCamera) {
    this._cadModelUpdateHandler.updateCamera(camera);
    this._needsRedraw = true;
  }

  get clippingPlanes(): THREE.Plane[] {
    return this._materialManager.clippingPlanes;
  }

  set clippingPlanes(clippingPlanes: THREE.Plane[]) {
    this._materialManager.clippingPlanes = clippingPlanes;
    this._cadModelUpdateHandler.clippingPlanes = clippingPlanes;
    this._needsRedraw = true;
  }

  get clipIntersection(): boolean {
    return this._materialManager.clipIntersection;
  }

  set clipIntersection(clipIntersection: boolean) {
    this._materialManager.clipIntersection = clipIntersection;
    this._cadModelUpdateHandler.clipIntersection = clipIntersection;
    this._needsRedraw = true;
  }

  get renderMode(): RenderMode {
    return this._materialManager.getRenderMode();
  }

  set renderMode(renderMode: RenderMode) {
    this._materialManager.setRenderMode(renderMode);
  }

  async addModel(modelIdentifier: TModelIdentifier, nodeApperanceProvider?: NodeAppearanceProvider): Promise<CadNode> {
    const metadata = await this._cadModelMetadataRepository.loadData(modelIdentifier);
    const model = this._cadModelFactory.createModel(metadata, nodeApperanceProvider);
    model.addEventListener('update', () => {
      this._needsRedraw = true;
    });
    this._cadModelMap.set(metadata.blobUrl, model);
    this._cadModelUpdateHandler.updateModels(model);
    return model;
  }

  getLoadingProgressObserver(): Observable<Progress> {
    return this._cadModelUpdateHandler.getLoadingProgressObserver();
  }

  getParsedData(): Observable<{ blobUrl: string; lod: string; data: SectorGeometry | SectorQuads }> {
    return this._cadModelUpdateHandler.getParsedData();
  }
}
