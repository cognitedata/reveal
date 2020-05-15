/*!
 * Copyright 2020 Cognite AS
 */

import { RevealManagerBase, RevealOptions } from './RevealManagerBase';
import { CogniteClient } from '@cognite/sdk';
import { CadSectorParser } from '../dataModels/cad/internal/sector/CadSectorParser';
import { SimpleAndDetailedToSector3D } from '../dataModels/cad/internal/sector/SimpleAndDetailedToSector3D';
import { CachedRepository } from '../dataModels/cad/internal/sector/CachedRepository';
import { MaterialManager } from '../dataModels/cad/internal/MaterialManager';
import { CadManager } from '../dataModels/cad/internal/CadManager';
import { CadModelMetadataRepository } from '../dataModels/cad/internal/CadModelMetadataRepository';
import { DefaultCadTransformation } from '../dataModels/cad/internal/DefaultCadTransformation';
import { CadMetadataParser } from '../dataModels/cad/internal/CadMetadataParser';
import { CogniteClient3dExtensions } from '../utilities/networking/CogniteClient3dExtensions';
import { CadModelFactory } from '../dataModels/cad/internal/CadModelFactory';
import { CadModelUpdateHandler } from '../dataModels/cad/internal/CadModelUpdateHandler';
import { ProximitySectorCuller } from '../dataModels/cad/internal/sector/culling/ProximitySectorCuller';

// First iteration of a RevealManager. Currently tailored to examples but should be tailored to external usecase.
// Should move to example-helpers.ts as a function without extending
// TODO: j-bjorne 15-05-2020: create a function that creates a default CadManager and place it in a util class?
export class RevealManager extends RevealManagerBase {
  constructor(client: CogniteClient, options?: RevealOptions) {
    const modelDataParser: CadSectorParser = new CadSectorParser();
    const materialManager: MaterialManager = new MaterialManager();
    const modelDataTransformer = new SimpleAndDetailedToSector3D(materialManager);
    const cogniteClientExtension = new CogniteClient3dExtensions(client);
    const cadModelRepository = new CadModelMetadataRepository(
      cogniteClientExtension,
      cogniteClientExtension,
      new DefaultCadTransformation(),
      new CadMetadataParser()
    );
    const cadModelFactory = new CadModelFactory(materialManager);
    const sectorCuller = (options && options.internal && options.internal.sectorCuller) || new ProximitySectorCuller();
    const sectorRepository = new CachedRepository(cogniteClientExtension, modelDataParser, modelDataTransformer);
    const cadModelUpdateHandler = new CadModelUpdateHandler(sectorRepository, sectorCuller);
    const cadManager: CadManager = new CadManager(cadModelRepository, cadModelFactory, cadModelUpdateHandler);
    super(client, cadManager, materialManager);
  }

  public set clippingPlanes(clippingPlanes: THREE.Plane[]) {
    this._materialManager.clippingPlanes = clippingPlanes;
  }

  public get clippingPlanes() {
    return this._materialManager.clippingPlanes;
  }

  public set clipIntersection(intersection: boolean) {
    this._materialManager.clipIntersection = intersection;
  }

  public get clipIntersection() {
    return this._materialManager.clipIntersection;
  }
}
