/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { LoadingState } from '@reveal/model-base';

import { PointCloudFactory } from './PointCloudFactory';
import { PointCloudNode } from './PointCloudNode';
import { PointCloudMetadataRepository } from './PointCloudMetadataRepository';
import { PotreeGroupWrapper } from './PotreeGroupWrapper';

import { auditTime, Observable, Subject } from 'rxjs';

import { ModelIdentifier } from '@reveal/modeldata-api';
import { MetricsLogger } from '@reveal/metrics';
import { SupportedModelTypes } from '@reveal/model-base';

export class PointCloudManager {
  private readonly _pointCloudMetadataRepository: PointCloudMetadataRepository;
  private readonly _pointCloudFactory: PointCloudFactory;
  private readonly _pointCloudGroupWrapper: PotreeGroupWrapper;

  private readonly _cameraSubject: Subject<THREE.PerspectiveCamera> = new Subject();

  private readonly _renderer: THREE.WebGLRenderer;

  constructor(metadataRepository: PointCloudMetadataRepository,
              modelFactory: PointCloudFactory,
              renderer: THREE.WebGLRenderer) {
    this._pointCloudMetadataRepository = metadataRepository;
    this._pointCloudFactory = modelFactory;
    this._pointCloudGroupWrapper = new PotreeGroupWrapper(modelFactory.potreeInstance);

    this._cameraSubject.pipe(auditTime(500)).subscribe((cam: THREE.PerspectiveCamera) => {
      this.updatePointClouds(cam);

    });

    this._renderer = renderer;
  }

  get pointCloudGroupWrapper() {
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
    this._pointCloudGroupWrapper.traverse(x => {
      if ((x as any).material) {
        const material = (x as THREE.Mesh).material as THREE.RawShaderMaterial;
        material.clipping = true;
        material.clipIntersection = false;
        material.clippingPlanes = planes;
      }
    });
  }

  getLoadingStateObserver(): Observable<LoadingState> {
    return this._pointCloudGroupWrapper.getLoadingStateObserver();
  }

  updatePointClouds(camera: THREE.PerspectiveCamera) {
    this._pointCloudGroupWrapper.potreeInstance.updatePointClouds(
      this._pointCloudGroupWrapper.pointClouds,
      camera,
      this._renderer);
  }

  updateCamera(camera: THREE.PerspectiveCamera): void {
    this._cameraSubject.next(camera);
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
    return node;
  }

  removeModel(node: PointCloudNode): void {
    this._pointCloudGroupWrapper.removePointCloud(node.potreeNode);
  }
}
