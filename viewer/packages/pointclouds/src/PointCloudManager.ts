/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { assertNever } from '@reveal/utilities';
import { LoadingState } from '@reveal/model-base';

import { PointCloudFactory } from './PointCloudFactory';
import { PointCloudNode } from './PointCloudNode';
import { PointCloudMetadataRepository } from './PointCloudMetadataRepository';
import { PotreeGroupWrapper } from './PotreeGroupWrapper';
import { PointCloudOctree } from './potree-three-loader';

import { asyncScheduler, combineLatest, Observable, scan, Subject, throttleTime } from 'rxjs';

import { ModelIdentifier } from '@reveal/modeldata-api';
import { MetricsLogger } from '@reveal/metrics';
import { SupportedModelTypes } from '@reveal/model-base';

export class PointCloudManager {
  private readonly _pointCloudMetadataRepository: PointCloudMetadataRepository;
  private readonly _pointCloudFactory: PointCloudFactory;
  private readonly _pointCloudGroupWrapper: PotreeGroupWrapper;

  private readonly _cameraSubject: Subject<THREE.PerspectiveCamera> = new Subject();
  private readonly _modelSubject: Subject<{ modelIdentifier: ModelIdentifier; operation: 'add' | 'remove' }> =
    new Subject();

  private readonly _renderer: THREE.WebGLRenderer;

  private _clippingPlanes: THREE.Plane[] = [];

  constructor(
    metadataRepository: PointCloudMetadataRepository,
    modelFactory: PointCloudFactory,
    renderer: THREE.WebGLRenderer
  ) {
    this._pointCloudMetadataRepository = metadataRepository;
    this._pointCloudFactory = modelFactory;
    this._pointCloudGroupWrapper = new PotreeGroupWrapper(modelFactory.potreeInstance);

    combineLatest([this._cameraSubject, this.loadedModelsObservable()])
      .pipe(throttleTime(500, asyncScheduler, { leading: true, trailing: true }))
      .subscribe(([cam, _models]: [THREE.PerspectiveCamera, ModelIdentifier[]]) => {
        this.updatePointClouds(cam);
      });

    this._renderer = renderer;
  }

  get pointCloudGroupWrapper(): PotreeGroupWrapper {
    return this._pointCloudGroupWrapper;
  }

  requestRedraw(): void {
    this._pointCloudGroupWrapper.requestRedraw();
  }

  resetRedraw(): void {
    this._pointCloudGroupWrapper.resetRedraw();
  }

  get pointBudget(): number {
    return this._pointCloudGroupWrapper.pointBudget;
  }

  set pointBudget(points: number) {
    this._pointCloudGroupWrapper.pointBudget = points;
  }

  get needsRedraw(): boolean {
    return this._pointCloudGroupWrapper.needsRedraw;
  }

  set clippingPlanes(planes: THREE.Plane[]) {
    this._clippingPlanes = planes;

    this._pointCloudGroupWrapper.traversePointClouds(cloud => this.setClippingPlanesForPointCloud(cloud));
  }

  setClippingPlanesForPointCloud(octree: PointCloudOctree): void {
    const material = octree.material;
    material.clipping = true;
    material.clipIntersection = false;
    material.clippingPlanes = this._clippingPlanes;

    material.defines = {
      ...material.defines,
      NUM_CLIPPING_PLANES: this._clippingPlanes.length,
      UNION_CLIPPING_PLANES: 0
    };
  }

  getLoadingStateObserver(): Observable<LoadingState> {
    return this._pointCloudGroupWrapper.getLoadingStateObserver();
  }

  updatePointClouds(camera: THREE.PerspectiveCamera): void {
    this._pointCloudGroupWrapper.potreeInstance.updatePointClouds(
      this._pointCloudGroupWrapper.pointClouds,
      camera,
      this._renderer
    );
  }

  updateCamera(camera: THREE.PerspectiveCamera): void {
    this._cameraSubject.next(camera);
    this._pointCloudGroupWrapper.requestRedraw();
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
    this._pointCloudGroupWrapper.addPointCloud(nodeWrapper);
    const node = new PointCloudNode(this._pointCloudGroupWrapper, nodeWrapper, metadata.cameraConfiguration);
    node.setModelTransformation(metadata.modelMatrix);

    this._modelSubject.next({ modelIdentifier, operation: 'add' });
    this.setClippingPlanesForPointCloud(nodeWrapper.octree);

    return node;
  }

  removeModel(node: PointCloudNode): void {
    this._pointCloudGroupWrapper.removePointCloud(node.potreeNode);
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
}
