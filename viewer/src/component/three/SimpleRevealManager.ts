/*!
 * Copyright 2020 Cognite AS
 */

import { RevealManager, RevealOptions } from './RevealManager';
import { CogniteClient } from '@cognite/sdk';
import { CadSectorParser } from '../../data/parser/CadSectorParser';
import { SimpleAndDetailedToSector3D } from '../../data/transformer/three/SimpleAndDetailedToSector3D';
import { CachedRepository } from '../../repository/cad/CachedRepository';
import { MaterialManager } from '../../views/threejs/cad/MaterialManager';

// First iteration of a SimpleRevealManager. Currently tailored to examples but should be tailored to external usecase.
// Should move to example-helpers.ts as a function without extending
export class SimpleRevealManager extends RevealManager {
  constructor(client: CogniteClient, onUpdatedCallback: () => void, options?: RevealOptions) {
    const modelDataParser: CadSectorParser = new CadSectorParser();
    const materialManager: MaterialManager = new MaterialManager();
    const modelDataTransformer = new SimpleAndDetailedToSector3D(materialManager);
    const sectorRepository = new CachedRepository(modelDataParser, modelDataTransformer);
    super(client, sectorRepository, materialManager, onUpdatedCallback, options);
  }
}
