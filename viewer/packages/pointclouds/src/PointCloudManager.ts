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

import { CdfModelIdentifier, ModelIdentifier } from '@reveal/modeldata-api';
import { MetricsLogger } from '@reveal/metrics';
import { SupportedModelTypes } from '@reveal/model-base';
import { StyledObjectInfo } from './styling/StyledObjectInfo';
import { CogniteClientPlayground } from '@cognite/sdk-playground';
import { BoundingVolume } from './annotationTypes';
import { annotationsToObjectInfo } from './styling/annotationsToObjects';

export class PointCloudManager {
  private readonly _pointCloudMetadataRepository: PointCloudMetadataRepository;
  private readonly _pointCloudFactory: PointCloudFactory;
  private readonly _pointCloudGroupWrapper: PotreeGroupWrapper;

  private readonly _sdkPlayground: CogniteClientPlayground | undefined;

  private readonly _cameraSubject: Subject<THREE.PerspectiveCamera> = new Subject();
  private readonly _modelSubject: Subject<{ modelIdentifier: ModelIdentifier; operation: 'add' | 'remove' }> =
    new Subject();
  private readonly _budgetSubject: Subject<number> = new Subject();

  private readonly _renderer: THREE.WebGLRenderer;

  private _clippingPlanes: THREE.Plane[] = [];

  constructor(
    metadataRepository: PointCloudMetadataRepository,
    modelFactory: PointCloudFactory,
    scene: THREE.Scene,
    renderer: THREE.WebGLRenderer,
    sdkPlayground?: CogniteClientPlayground
  ) {
    this._pointCloudMetadataRepository = metadataRepository;
    this._pointCloudFactory = modelFactory;
    this._pointCloudGroupWrapper = new PotreeGroupWrapper(modelFactory.potreeInstance);

    this._sdkPlayground = sdkPlayground;

    scene.add(this._pointCloudGroupWrapper);

    combineLatest([this._cameraSubject, this.loadedModelsObservable(), this._budgetSubject])
      .pipe(throttleTime(500, asyncScheduler, { leading: true, trailing: true }))
      .subscribe(([cam, _models, _budget]: [THREE.PerspectiveCamera, ModelIdentifier[], number]) => {
        this.updatePointClouds(cam);
      });

    this._budgetSubject.next(this._pointCloudGroupWrapper.pointBudget);

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
    this._budgetSubject.next(points);
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

  private async getAnnotations(modelIdentifier: ModelIdentifier): Promise<BoundingVolume[]> {
    const modelAnnotations = await this._sdkPlayground.annotations.list({
      filter: {
        // @ts-ignore
        annotatedResourceType: 'threedmodel',
        annotatedResourceIds: [{ id: (modelIdentifier as CdfModelIdentifier).modelId }]
      }
    });

    const bvs: BoundingVolume[] = [];

    for (const annotation of modelAnnotations.items) {
      const bv: BoundingVolume = {
        annotationId: annotation.id,
        region: []
      };

      for (const geometry of (annotation.data as any).region) {
        if (geometry.box) {
          bv.region.push({
            matrix: new THREE.Matrix4().fromArray(geometry.box.matrix)
          });
        }
        if (geometry.cylinder) {
          bv.region.push(geometry.cylinder);
        }
      }

      bvs.push(bv);
    }

    return bvs;
  }

  async addModel(modelIdentifier: ModelIdentifier): Promise<PointCloudNode> {
    const metadata = await this._pointCloudMetadataRepository.loadData(modelIdentifier);

    let styledObjectInfo: StyledObjectInfo | undefined = undefined;
    if (this._sdkPlayground) {
      const annotations = await this.getAnnotations(modelIdentifier);
      styledObjectInfo = annotationsToObjectInfo(annotations);
    }

    const modelType: SupportedModelTypes = 'pointcloud';
    MetricsLogger.trackLoadModel(
      {
        type: modelType
      },
      modelIdentifier,
      metadata.formatVersion
    );

    const nodeWrapper = await this._pointCloudFactory.createModel(metadata, styledObjectInfo);
    this._pointCloudGroupWrapper.addPointCloud(nodeWrapper);
    const node = new PointCloudNode(
      this._pointCloudGroupWrapper,
      nodeWrapper,
      metadata.cameraConfiguration
    );
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
