/*!
 * Copyright 2020 Cognite AS
 */

import { RevealManagerBase, RevealOptions } from './RevealManagerBase';

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
import { LocalUrlClient as LocalHostClient } from '@/utilities/networking/LocalUrlClient';
import { ModelNodeAppearance, CadNode, ModelRenderAppearance } from '@/datamodels/cad';
import { PointCloudMetadataRepository } from '@/datamodels/pointcloud/PointCloudMetadataRepository';
import { PointCloudFactory } from '@/datamodels/pointcloud/PointCloudFactory';
import { PointCloudManager } from '@/datamodels/pointcloud/PointCloudManager';
import { DefaultPointCloudTransformation } from '@/datamodels/pointcloud/DefaultPointCloudTransformation';

type LocalModelIdentifier = { fileName: string };

export class LocalHostRevealManager extends RevealManagerBase<LocalModelIdentifier> {
  private readonly sectorRepository: CachedRepository;

  constructor(options?: RevealOptions) {
    const modelDataParser: CadSectorParser = new CadSectorParser();
    const materialManager: MaterialManager = new MaterialManager();
    const modelDataTransformer = new SimpleAndDetailedToSector3D(materialManager);
    const localClient: LocalHostClient = new LocalHostClient();

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

    this.sectorRepository = sectorRepository;
  }

  public addModel(
    type: 'cad',
    fileName: string,
    modelNodeAppearance?: ModelNodeAppearance,
    modelRenderAppearance?: ModelRenderAppearance
  ): Promise<CadNode>;
  public addModel(type: 'pointcloud', fileName: string): Promise<[PotreeGroupWrapper, PotreeNodeWrapper]>;
  public addModel(
    type: 'cad' | 'pointcloud',
    fileName: string,
    modelNodeAppearance?: ModelNodeAppearance,
    modelRenderAppearance?: ModelRenderAppearance
  ): Promise<CadNode | [PotreeGroupWrapper, PotreeNodeWrapper]> {
    switch (type) {
      case 'cad':
        return this._cadManager.addModel({ fileName }, modelNodeAppearance, modelRenderAppearance);
      case 'pointcloud':
        return this._pointCloudManager.addModel({ fileName });
      default:
        throw new Error(`case: ${type} not handled`);
    }
  }

  public dispose(): void {
    if (this.isDisposed) {
      return;
    }
    this.sectorRepository.dispose();
    super.dispose();
  }
}
