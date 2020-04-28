/*!
 * Copyright 2020 Cognite AS
 */

import { Sector, SectorQuads } from '../../../models/cad/types';
import { OperatorFunction, merge, Observable } from 'rxjs';
import { Group } from 'three';
import { publish, filter, map } from 'rxjs/operators';
import { consumeSectorSimple } from '../../../views/threejs/cad/consumeSectorSimple';
import { consumeSectorDetailed } from '../../../views/threejs/cad/consumeSectorDetailed';
import { ParsedSector } from '../../model/ParsedSector';
import { LevelOfDetail } from '../../model/LevelOfDetail';
import { MaterialManager } from '../../../views/threejs/cad/MaterialManager';

export class SimpleAndDetailedToSector3D {
  private readonly materialManager: MaterialManager;
  constructor(materialManager: MaterialManager) {
    this.materialManager = materialManager;
  }

  transform(): OperatorFunction<ParsedSector, Group> {
    return publish(dataObservable => {
      const detailedObservable: Observable<ParsedSector> = dataObservable.pipe(
        filter((parsedSector: ParsedSector) => parsedSector.levelOfDetail === LevelOfDetail.Detailed)
      );
      const simpleObservable: Observable<ParsedSector> = dataObservable.pipe(
        filter((parsedSector: ParsedSector) => parsedSector.levelOfDetail === LevelOfDetail.Simple)
      );

      return merge(
        detailedObservable.pipe(
          map(parsedSector =>
            consumeSectorDetailed(
              parsedSector.data as Sector,
              parsedSector.metadata,
              this.materialManager.getModelMaterials(parsedSector.cadModelIdentifier)!
            )
          )
        ),
        simpleObservable.pipe(
          map(parsedSector =>
            consumeSectorSimple(
              parsedSector.data as SectorQuads,
              this.materialManager.getModelMaterials(parsedSector.cadModelIdentifier)!
            )
          )
        )
      );
    });
  }
}
