/*!
 * Copyright 2020 Cognite AS
 */

import { RevealManagerBase, RevealOptions } from './RevealManagerBase';

import { CadSectorParser } from '@/dataModels/cad/sector/CadSectorParser';
import { MaterialManager } from '@/dataModels/cad/MaterialManager';
import { SimpleAndDetailedToSector3D } from '@/dataModels/cad/sector/SimpleAndDetailedToSector3D';
import { CadModelMetadataRepository } from '@/dataModels/cad/CadModelMetadataRepository';
import { DefaultCadTransformation } from '@/dataModels/cad/DefaultCadTransformation';
import { CadMetadataParser } from '@/dataModels/cad/parsers/CadMetadataParser';
import { CadModelFactory } from '@/dataModels/cad/CadModelFactory';
import { ByVisibilityGpuSectorCuller, PotreeGroupWrapper, PotreeNodeWrapper } from '@/internal';
import { CachedRepository } from '@/dataModels/cad/sector/CachedRepository';
import { CadModelUpdateHandler } from '@/dataModels/cad/CadModelUpdateHandler';
import { CadManager } from '@/dataModels/cad/CadManager';
import { LocalUrlClient as LocalHostClient } from '@/utilities/networking/LocalUrlClient';
import { ModelNodeAppearance, CadNode } from '@/dataModels/cad';
import { PointCloudMetadataRepository } from '@/dataModels/pointCloud/internal/PointCloudMetadataRepository';
import { PointCloudFactory } from '@/dataModels/pointCloud/internal/PointCloudFactory';
import { PointCloudManager } from '@/dataModels/pointCloud/internal/PointCloudManager';

type LocalModelIdentifier = { fileName: string };

export class LocalHostRevealManager extends RevealManagerBase<LocalModelIdentifier> {
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
      new DefaultCadTransformation()
    );
    const pointCloudFactory: PointCloudFactory = new PointCloudFactory(localClient);
    const pointCloudManager: PointCloudManager<LocalModelIdentifier> = new PointCloudManager(
      pointCloudModelRepository,
      pointCloudFactory
    );
    super(cadManager, materialManager, pointCloudManager);
  }

  public addModel(type: 'cad', fileName: string, modelNodeAppearance?: ModelNodeAppearance): Promise<CadNode>;
  public addModel(type: 'pointcloud', fileName: string): Promise<[PotreeGroupWrapper, PotreeNodeWrapper]>;
  public addModel(
    type: 'cad' | 'pointcloud',
    fileName: string,
    modelNodeAppearance?: ModelNodeAppearance
  ): Promise<CadNode | [PotreeGroupWrapper, PotreeNodeWrapper]> {
    switch (type) {
      case 'cad':
        return this._cadManager.addModel({ fileName }, modelNodeAppearance);
      case 'pointcloud':
        return this._pointCloudManager.addModel({ fileName });
      default:
        throw new Error(`case: ${type} not handled`);
    }
  }
}
