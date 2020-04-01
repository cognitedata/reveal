/*!
 * Copyright 2020 Cognite AS
 */

import { RxModelSectorsRepository } from './RxModelSectorsRepository';
import { ModelSectorService } from '../network/client/ModelSectorService';
import { RxModelSectorParser } from '../parser/RxModelDataParser';
import { RevealObject3D } from '../model/three/RevealObject3D';

// Might not even need this as a class, just sayin!

export class ThreeModelSectorsFromCDF extends RxModelSectorsRepository<RevealObject3D> {
  constructor(modelService: ModelSectorService, sectorDataParser: RxModelSectorParser<RevealObject3D>) {
    super(modelService, sectorDataParser);
  }
}
