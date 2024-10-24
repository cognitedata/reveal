/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { assertNever } from '@reveal/utilities';
import { LoadingState } from '@reveal/model-base';

import { PointCloudFactory } from './PointCloudFactory';
import { PointCloudNode } from './PointCloudNode';
import { PointCloudMetadataRepository } from './PointCloudMetadataRepository';
import { PointCloudLoadingStateHandler } from './PointCloudLoadingStateHandler';
import { Potree } from './potree-three-loader';

import { asyncScheduler, combineLatest, Observable, scan, Subject, throttleTime } from 'rxjs';

import { ModelIdentifier, InternalDataSourceType } from '@reveal/data-providers';
import { MetricsLogger } from '@reveal/metrics';
import { SupportedModelTypes } from '@reveal/model-base';
import { PointCloudMaterialManager } from '@reveal/rendering';

import { Mesh } from 'three';
import { createModelIdentifier } from '@reveal/data-providers/src/ModelIdentifier';
import { AddModelOptionsWithModelRevisionId } from '@reveal/api';

export class PointCloudManager {
  private readonly _pointCloudMetadataRepository: PointCloudMetadataRepository;
  private readonly _pointCloudFactory: PointCloudFactory;
  private readonly _materialManager: PointCloudMaterialManager;
  private readonly _loadingStateHandler: PointCloudLoadingStateHandler;
  private readonly _potreeInstance: Potree;
  private readonly _pointCloudNodes: PointCloudNode[] = [];
  private _globalClippingPlanes: THREE.Plane[] = [];

  private readonly _cameraSubject: Subject<THREE.PerspectiveCamera> = new Subject();
  private readonly _modelSubject: Subject<{ modelIdentifier: ModelIdentifier; operation: 'add' | 'remove' }> =
    new Subject();
  private readonly _budgetSubject: Subject<number> = new Subject();

  private readonly _renderer: THREE.WebGLRenderer;

  private _needsRedraw: boolean = false;

  constructor(
    metadataRepository: PointCloudMetadataRepository,
    materialManager: PointCloudMaterialManager,
    modelFactory: PointCloudFactory,
    potreeInstance: Potree,
    scene: THREE.Scene,
    renderer: THREE.WebGLRenderer
  ) {
    this._pointCloudMetadataRepository = metadataRepository;
    this._pointCloudFactory = modelFactory;
    this._materialManager = materialManager;
    this._potreeInstance = potreeInstance;
    this._loadingStateHandler = new PointCloudLoadingStateHandler();

    scene.add(this.createDrawResetTrigger());

    combineLatest([this._cameraSubject, this.loadedModelsObservable(), this._budgetSubject])
      .pipe(throttleTime(500, asyncScheduler, { leading: true, trailing: true }))
      .subscribe(([cam, _models, _budget]: [THREE.PerspectiveCamera, ModelIdentifier[], number]) => {
        this.updatePointClouds(cam);
      });

    this._budgetSubject.next(this._potreeInstance.pointBudget);

    this._renderer = renderer;
  }

  requestRedraw(): void {
    this._needsRedraw = true;
  }

  resetRedraw(): void {
    this._needsRedraw = false;
    this._pointCloudNodes.forEach(n => n.resetRedraw());
    this._loadingStateHandler.resetFrameStats();
  }

  get pointBudget(): number {
    return this._potreeInstance.pointBudget;
  }

  set pointBudget(points: number) {
    this._potreeInstance.pointBudget = points;
    this._budgetSubject.next(points);
  }

  get needsRedraw(): boolean {
    return (
      this._needsRedraw ||
      this._loadingStateHandler.needsRedraw(this._pointCloudNodes) ||
      this._pointCloudNodes.some(n => n.needsRedraw)
    );
  }

  set clippingPlanes(planes: THREE.Plane[]) {
    this._globalClippingPlanes = planes;
    this._pointCloudNodes.forEach(node => node.octree.setGlobalClippingPlane(planes));
    this.requestRedraw();
  }

  getLoadingStateObserver(): Observable<LoadingState> {
    return this._loadingStateHandler.getLoadingStateObserver();
  }

  updatePointClouds(camera: THREE.PerspectiveCamera): void {
    const octrees = this._pointCloudNodes.filter(node => node.visible).map(node => node.octree);
    this._potreeInstance.updatePointClouds(octrees, camera, this._renderer);
  }

  updateCamera(camera: THREE.PerspectiveCamera): void {
    this._cameraSubject.next(camera);
    this.requestRedraw();
  }

  async addModel<T extends InternalDataSourceType>(
    identifier: AddModelOptionsWithModelRevisionId<T>
  ): Promise<PointCloudNode<T>> {
    const modelIdentifier = createModelIdentifier({ ...identifier, ...identifier.classicModelRevisionId });

    const metadata = await this._pointCloudMetadataRepository.loadData(modelIdentifier);

    const modelType: SupportedModelTypes = 'pointcloud';
    MetricsLogger.trackLoadModel(
      {
        type: modelType
      },
      modelIdentifier,
      metadata.formatVersion
    );

    const pointCloudNode = await this._pointCloudFactory.createModel<T>(identifier, modelIdentifier, metadata);
    this._pointCloudNodes.push(pointCloudNode);

    this.requestRedraw();
    this._loadingStateHandler.onModelAdded();

    this._modelSubject.next({ modelIdentifier, operation: 'add' });
    this._materialManager.initializeClippingPlanesForPointCloud(
      modelIdentifier.revealInternalId,
      this._globalClippingPlanes
    );

    return pointCloudNode;
  }

  removeModel<T extends InternalDataSourceType>(node: PointCloudNode<T>): void {
    const index = this._pointCloudNodes.indexOf(node);
    if (index === -1) {
      throw new Error('Point cloud is not added - cannot remove it');
    }
    node.dispose();
    this._pointCloudNodes.splice(index, 1);
    this._potreeInstance.reset();

    this._materialManager.removeModelMaterial(node.modelIdentifier);

    this._loadingStateHandler.onModelRemoved();
  }

  dispose(): void {
    this._pointCloudFactory.dispose();
    this._pointCloudNodes.forEach(n => {
      this._materialManager.removeModelMaterial(n.modelIdentifier);
      n.dispose();
    });
  }

  private loadedModelsObservable() {
    return this._modelSubject.pipe(
      scan((array, next) => {
        const { modelIdentifier, operation } = next;
        switch (operation) {
          case 'add':
            array.push(modelIdentifier);
            return array;
          case 'remove':
            return array.filter(x => x !== modelIdentifier);
          default:
            assertNever(operation);
        }
      }, [] as ModelIdentifier[])
    );
  }

  createDrawResetTrigger(): Mesh {
    const drawResetTriggerMesh = new THREE.Mesh(new THREE.BufferGeometry());
    drawResetTriggerMesh.name = 'onAfterRender trigger (no geometry)';
    drawResetTriggerMesh.frustumCulled = false;
    drawResetTriggerMesh.onAfterRender = () => {
      this.resetRedraw();
      // We only reset this when we actually redraw, not on resetRedraw. This is
      // because there are times when this will onAfterRender is triggered
      // just after buffers are uploaded but not visualized yet.
      this._loadingStateHandler.updatePointBuffersHash(this._pointCloudNodes);
    };

    return drawResetTriggerMesh;
  }
}
