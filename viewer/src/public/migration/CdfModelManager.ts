/*!
 * Copyright 2020 Cognite AS
 */

import { Observable, Subscription, merge, combineLatest } from 'rxjs';
import { CogniteClient } from '@cognite/sdk';

import { Cognite3DModel } from './Cognite3DModel';
import { AddModelOptions } from './types';
import { NotSupportedInMigrationWrapperError } from './NotSupportedInMigrationWrapperError';
import { CognitePointCloudModel } from './CognitePointCloudModel';
import { RevealManagerBase } from '../RevealManagerBase';

import { CadManager } from '@/datamodels/cad/CadManager';
import { PointCloudManager } from '@/datamodels/pointcloud/PointCloudManager';
import { CadModelUpdateHandler } from '@/datamodels/cad/CadModelUpdateHandler';
import { MaterialManager } from '@/datamodels/cad/MaterialManager';
import { CachedRepository } from '@/datamodels/cad/sector/CachedRepository';
import { CogniteClient3dExtensions } from '@/utilities/networking/CogniteClient3dExtensions';
import { SectorCuller } from '@/datamodels/cad/sector/culling/SectorCuller';
import { CadModelMetadataRepository } from '@/datamodels/cad/CadModelMetadataRepository';
import { PointCloudMetadataRepository } from '@/datamodels/pointcloud/PointCloudMetadataRepository';
import { CadModelFactory } from '@/datamodels/cad/CadModelFactory';
import { PointCloudFactory } from '@/datamodels/pointcloud/PointCloudFactory';
import { File3dFormat } from '@/utilities';
import { map, distinctUntilChanged, share, filter } from 'rxjs/operators';

type CdfModelIdentifier = { modelId: number; revisionId: number; format: File3dFormat };

export class CdfModelManager {
  private readonly sdkClient: CogniteClient;
  private readonly materialManager: MaterialManager;
  private readonly cadRepository: CachedRepository;
  private readonly cadManager: CadManager<CdfModelIdentifier>;
  private readonly pointCloudManager: PointCloudManager<CdfModelIdentifier>;
  private readonly revealManager: RevealManagerBase<CdfModelIdentifier>;
  private readonly loadingSubscription = new Subscription();

  constructor(
    sdkClient: CogniteClient,
    cadRepository: CachedRepository,
    materialManager: MaterialManager,
    sectorCuller: SectorCuller,
    cadMetadataRepository: CadModelMetadataRepository<CdfModelIdentifier>,
    pointCloudMetadataRepository: PointCloudMetadataRepository<CdfModelIdentifier>
  ) {
    const cogniteClientExtension = new CogniteClient3dExtensions(sdkClient);
    const cadModelFactory = new CadModelFactory(materialManager);
    const pointCloudFactory = new PointCloudFactory(cogniteClientExtension);
    this.materialManager = materialManager;
    this.cadRepository = cadRepository;
    this.sdkClient = sdkClient;

    const cadModelUpdateHandler = new CadModelUpdateHandler(this.cadRepository, sectorCuller);
    this.cadManager = new CadManager<CdfModelIdentifier>(cadMetadataRepository, cadModelFactory, cadModelUpdateHandler);
    this.pointCloudManager = new PointCloudManager(pointCloudMetadataRepository, pointCloudFactory);
    this.revealManager = new RevealManagerBase(this.cadManager, this.materialManager, this.pointCloudManager);
  }

  dispose(): void {
    this.revealManager.dispose();
  }

  getLoadingStateObserver(): Observable<boolean> {
    return combineLatest([
      this.cadRepository.getLoadingStateObserver(),
      this.pointCloudManager.getLoadingStateObserver()
    ]).pipe(
      map(loading => loading.some(x => x)),
      distinctUntilChanged()
    );
  }

  setSlicingPlanes(planes: THREE.Plane[]): void {
    this.revealManager.clippingPlanes = planes;
  }

  getSlicingPlanes(): THREE.Plane[] {
    return this.revealManager.clippingPlanes;
  }

  needsRedraw(): boolean {
    return this.revealManager.needsRedraw;
  }

  requestRedraw(): void {
    this.revealManager.requestRedraw();
  }

  resetRedraw(): void {
    this.revealManager.resetRedraw();
  }

  update(camera: THREE.PerspectiveCamera): void {
    this.revealManager.update(camera);
  }

  async createPointCloudModel(modelId: number, revisionId: number): Promise<CognitePointCloudModel> {
    // TODO 25-05-2020 j-bjorne: fix this hot mess, 1 group added multiple times
    const [potreeGroup, potreeNode] = await this.pointCloudManager.addModel({
      modelId,
      revisionId,
      format: File3dFormat.EptPointCloud
    });
    const model = new CognitePointCloudModel(modelId, revisionId, potreeGroup, potreeNode);
    return model;
  }

  async createCadModel(options: AddModelOptions): Promise<Cognite3DModel> {
    if (options.localPath) {
      throw new NotSupportedInMigrationWrapperError();
    }

    const cadNode = await this.cadManager.addModel({
      modelId: options.modelId,
      revisionId: options.revisionId,
      format: File3dFormat.RevealCadModel
    });
    this.loadingSubscription.add(
      this.cadRepository
        .getParsedData()
        .pipe(
          share(),
          filter(x => x.blobUrl === cadNode.cadModelMetadata.blobUrl)
        )
        .subscribe(parseSector => model.updateNodeIdMaps(parseSector))
    );

    const model = new Cognite3DModel(options.modelId, options.revisionId, cadNode, this.sdkClient);
    return model;
  }
}
