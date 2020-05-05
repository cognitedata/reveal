/*!
 * Copyright 2020 Cognite AS
 */

import { Sector, SectorQuads } from '../../../models/cad/types';
import { OperatorFunction, merge, Observable } from 'rxjs';
import { Group } from 'three';
import { Materials } from '../../../views/threejs/cad/materials';
import { publish, filter, map, tap } from 'rxjs/operators';
import { consumeSectorSimple } from '../../../views/threejs/cad/consumeSectorSimple';
import { consumeSectorDetailed } from '../../../views/threejs/cad/consumeSectorDetailed';
import { ParsedSector } from '../../model/ParsedSector';
import { LevelOfDetail } from '../../model/LevelOfDetail';

export class SimpleAndDetailedToSector3D {
  private readonly materials: Materials;
  constructor(materials: Materials) {
    this.materials = materials;
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
          map(parsedSector => consumeSectorDetailed(parsedSector.data as Sector, parsedSector.metadata, this.materials))
        ),
        simpleObservable.pipe(
          map(parsedSector => consumeSectorSimple(parsedSector.data as SectorQuads, this.materials))
        )
      );
    });
  }
}
