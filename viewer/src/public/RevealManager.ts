/*!
 * Copyright 2020 Cognite AS
 */

import { RevealManagerBase, RevealOptions } from './RevealManagerBase';
import { CogniteClient, IdEither } from '@cognite/sdk';
import { CogniteClient3dExtensions } from '@/utilities/networking/CogniteClient3dExtensions';
import { File3dFormat } from '@/utilities/File3dFormat';
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
import { ModelNodeAppearance, CadNode } from '@/dataModels/cad';

type CdfModelIdentifier = { modelRevision: IdEither; format: File3dFormat };
export class RevealManager extends RevealManagerBase<CdfModelIdentifier> {
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
    super(client, cadManager, materialManager);
  }

  public addModel(
    type: 'cad',
    modelRevisionId: string | number,
    modelNodeAppearance?: ModelNodeAppearance
  ): Promise<CadNode>;
  public addModel(
    type: 'pointcloud',
    modelRevisionId: string | number
  ): Promise<[PotreeGroupWrapper, PotreeNodeWrapper]>;
  public addModel(
    type: 'cad' | 'pointcloud',
    modelRevisionId: string | number,
    modelNodeAppearance?: ModelNodeAppearance
  ): Promise<CadNode | [PotreeGroupWrapper, PotreeNodeWrapper]> {
    switch (type) {
      case 'cad':
        return this._cadManager.addModel(
          { modelRevision: this.createModelIdentifier(modelRevisionId), format: File3dFormat.RevealCadModel },
          modelNodeAppearance
        );
      case 'pointcloud':
        throw new Error('Not yet implemented');
      default:
        throw new Error(`case: ${type} not handled`);
    }
  }
}
