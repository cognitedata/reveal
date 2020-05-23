/*!
 * Copyright 2020 Cognite AS
 */

import { RevealManagerBase, RevealOptions } from './RevealManagerBase';
import { CogniteClient } from '@cognite/sdk';
import { CadSectorParser } from '@/dataModels/cad/internal/sector/CadSectorParser';
import { MaterialManager } from '@/dataModels/cad/internal/MaterialManager';
import { SimpleAndDetailedToSector3D } from '@/dataModels/cad/internal/sector/SimpleAndDetailedToSector3D';
import { CadModelFactory } from '@/dataModels/cad/internal/CadModelFactory';
import { CachedRepository } from '@/dataModels/cad/internal/sector/CachedRepository';
import { CadModelUpdateHandler } from '@/dataModels/cad/internal/CadModelUpdateHandler';
import { CadManager } from '@/dataModels/cad/internal/CadManager';
import { CadMetadataParser } from '@/dataModels/cad/internal/CadMetadataParser';
import { DefaultCadTransformation } from '@/dataModels/cad/internal/DefaultCadTransformation';
import { CadModelMetadataRepository } from '@/dataModels/cad/internal/CadModelMetadataRepository';
import { LocalUrlClient as LocalHostClient } from '@/utilities/networking/LocalUrlClient';
import { CadNode } from '@/dataModels/cad/internal/CadNode';
import { PotreeGroupWrapper } from '@/dataModels/pointCloud/internal/PotreeGroupWrapper';
import { PotreeNodeWrapper } from '@/dataModels/pointCloud/internal/PotreeNodeWrapper';
import { ModelNodeAppearance } from '@/dataModels/cad/internal/ModelNodeAppearance';
import { ByVisibilityGpuSectorCuller } from '@/dataModels/cad/internal/sector/culling/ByVisibilityGpuSectorCuller';

type LocalModelIdentifier = { fileName: string };

export class LocalHostRevealManager extends RevealManagerBase<LocalModelIdentifier> {
  constructor(client: CogniteClient, options?: RevealOptions) {
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
    super(client, cadManager, materialManager);
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
        throw new Error('Not yet implemented');
      default:
        throw new Error(`case: ${type} not handled`);
    }
  }
}
