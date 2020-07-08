/*!
 * Copyright 2020 Cognite AS
 */
import { Subscription, combineLatest } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

import { RevealManagerBase } from './RevealManagerBase';
import { RevealOptions } from './types';

import { CadSectorParser } from '@/datamodels/cad/sector/CadSectorParser';
import { MaterialManager } from '@/datamodels/cad/MaterialManager';
import { SimpleAndDetailedToSector3D } from '@/datamodels/cad/sector/SimpleAndDetailedToSector3D';
import { CadModelMetadataRepository } from '@/datamodels/cad/CadModelMetadataRepository';
import { DefaultCadTransformation } from '@/datamodels/cad/DefaultCadTransformation';
import { CadMetadataParser } from '@/datamodels/cad/parsers/CadMetadataParser';
import { CadModelFactory } from '@/datamodels/cad/CadModelFactory';
import { ByVisibilityGpuSectorCuller, PotreeGroupWrapper, PotreeNodeWrapper } from '@/internal';
import { CachedRepository } from '@/datamodels/cad/sector/CachedRepository';
import { CadModelUpdateHandler } from '@/datamodels/cad/CadModelUpdateHandler';
import { CadManager } from '@/datamodels/cad/CadManager';
import { LocalUrlClient } from '@/utilities/networking/LocalUrlClient';
import { CadNode, NodeAppearanceProvider } from '@/datamodels/cad';
import { PointCloudMetadataRepository } from '@/datamodels/pointcloud/PointCloudMetadataRepository';
import { PointCloudFactory } from '@/datamodels/pointcloud/PointCloudFactory';
import { PointCloudManager } from '@/datamodels/pointcloud/PointCloudManager';
import { DefaultPointCloudTransformation } from '@/datamodels/pointcloud/DefaultPointCloudTransformation';
import { trackError } from '@/utilities/metrics';

type LocalModelIdentifier = { fileName: string };
type LoadingStateChangeListener = (isLoading: boolean) => any;

export class LocalHostRevealManager extends RevealManagerBase<LocalModelIdentifier> {
  private readonly eventListeners: { loadingStateChanged: LoadingStateChangeListener[] };
  private readonly _subscription: Subscription;

  constructor(options?: RevealOptions) {
    const modelDataParser: CadSectorParser = new CadSectorParser();
    const materialManager: MaterialManager = new MaterialManager();
    const modelDataTransformer = new SimpleAndDetailedToSector3D(materialManager);
    const localClient: LocalUrlClient = new LocalUrlClient();

    const cadModelRepository = new CadModelMetadataRepository(
      localClient,
      new DefaultCadTransformation(),
      new CadMetadataParser()
    );
    const cadModelFactory = new CadModelFactory(materialManager);
    const sectorCuller =
      (options && options.internal && options.internal.sectorCuller) || new ByVisibilityGpuSectorCuller();
    const sectorRepository = new CachedRepository(localClient, modelDataParser, modelDataTransformer);
    const cadModelUpdateHandler = new CadModelUpdateHandler(sectorRepository, sectorCuller);
    const cadManager: CadManager<LocalModelIdentifier> = new CadManager<LocalModelIdentifier>(
      cadModelRepository,
      cadModelFactory,
      cadModelUpdateHandler
    );

    const pointCloudModelRepository: PointCloudMetadataRepository<LocalModelIdentifier> = new PointCloudMetadataRepository(
      localClient,
      new DefaultPointCloudTransformation()
    );
    const pointCloudFactory: PointCloudFactory = new PointCloudFactory(localClient);
    const pointCloudManager: PointCloudManager<LocalModelIdentifier> = new PointCloudManager(
      pointCloudModelRepository,
      pointCloudFactory
    );
    super(cadManager, materialManager, pointCloudManager);

    this.eventListeners = {
      loadingStateChanged: new Array<LoadingStateChangeListener>()
    };
    this.notifyLoadingStateListeners = this.notifyLoadingStateListeners.bind(this);

    this._subscription = new Subscription();
    this._subscription.add(
      combineLatest([sectorRepository.getLoadingStateObserver(), pointCloudManager.getLoadingStateObserver()])
        .pipe(
          map(([pointCloudLoading, cadLoading]) => {
            return pointCloudLoading || cadLoading;
          }),
          distinctUntilChanged()
        )
        .subscribe(this.notifyLoadingStateListeners.bind(this), error =>
          trackError(error, {
            moduleName: 'LocalHostRevealManager',
            methodName: 'constructor'
          })
        )
    );
  }

  public addModel(type: 'cad', fileName: string, nodeApperanceProvider?: NodeAppearanceProvider): Promise<CadNode>;
  public addModel(type: 'pointcloud', fileName: string): Promise<[PotreeGroupWrapper, PotreeNodeWrapper]>;
  public addModel(
    type: 'cad' | 'pointcloud',
    fileName: string,
    nodeApperanceProvider?: NodeAppearanceProvider
  ): Promise<CadNode | [PotreeGroupWrapper, PotreeNodeWrapper]> {
    switch (type) {
      case 'cad':
        return this._cadManager.addModel({ fileName }, nodeApperanceProvider);
      case 'pointcloud':
        return this._pointCloudManager.addModel({ fileName });
      default:
        throw new Error(`case: ${type} not handled`);
    }
  }

  public on(event: 'loadingStateChanged', listener: LoadingStateChangeListener): void {
    if (event !== 'loadingStateChanged') {
      throw new Error(`Unsupported event "${event}"`);
    }
    this.eventListeners[event].push(listener);
  }
  public off(event: 'loadingStateChanged', listener: LoadingStateChangeListener): void {
    if (event !== 'loadingStateChanged') {
      throw new Error(`Unsupported event "${event}"`);
    }
    this.eventListeners[event] = this.eventListeners[event].filter(fn => fn !== listener);
  }

  public dispose(): void {
    if (this.isDisposed) {
      return;
    }
    this.eventListeners.loadingStateChanged.splice(0);
    this._cadManager.dispose();
    this._subscription.unsubscribe();
    super.dispose();
  }

  private notifyLoadingStateListeners(isLoaded: boolean) {
    this.eventListeners.loadingStateChanged.forEach(handler => {
      handler(isLoaded);
    });
  }
}
