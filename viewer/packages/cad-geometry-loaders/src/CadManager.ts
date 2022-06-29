/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { Subscription, Observable } from 'rxjs';

import { LevelOfDetail, ConsumedSector, CadModelMetadata } from '@reveal/cad-parsers';
import { CadModelUpdateHandler, CadModelBudget } from '@reveal/cad-geometry-loaders';
import { LoadingState } from '@reveal/model-base';
import { CadMaterialManager, RenderMode } from '@reveal/rendering';
import { File3dFormat, ModelIdentifier } from '@reveal/modeldata-api';
import { MetricsLogger } from '@reveal/metrics';
import { defaultDesktopCadModelBudget } from '@reveal/cad-geometry-loaders';
import { CadModelFactory, CadModelSectorLoadStatistics, CadNode, GeometryFilter } from '@reveal/cad-model';

export class CadManager {
  private readonly _materialManager: CadMaterialManager;
  private readonly _cadModelFactory: CadModelFactory;
  private readonly _cadModelUpdateHandler: CadModelUpdateHandler;

  private readonly _cadModelMap: Map<string, CadNode> = new Map();
  private readonly _subscription: Subscription = new Subscription();
  private _compatibleFileFormat:
    | {
        format: File3dFormat;
        version: number;
      }
    | undefined = undefined;

  private _needsRedraw: boolean = false;

  private readonly _markNeedsRedrawBound = this.markNeedsRedraw.bind(this);
  private readonly _materialsChangedListener = this.handleMaterialsChanged.bind(this);

  get materialManager(): CadMaterialManager {
    return this._materialManager;
  }

  get budget(): CadModelBudget {
    return this._cadModelUpdateHandler.budget;
  }

  set budget(budget: CadModelBudget) {
    this._cadModelUpdateHandler.budget = budget;

    // This gives cache size of 200 on desktop on default budget
    const REPOSITORY_CACHE_SIZE_TO_BUDGET_RATIO = 200 / defaultDesktopCadModelBudget.maximumRenderCost;

    for (const model of this._cadModelMap.values()) {
      model.setCacheSize(Math.floor(REPOSITORY_CACHE_SIZE_TO_BUDGET_RATIO * budget.maximumRenderCost));
    }
  }

  /**
   * Returns statistics about how data loaded (or data about to be loaded).
   */
  get loadedStatistics(): CadModelSectorLoadStatistics {
    return this._cadModelUpdateHandler.lastBudgetSpendage;
  }

  constructor(
    materialManger: CadMaterialManager,
    cadModelFactory: CadModelFactory,
    cadModelUpdateHandler: CadModelUpdateHandler
  ) {
    this._materialManager = materialManger;
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
        cadModel.removeBatchedSectorGeometries(sector.metadata.id);
      }

      if (
        sector.geometryBatchingQueue &&
        sector.geometryBatchingQueue.length > 0 &&
        sector.levelOfDetail === LevelOfDetail.Detailed
      ) {
        cadModel.batchGeometry(sector.geometryBatchingQueue, sector.metadata.id);
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
    this._materialManager.dispose();
    this._cadModelFactory.dispose();
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

  doesModelHaveCompatibleFormat(modelMetadata: CadModelMetadata): boolean {
    return (
      this._compatibleFileFormat === undefined ||
      (this._compatibleFileFormat.format === modelMetadata.format &&
        this._compatibleFileFormat.version === modelMetadata.formatVersion)
    );
  }

  updateModelCompatibilityFormat(modelMetadata: CadModelMetadata): void {
    this._compatibleFileFormat = this._compatibleFileFormat ?? {
      format: modelMetadata.format,
      version: modelMetadata.formatVersion
    };
  }

  async addModel(modelIdentifier: ModelIdentifier, geometryFilter?: GeometryFilter): Promise<CadNode> {
    const modelMetadata = await this._cadModelFactory.loadModelMetadata(modelIdentifier);

    if (!this.doesModelHaveCompatibleFormat(modelMetadata)) {
      throw Error(
        `The added model had format ${modelMetadata.format} and ` +
          `version ${modelMetadata.formatVersion} which is incompatible ` +
          `with previously added models of format ${this._compatibleFileFormat?.format} ` +
          `and version ${this._compatibleFileFormat?.version}`
      );
    }

    this.updateModelCompatibilityFormat(modelMetadata);

    const model = await this._cadModelFactory.createModel(modelMetadata, geometryFilter);
    model.addEventListener('update', this._markNeedsRedrawBound);
    this._cadModelMap.set(model.cadModelIdentifier, model);
    this._cadModelUpdateHandler.addModel(model);
    return model;
  }

  removeModel(model: CadNode): void {
    if (!this._cadModelMap.delete(model.cadModelIdentifier)) {
      throw new Error(`Could not remove model ${model.cadModelIdentifier} because it's not added`);
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
