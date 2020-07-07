/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';

import { RenderManager } from './RenderManager';
import { CadManager } from '@/datamodels/cad/CadManager';
import { MaterialManager } from '@/datamodels/cad/MaterialManager';
import { PointCloudManager } from '@/datamodels/pointcloud/PointCloudManager';
import {
  SectorNodeIdToTreeIndexMapLoadedListener,
  SectorNodeIdToTreeIndexMapLoadedEvent,
  RevealOptions,
  LoadingStateChangeListener
} from './types';
import { Subscription, combineLatest } from 'rxjs';
import { CachedRepository } from '@/datamodels/cad/sector/CachedRepository';
import { CadSectorParser } from '@/datamodels/cad/sector/CadSectorParser';
import { SimpleAndDetailedToSector3D } from '@/datamodels/cad/sector/SimpleAndDetailedToSector3D';
import { CadModelUpdateHandler } from '@/datamodels/cad/CadModelUpdateHandler';
import { ByVisibilityGpuSectorCuller } from '@/datamodels/cad/sector/culling/ByVisibilityGpuSectorCuller';
import { CadModelMetadataRepository } from '@/datamodels/cad/CadModelMetadataRepository';
import { ModelDataClient } from '@/utilities/networking/types';
import { DefaultCadTransformation } from '@/datamodels/cad/DefaultCadTransformation';
import { CadMetadataParser } from '@/datamodels/cad/parsers/CadMetadataParser';
import { CadModelFactory } from '@/datamodels/cad/CadModelFactory';
import { PointCloudMetadataRepository } from '@/datamodels/pointcloud/PointCloudMetadataRepository';
import { DefaultPointCloudTransformation } from '@/datamodels/pointcloud/DefaultPointCloudTransformation';
import { PointCloudFactory } from '@/datamodels/pointcloud/PointCloudFactory';
import { SectorCuller } from '@/datamodels/cad/sector/culling/SectorCuller';
import { distinctUntilChanged, map, share, filter } from 'rxjs/operators';
import { trackError, trackLoadModel } from '@/utilities/metrics';
import { NodeAppearanceProvider, CadNode } from '@/datamodels/cad';
import { PotreeGroupWrapper } from '@/datamodels/pointcloud/PotreeGroupWrapper';
import { PotreeNodeWrapper } from '@/datamodels/pointcloud/PotreeNodeWrapper';
import { RenderMode } from '@/datamodels/cad/rendering/RenderMode';
import { File3dFormat } from '@/utilities';

type ModelIdentifierWithFormat<T> = T & { format: File3dFormat };

export class RevealManagerBase<TModelIdentifier> implements RenderManager {
  private readonly _cadManager: CadManager<TModelIdentifier>;
  private readonly _pointCloudManager: PointCloudManager<TModelIdentifier>;

  private readonly _lastCamera = {
    position: new THREE.Vector3(NaN, NaN, NaN),
    quaternion: new THREE.Quaternion(NaN, NaN, NaN, NaN),
    zoom: NaN
  };

  private _isDisposed = false;
  private readonly _subscriptions = new Subscription();
  private readonly eventListeners = {
    sectorNodeIdToTreeIndexMapLoaded: new Array<SectorNodeIdToTreeIndexMapLoadedListener>(),
    loadingStateChanged: new Array<LoadingStateChangeListener>()
  };

  constructor(cadManager: CadManager<TModelIdentifier>, pointCloudManager: PointCloudManager<TModelIdentifier>);
  constructor(client: ModelDataClient<ModelIdentifierWithFormat<TModelIdentifier>>, options: RevealOptions);
  constructor(
    clientOrCadManager: ModelDataClient<ModelIdentifierWithFormat<TModelIdentifier>> | CadManager<TModelIdentifier>,
    optionsOrPointCloudManager: RevealOptions | PointCloudManager<TModelIdentifier>
  ) {
    if (clientOrCadManager instanceof CadManager) {
      this._cadManager = clientOrCadManager;
      this._pointCloudManager = optionsOrPointCloudManager as PointCloudManager<TModelIdentifier>;
    } else {
      const client = clientOrCadManager;
      const options = optionsOrPointCloudManager as RevealOptions;
      const sectorCuller = (options.internal && options.internal.sectorCuller) || new ByVisibilityGpuSectorCuller();
      const materialManager = new MaterialManager();
      const cadRepository = this.initCadRepository(client, materialManager);
      this._cadManager = this.initCadManager(client, cadRepository, materialManager, sectorCuller);
      this._pointCloudManager = this.initPointCloudManager(client);
    }
    this.initLoadingStateObserver(this._cadManager, this._pointCloudManager);
  }

  public dispose(): void {
    if (this._isDisposed) {
      return;
    }
    this._cadManager.dispose();
    this._subscriptions.unsubscribe();
    this._isDisposed = true;
  }

  public requestRedraw(): void {
    this._cadManager.requestRedraw();
    this._pointCloudManager.requestRedraw();
  }

  public resetRedraw(): void {
    this._cadManager.resetRedraw();
  }

  get needsRedraw(): boolean {
    return this._cadManager.needsRedraw || this._pointCloudManager.needsRedraw;
  }

  public update(camera: THREE.PerspectiveCamera) {
    const hasCameraChanged =
      this._lastCamera.zoom !== camera.zoom ||
      !this._lastCamera.position.equals(camera.position) ||
      !this._lastCamera.quaternion.equals(camera.quaternion);

    if (hasCameraChanged) {
      this._lastCamera.position.copy(camera.position);
      this._lastCamera.quaternion.copy(camera.quaternion);
      this._lastCamera.zoom = camera.zoom;

      this._cadManager.updateCamera(camera);
    }
  }

  public get renderMode(): RenderMode {
    return this._cadManager.renderMode;
  }

  public set renderMode(renderMode: RenderMode) {
    this._cadManager.renderMode = renderMode;
  }

  public set clippingPlanes(clippingPlanes: THREE.Plane[]) {
    this._cadManager.clippingPlanes = clippingPlanes;
  }

  public get clippingPlanes(): THREE.Plane[] {
    return this._cadManager.clippingPlanes;
  }

  public set clipIntersection(intersection: boolean) {
    this._cadManager.clipIntersection = intersection;
  }

  public get clipIntersection() {
    return this._cadManager.clipIntersection;
  }

  public on(event: 'loadingStateChanged', listener: LoadingStateChangeListener): void;
  public on(event: 'nodeIdToTreeIndexMapLoaded', listener: SectorNodeIdToTreeIndexMapLoadedListener): void;
  public on(
    event: 'loadingStateChanged' | 'nodeIdToTreeIndexMapLoaded',
    listener: LoadingStateChangeListener | SectorNodeIdToTreeIndexMapLoadedListener
  ): void {
    switch (event) {
      case 'loadingStateChanged':
        this.eventListeners.loadingStateChanged.push(listener as LoadingStateChangeListener);
        break;

      case 'nodeIdToTreeIndexMapLoaded':
        this.eventListeners.sectorNodeIdToTreeIndexMapLoaded.push(listener as SectorNodeIdToTreeIndexMapLoadedListener);
        break;

      default:
        throw new Error(`Unsupported event '${event}'`);
    }
  }

  public off(event: 'loadingStateChanged', listener: LoadingStateChangeListener): void;
  public off(event: 'nodeIdToTreeIndexMapLoaded', listener: SectorNodeIdToTreeIndexMapLoadedListener): void;
  public off(
    event: 'loadingStateChanged' | 'nodeIdToTreeIndexMapLoaded',
    listener: LoadingStateChangeListener | SectorNodeIdToTreeIndexMapLoadedListener
  ): void {
    switch (event) {
      case 'loadingStateChanged':
        this.eventListeners.loadingStateChanged.filter(x => x !== listener);
        break;

      case 'nodeIdToTreeIndexMapLoaded':
        this.eventListeners.sectorNodeIdToTreeIndexMapLoaded.filter(x => x !== listener);
        break;

      default:
        throw new Error(`Unsupported event '${event}'`);
    }
  }

  protected loadModel(
    type: 'cad',
    modelIdentifier: TModelIdentifier,
    nodeApperanceProvider?: NodeAppearanceProvider
  ): Promise<CadNode>;
  protected loadModel(
    type: 'pointcloud',
    modelIdentifier: TModelIdentifier
  ): Promise<[PotreeGroupWrapper, PotreeNodeWrapper]>;
  protected async loadModel(
    type: 'cad' | 'pointcloud',
    modelIdentifier: TModelIdentifier,
    nodeApperanceProvider?: NodeAppearanceProvider
  ): Promise<[PotreeGroupWrapper, PotreeNodeWrapper] | CadNode> {
    trackLoadModel(
      {
        moduleName: 'RevealManagerBase',
        methodName: 'loadModel',
        options: { nodeApperanceProvider }
      },
      modelIdentifier
    );

    switch (type) {
      case 'cad': {
        const cadNode = await this._cadManager.addModel(modelIdentifier);
        this._subscriptions.add(
          this._cadManager
            .getParsedData()
            .pipe(
              share(),
              filter(x => x.blobUrl === cadNode.cadModelMetadata.blobUrl)
            )
            .subscribe(parseSector => {
              this.notifySectorNodeIdToTreeIndexMapLoaded(parseSector.blobUrl, parseSector.data.nodeIdToTreeIndexMap);
            })
        );
        return cadNode;
      }

      case 'pointcloud': {
        return this._pointCloudManager.addModel(modelIdentifier);
      }

      default:
        throw new Error(`Model type '${type}' is not supported`);
    }
  }

  private notifySectorNodeIdToTreeIndexMapLoaded(blobUrl: string, nodeIdToTreeIndexMap: Map<number, number>): void {
    const event: SectorNodeIdToTreeIndexMapLoadedEvent = { blobUrl, nodeIdToTreeIndexMap };
    this.eventListeners.sectorNodeIdToTreeIndexMapLoaded.forEach(listener => {
      listener(event);
    });
  }

  private notifyLoadingStateChanged(isLoaded: boolean) {
    this.eventListeners.loadingStateChanged.forEach(handler => {
      handler(isLoaded);
    });
  }

  private initCadRepository(
    client: ModelDataClient<TModelIdentifier>,
    materialManager: MaterialManager
  ): CachedRepository {
    const dataParser: CadSectorParser = new CadSectorParser();
    const dataTransformer = new SimpleAndDetailedToSector3D(materialManager);
    const repository = new CachedRepository(client, dataParser, dataTransformer);
    return repository;
  }

  private initCadManager(
    client: ModelDataClient<TModelIdentifier>,
    repository: CachedRepository,
    materialManager: MaterialManager,
    sectorCuller: SectorCuller
  ): CadManager<TModelIdentifier> {
    const modelFactory = new CadModelFactory(materialManager);
    const metadataRepository = new CadModelMetadataRepository(
      client,
      new DefaultCadTransformation(),
      new CadMetadataParser()
    );
    const updateHandler = new CadModelUpdateHandler(repository, sectorCuller);

    const manager: CadManager<TModelIdentifier> = new CadManager(
      materialManager,
      metadataRepository,
      modelFactory,
      updateHandler
    );
    return manager;
  }

  private initPointCloudManager(client: ModelDataClient<TModelIdentifier>): PointCloudManager<TModelIdentifier> {
    const metadataRepository: PointCloudMetadataRepository<TModelIdentifier> = new PointCloudMetadataRepository(
      client,
      new DefaultPointCloudTransformation()
    );
    const modelFactory: PointCloudFactory = new PointCloudFactory(client);
    const manager: PointCloudManager<TModelIdentifier> = new PointCloudManager(metadataRepository, modelFactory);
    return manager;
  }

  private initLoadingStateObserver(
    cadManager: CadManager<TModelIdentifier>,
    pointCloudManager: PointCloudManager<TModelIdentifier>
  ) {
    this._subscriptions.add(
      combineLatest([cadManager.getLoadingStateObserver(), pointCloudManager.getLoadingStateObserver()])
        .pipe(
          map(loading => loading.some(x => x)),
          distinctUntilChanged()
        )
        .subscribe(this.notifyLoadingStateChanged.bind(this), error =>
          trackError(error, {
            moduleName: 'RevealManager',
            methodName: 'constructor'
          })
        )
    );
  }
}
