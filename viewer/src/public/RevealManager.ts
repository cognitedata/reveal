/*!
 * Copyright 2020 Cognite AS
 */

import { RevealManagerBase, RevealOptions } from './RevealManagerBase';
import { CogniteClient, IdEither } from '@cognite/sdk';
import { CadSectorParser } from '@/dataModels/cad/internal/sector/CadSectorParser';
import { SimpleAndDetailedToSector3D } from '@/dataModels/cad/internal/sector/SimpleAndDetailedToSector3D';
import { CachedRepository } from '@/dataModels/cad/internal/sector/CachedRepository';
import { MaterialManager } from '@/dataModels/cad/internal/MaterialManager';
import { CadManager } from '@/dataModels/cad/internal/CadManager';
import { CadModelMetadataRepository } from '@/dataModels/cad/internal/CadModelMetadataRepository';
import { DefaultCadTransformation } from '@/dataModels/cad/internal/DefaultCadTransformation';
import { CadMetadataParser } from '@/dataModels/cad/internal/CadMetadataParser';
import { CogniteClient3dExtensions } from '@/utilities/networking/CogniteClient3dExtensions';
import { CadModelFactory } from '@/dataModels/cad/internal/CadModelFactory';
import { CadModelUpdateHandler } from '@/dataModels/cad/internal/CadModelUpdateHandler';
import { File3dFormat } from '@/utilities/File3dFormat';
import { ModelNodeAppearance } from '@/dataModels/cad/internal/ModelNodeAppearance';
import { CadNode } from '@/dataModels/cad/internal/CadNode';
import { PotreeNodeWrapper } from '@/dataModels/pointCloud/internal/PotreeNodeWrapper';
import { PotreeGroupWrapper } from '@/dataModels/pointCloud/internal/PotreeGroupWrapper';
import { ByVisibilityGpuSectorCuller } from '@/dataModels/cad/internal/sector/culling/ByVisibilityGpuSectorCuller';

// First iteration of a RevealManager. Currently tailored to examples but should be tailored to external usecase.
// Should move to example-helpers.ts as a function without extending
// TODO: j-bjorne 15-05-2020: create a function that creates a default CadManager and place it in a util class?

type Params = { modelRevision: IdEither; format: File3dFormat };
export class RevealManager extends RevealManagerBase<Params> {
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
    const cadManager: CadManager<Params> = new CadManager(cadModelRepository, cadModelFactory, cadModelUpdateHandler);
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

  // TODO 22-05-2020 j-bjorne: comment in and remove from base class one pointcloud model has been created.
  // private createModelIdentifier(id: string | number): IdEither {
  //   if (typeof id === 'number') {
  //     return { id };
  //   }
  //   return { externalId: id };
  // }
}
