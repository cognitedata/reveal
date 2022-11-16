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

import { ModelIdentifier } from '@reveal/data-providers';
import { MetricsLogger } from '@reveal/metrics';
import { SupportedModelTypes } from '@reveal/model-base';
import { PointCloudMaterialManager } from '@reveal/rendering';
import { PotreeNodeWrapper } from './PotreeNodeWrapper';

import { Mesh } from 'three';

export class PointCloudManager {
  private readonly _pointCloudMetadataRepository: PointCloudMetadataRepository;
  private readonly _pointCloudFactory: PointCloudFactory;
  private readonly _materialManager: PointCloudMaterialManager;
  private readonly _loadingStateHandler: PointCloudLoadingStateHandler;
  private readonly _potreeInstance: Potree;
  private readonly _pointCloudNodes: PotreeNodeWrapper[] = [];

  private readonly _cameraSubject: Subject<THREE.PerspectiveCamera> = new Subject();
  private readonly _modelSubject: Subject<{ modelIdentifier: ModelIdentifier; operation: 'add' | 'remove' }> =
    new Subject();
  private readonly _budgetSubject: Subject<number> = new Subject();

  private readonly _renderer: THREE.WebGLRenderer;

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
    this._potreeInstance = potreeInstance
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

  get pointCloudGroupWrapper(): PointCloudLoadingStateHandler {
    return this._loadingStateHandler;
  }

  requestRedraw(): void {
    this._loadingStateHandler.requestRedraw();
  }

  resetRedraw(): void {
    this._loadingStateHandler.resetRedraw();
  }

  get pointBudget(): number {
    return this._potreeInstance.pointBudget;
  }

  set pointBudget(points: number) {
    this._potreeInstance.pointBudget = points;
    this._budgetSubject.next(points);
  }

  get needsRedraw(): boolean {
    return this._loadingStateHandler.needsRedraw;
  }

  set clippingPlanes(planes: THREE.Plane[]) {
    this._materialManager.clippingPlanes = planes;
    this.requestRedraw();
  }

  getLoadingStateObserver(): Observable<LoadingState> {
    return this._loadingStateHandler.getLoadingStateObserver();
  }

  updatePointClouds(camera: THREE.PerspectiveCamera): void {
    this._potreeInstance.updatePointClouds(
      this._loadingStateHandler.pointClouds,
      camera,
      this._renderer
    );
  }

  updateCamera(camera: THREE.PerspectiveCamera): void {
    this._cameraSubject.next(camera);
    this._loadingStateHandler.requestRedraw();
  }

  async addModel(modelIdentifier: ModelIdentifier): Promise<PointCloudNode> {
    const metadata = await this._pointCloudMetadataRepository.loadData(modelIdentifier);

    const modelType: SupportedModelTypes = 'pointcloud';
    MetricsLogger.trackLoadModel(
      {
        type: modelType
      },
      modelIdentifier,
      metadata.formatVersion
    );

    const nodeWrapper = await this._pointCloudFactory.createModel(metadata);
    this._pointCloudNodes.push(nodeWrapper);
    this._loadingStateHandler.addPointCloud(nodeWrapper);
    const node = new PointCloudNode(nodeWrapper, metadata.cameraConfiguration);
    node.setModelTransformation(metadata.modelMatrix);

    this._modelSubject.next({ modelIdentifier, operation: 'add' });
    this._materialManager.setClippingPlanesForPointCloud(modelIdentifier.revealInternalId);

    return node;
  }

  removeModel(node: PointCloudNode): void {
    const index = this._pointCloudNodes.indexOf(node.potreeNode);
    if (index === -1) {
      throw new Error('Point cloud is not added - cannot remove it');
    }
    this._pointCloudNodes.splice(index, 1);

    this._materialManager.removeModelMaterial(node.potreeNode.modelIdentifier);
  }

  dispose(): void {
    this._pointCloudFactory.dispose();
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
      this._loadingStateHandler.updatePointBuffersHash();
    };

    return drawResetTriggerMesh;
  }
}
