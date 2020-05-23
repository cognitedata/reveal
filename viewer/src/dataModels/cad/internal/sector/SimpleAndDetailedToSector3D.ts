/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import { OperatorFunction, merge, Observable } from 'rxjs';
import { publish, filter, map } from 'rxjs/operators';

import { Sector, SectorQuads } from './types';
import { consumeSectorSimple } from './consumeSectorSimple';
import { consumeSectorDetailed } from './consumeSectorDetailed';
import { ParsedSector } from './ParsedSector';
import { LevelOfDetail } from './LevelOfDetail';
import { MaterialManager } from '../MaterialManager';

export class SimpleAndDetailedToSector3D {
  private readonly materialManager: MaterialManager;

  constructor(materialManager: MaterialManager) {
    this.materialManager = materialManager;
  }

  transform(): OperatorFunction<ParsedSector, THREE.Group> {
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
              this.materialManager.getModelMaterials(parsedSector.blobUrl)!
            )
          )
        ),
        simpleObservable.pipe(
          map(parsedSector =>
            consumeSectorSimple(
              parsedSector.data as SectorQuads,
              this.materialManager.getModelMaterials(parsedSector.blobUrl)!
            )
          )
        )
      );
    });
  }
}
