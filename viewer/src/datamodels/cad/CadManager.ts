/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import { Observable, Subscription } from 'rxjs';

import { CadNode } from './CadNode';
import { CadModelFactory } from './CadModelFactory';
import { CadModelMetadataRepository } from './CadModelMetadataRepository';
import { NodeAppearanceProvider } from './NodeAppearance';
import { SectorGeometry, SectorQuads } from './rendering/types';
import { MaterialManager } from './MaterialManager';
import { RenderMode } from './rendering/RenderMode';
import { LoadingState } from '../../utilities';
import { CadModelSectorBudget, defaultCadModelSectorBudget } from './CadModelSectorBudget';
import { CadSectorLoader } from './sector/CadSectorLoader';
import { SectorCuller } from './sector/culling/SectorCuller';
import { BinaryFileProvider } from '../../utilities/networking/types';
import { CadSectorParser } from './sector/CadSectorParser';
import { discardSector } from './sector/sectorUtilities';
import { trackError } from '../../utilities/metrics';

export class CadManager<TModelIdentifier> {
  private readonly _loader: CadSectorLoader;
  private readonly _materialManager: MaterialManager;
  private readonly _cadModelMetadataRepository: CadModelMetadataRepository<TModelIdentifier>;
  private readonly _cadModelFactory: CadModelFactory;

  private readonly _cadModelMap: Map<string, CadNode> = new Map();
  private readonly _subscription: Subscription = new Subscription();
  private _budget: CadModelSectorBudget = defaultCadModelSectorBudget;

  private _needsRedraw: boolean = false;
  private readonly _markNeedsRedrawBound = this.markNeedsRedraw.bind(this);

  get materialManager() {
    return this._materialManager;
  }

  get budget(): CadModelSectorBudget {
    return this._budget;
  }

  set budget(budget: CadModelSectorBudget) {
    this._budget = budget;
    this._loader.updateBudget(budget);
  }

  get needsRedraw(): boolean {
    return this._needsRedraw;
  }

  get renderMode(): RenderMode {
    return this._materialManager.getRenderMode();
  }

  set renderMode(renderMode: RenderMode) {
    this._materialManager.setRenderMode(renderMode);
  }

  get clippingPlanes(): THREE.Plane[] {
    return this._materialManager.clippingPlanes;
  }

  set clippingPlanes(clippingPlanes: THREE.Plane[]) {
    this._materialManager.clippingPlanes = clippingPlanes;
    this._loader.updateClippingPlanes(clippingPlanes);
    this.requestRedraw();
  }

  constructor(
    materialManger: MaterialManager,
    cadModelMetadataRepository: CadModelMetadataRepository<TModelIdentifier>,
    cadModelFactory: CadModelFactory,
    culler: SectorCuller,
    fileProvider: BinaryFileProvider,
    parser: CadSectorParser
  ) {
    this._loader = new CadSectorLoader(culler, fileProvider, parser, materialManger);
    this._materialManager = materialManger;
    this._cadModelMetadataRepository = cadModelMetadataRepository;
    this._cadModelFactory = cadModelFactory;
    this._subscription.add(
      this._loader.consumedSectorObservable().subscribe(
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
    this._loader.dispose();
    this._subscription.unsubscribe();
  }

  requestRedraw(): void {
    this._needsRedraw = true;
  }

  resetRedraw(): void {
    this._needsRedraw = false;
  }

  updateCamera(camera: THREE.PerspectiveCamera) {
    this._loader.updateCamera(camera);
    this._needsRedraw = true;
  }

  get clipIntersection(): boolean {
    return this._materialManager.clipIntersection;
  }

  set clipIntersection(clipIntersection: boolean) {
    this._materialManager.clipIntersection = clipIntersection;
    this._loader.updateClipIntersection(clipIntersection);
    this._needsRedraw = true;
  }

  async addModel(modelIdentifier: TModelIdentifier, nodeAppearanceProvider?: NodeAppearanceProvider): Promise<CadNode> {
    const metadata = await this._cadModelMetadataRepository.loadData(modelIdentifier);
    const model = this._cadModelFactory.createModel(metadata, nodeAppearanceProvider);
    model.addEventListener('update', this._markNeedsRedrawBound);
    this._cadModelMap.set(metadata.blobUrl, model);
    this._loader.addModel(model);
    return model;
  }

  removeModel(model: CadNode): void {
    const metadata = model.cadModelMetadata;
    if (!this._cadModelMap.delete(metadata.blobUrl)) {
      throw new Error(`Could not remove model ${metadata.blobUrl} because it's not added`);
    }
    model.removeEventListener('update', this._markNeedsRedrawBound);
    this._loader.removeModel(model);
  }

  getLoadingStateObserver(): Observable<LoadingState> {
    return this._loader.loadingStateObservable();
  }

  getParsedData(): Observable<{ blobUrl: string; lod: string; data: SectorGeometry | SectorQuads }> {
    return this._loader.parsedDataObservable();
  }

  private markNeedsRedraw(): void {
    this._needsRedraw = true;
  }
}
