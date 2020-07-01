/*!
 * Copyright 2020 Cognite AS
 */

import { RevealManagerBase } from './RevealManagerBase';
import { CogniteClient } from '@cognite/sdk';
import { CogniteClient3dExtensions } from '@/utilities/networking/CogniteClient3dExtensions';
import { File3dFormat } from '@/utilities';
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
import { CadNode, NodeAppearanceProvider } from '@/datamodels/cad';
import { PointCloudMetadataRepository } from '@/datamodels/pointcloud/PointCloudMetadataRepository';
import { PointCloudFactory } from '@/datamodels/pointcloud/PointCloudFactory';
import { PointCloudManager } from '@/datamodels/pointcloud/PointCloudManager';
import { DefaultPointCloudTransformation } from '@/datamodels/pointcloud/DefaultPointCloudTransformation';
import { combineLatest, Subscription } from 'rxjs';
import { RevealOptions } from './types';
import { distinctUntilChanged, map } from 'rxjs/operators';

type CdfModelIdentifier = { modelId: number; revisionId: number; format: File3dFormat };
type LoadingStateChangeListener = (isLoading: boolean) => any;

export class RevealManager extends RevealManagerBase<CdfModelIdentifier> {
  private readonly eventListeners: { loadingStateChanged: LoadingStateChangeListener[] };
  private readonly _subscription: Subscription;

  constructor(client: CogniteClient, options?: RevealOptions) {
    const modelDataParser: CadSectorParser = new CadSectorParser();
    const materialManager: MaterialManager = new MaterialManager();
    const modelDataTransformer = new SimpleAndDetailedToSector3D(materialManager);
    const cogniteClientExtension = new CogniteClient3dExtensions(client);
    const cadModelRepository = new CadModelMetadataRepository(
      cogniteClientExtension,
      new DefaultCadTransformation(),
      new CadMetadataParser()
    );
    const cadModelFactory = new CadModelFactory(materialManager);
    const sectorCuller =
      (options && options.internal && options.internal.sectorCuller) || new ByVisibilityGpuSectorCuller();
    const sectorRepository = new CachedRepository(cogniteClientExtension, modelDataParser, modelDataTransformer);
    const cadModelUpdateHandler = new CadModelUpdateHandler(sectorRepository, sectorCuller);
    const cadManager: CadManager<CdfModelIdentifier> = new CadManager(
      cadModelRepository,
      cadModelFactory,
      cadModelUpdateHandler
    );

    const pointCloudModelRepository: PointCloudMetadataRepository<CdfModelIdentifier> = new PointCloudMetadataRepository(
      cogniteClientExtension,
      new DefaultPointCloudTransformation()
    );
    const pointCloudFactory: PointCloudFactory = new PointCloudFactory(cogniteClientExtension);
    const pointCloudManager: PointCloudManager<CdfModelIdentifier> = new PointCloudManager(
      pointCloudModelRepository,
      pointCloudFactory
    );

    super(cadManager, materialManager, pointCloudManager);

    this.eventListeners = {
      loadingStateChanged: new Array<LoadingStateChangeListener>()
    };

    this._subscription = new Subscription();
    this._subscription.add(
      combineLatest([sectorRepository.getLoadingStateObserver(), pointCloudManager.getLoadingStateObserver()])
        .pipe(
          map(([pointCloudLoading, cadLoading]) => {
            return pointCloudLoading || cadLoading;
          }),
          distinctUntilChanged()
        )
        .subscribe(this.notifyLoadingStateListeners.bind(this), console.error.bind(console))
    );
  }

  public addModel(
    type: 'cad',
    modelRevisionId: { modelId: number; revisionId: number },
    nodeApperanceProvider?: NodeAppearanceProvider
  ): Promise<CadNode>;
  public addModel(
    type: 'pointcloud',
    modelRevisionId: { modelId: number; revisionId: number }
  ): Promise<[PotreeGroupWrapper, PotreeNodeWrapper]>;
  public addModel(
    type: 'cad' | 'pointcloud',
    modelRevisionId: { modelId: number; revisionId: number },
    nodeApperanceProvider?: NodeAppearanceProvider
  ): Promise<CadNode | [PotreeGroupWrapper, PotreeNodeWrapper]> {
    switch (type) {
      case 'cad':
        return this._cadManager.addModel(
          { ...modelRevisionId, format: File3dFormat.RevealCadModel },
          nodeApperanceProvider
        );
      case 'pointcloud':
        return this._pointCloudManager.addModel({ ...modelRevisionId, format: File3dFormat.EptPointCloud });

      default:
        throw new Error(`Model type '${type}' is not supported`);
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
