/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
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
import { ProximitySectorCuller } from '@/dataModels/cad/internal/sector/culling/ProximitySectorCuller';
import { LocalUrlClient as LocalHostClient } from '@/utilities/networking/LocalUrlClient';

type Params = { fileName: string };

export class LocalHostRevealManager extends RevealManagerBase<Params> {
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
    const sectorCuller = (options && options.internal && options.internal.sectorCuller) || new ProximitySectorCuller();
    const sectorRepository = new CachedRepository(localClient, modelDataParser, modelDataTransformer);
    const cadModelUpdateHandler = new CadModelUpdateHandler(sectorRepository, sectorCuller);
    const cadManager: CadManager<Params> = new CadManager<Params>(
      cadModelRepository,
      cadModelFactory,
      cadModelUpdateHandler
    );
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

  // public addModel(type: 'cad', url: string, modelNodeAppearance?: ModelNodeAppearance): Promise<CadNode>;
  // public addModel(type: 'cad', url: string, modelNodeAppearance?: ModelNodeAppearance): Promise<CadNode> {
  //   switch (type) {
  //     case 'cad':
  //       return this.addCadModel(
  //         {
  //           url
  //         },
  //         modelNodeAppearance
  //       );
  //     default:
  //       throw new Error(`${type} not handled`);
  //   }
  // }
}
