/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { Subscription, Observable } from 'rxjs';

import { CadModelFactory } from './CadModelFactory';
import { CadModelSectorLoadStatistics } from './CadModelSectorLoadStatistics';
import { GeometryFilter } from '../..';
import { CadModelClipper } from './sector/CadModelClipper';

import { CadModelMetadataRepository, CadModelMetadata, LevelOfDetail, ConsumedSector } from '@reveal/cad-parsers';
import { CadModelUpdateHandler, CadModelSectorBudget, LoadingState } from '@reveal/cad-geometry-loaders';
import { CadNode, CadMaterialManager, RenderMode } from '@reveal/rendering';
import { MetricsLogger } from '@reveal/metrics';
import { ModelIdentifier } from '@reveal/modeldata-api';

export class CadManager {
  private readonly _materialManager: CadMaterialManager;
  private readonly _cadModelMetadataRepository: CadModelMetadataRepository;
  private readonly _cadModelFactory: CadModelFactory;
  private readonly _cadModelUpdateHandler: CadModelUpdateHandler;

  private readonly _cadModelMap: Map<string, CadNode> = new Map();
  private readonly _subscription: Subscription = new Subscription();

  private _needsRedraw: boolean = false;

  private readonly _markNeedsRedrawBound = this.markNeedsRedraw.bind(this);
  private readonly _materialsChangedListener = this.handleMaterialsChanged.bind(this);

  get materialManager(): CadMaterialManager {
    return this._materialManager;
  }

  get budget(): CadModelSectorBudget {
    return this._cadModelUpdateHandler.budget;
  }

  set budget(budget: CadModelSectorBudget) {
    this._cadModelUpdateHandler.budget = budget;
  }

  /**
   * Returns statistics about how data loaded (or data about to be loaded).
   */
  get loadedStatistics(): CadModelSectorLoadStatistics {
    return this._cadModelUpdateHandler.lastBudgetSpendage;
  }

  constructor(
    materialManger: CadMaterialManager,
    cadModelMetadataRepository: CadModelMetadataRepository,
    cadModelFactory: CadModelFactory,
    cadModelUpdateHandler: CadModelUpdateHandler
  ) {
    this._materialManager = materialManger;
    this._cadModelMetadataRepository = cadModelMetadataRepository;
    this._cadModelFactory = cadModelFactory;
    this._cadModelUpdateHandler = cadModelUpdateHandler;
    this._materialManager.on('materialsChanged', this._materialsChangedListener);

    const consumeNextSector = (sector: ConsumedSector) => {
      const cadModel = this._cadModelMap.get(sector.modelIdentifier);
      if (!cadModel) {
        // Model has been removed - results can come in for a period just after removal
        return;
      }

      if (sector.instancedMeshes && sector.levelOfDetail === LevelOfDetail.Detailed) {
        cadModel.updateInstancedMeshes(sector.instancedMeshes, sector.modelIdentifier, sector.metadata.id);
      } else if (sector.levelOfDetail === LevelOfDetail.Simple || sector.levelOfDetail === LevelOfDetail.Discarded) {
        cadModel.discardInstancedMeshes(sector.metadata.id);
      }

      const sectorNodeParent = cadModel.rootSector;
      const sectorNode = sectorNodeParent!.sectorNodeMap.get(sector.metadata.id);
      if (!sectorNode) {
        throw new Error(`Could not find 3D node for sector ${sector.metadata.id} - invalid id?`);
      }
      if (sector.group) {
        sectorNode.add(sector.group);
      }
      sectorNode.updateGeometry(sector.group, sector.levelOfDetail);
      this.markNeedsRedraw();
    };

    this._subscription.add(
      this._cadModelUpdateHandler.consumedSectorObservable().subscribe({
        next: consumeNextSector,
        error: error => {
          MetricsLogger.trackError(error, {
            moduleName: 'CadManager',
            methodName: 'constructor'
          });
        }
      })
    );
  }

  dispose(): void {
    this._cadModelUpdateHandler.dispose();
    this._subscription.unsubscribe();
    this._materialManager.off('materialsChanged', this._materialsChangedListener);
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

  updateCamera(camera: THREE.PerspectiveCamera): void {
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

  get renderMode(): RenderMode {
    return this._materialManager.getRenderMode();
  }

  set renderMode(renderMode: RenderMode) {
    this._materialManager.setRenderMode(renderMode);
  }

  async addModel(modelIdentifier: ModelIdentifier, geometryFilter?: GeometryFilter): Promise<CadNode> {
    const metadata = await this._cadModelMetadataRepository.loadData(modelIdentifier);
    if (this._cadModelMap.has(metadata.modelIdentifier)) {
      throw new Error(`Model ${modelIdentifier} has already been added`);
    }
    // Apply clipping box
    const geometryClipBox = determineGeometryClipBox(geometryFilter, metadata);
    const clippedMetadata = createClippedModel(metadata, geometryClipBox);

    const model = this._cadModelFactory.createModel(clippedMetadata);
    model.addEventListener('update', this._markNeedsRedrawBound);
    this._cadModelMap.set(metadata.modelIdentifier, model);
    this._cadModelUpdateHandler.addModel(model);
    return model;
  }

  removeModel(model: CadNode): void {
    const metadata = model.cadModelMetadata;
    if (!this._cadModelMap.delete(metadata.modelIdentifier)) {
      throw new Error(`Could not remove model ${metadata.modelIdentifier} because it's not added`);
    }
    model.removeEventListener('update', this._markNeedsRedrawBound);
    this._cadModelUpdateHandler.removeModel(model);
  }

  getLoadingStateObserver(): Observable<LoadingState> {
    return this._cadModelUpdateHandler.getLoadingStateObserver();
  }

  private markNeedsRedraw(): void {
    this._needsRedraw = true;
  }

  private handleMaterialsChanged() {
    this.requestRedraw();
  }
}

function determineGeometryClipBox(
  geometryFilter: GeometryFilter | undefined,
  cadModel: CadModelMetadata
): THREE.Box3 | null {
  if (geometryFilter === undefined || geometryFilter.boundingBox === undefined) {
    return null;
  }
  if (!geometryFilter.isBoundingBoxInModelCoordinates) {
    return geometryFilter.boundingBox;
  }

  const bbox = geometryFilter.boundingBox.clone();
  bbox.applyMatrix4(cadModel.inverseModelMatrix);
  return bbox;
}

function createClippedModel(cadModel: CadModelMetadata, geometryClipBox: THREE.Box3 | null): CadModelMetadata {
  if (geometryClipBox === null) {
    return cadModel;
  }

  const clipper = new CadModelClipper(geometryClipBox);
  return clipper.createClippedModel(cadModel);
}
