/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';

import { OperatorFunction, Observable, asapScheduler, scheduled } from 'rxjs';
import { publish, filter, map, mergeAll } from 'rxjs/operators';

import { MaterialManager } from '../MaterialManager';
import { SectorQuads } from '../rendering/types';

import { SectorGeometry, ParsedSector } from './types';
import { LevelOfDetail } from './LevelOfDetail';
import { consumeSectorDetailed, consumeSectorSimple } from './sectorUtilities';

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

      return scheduled(
        [
          detailedObservable.pipe(
            map(parsedSector =>
              consumeSectorDetailed(
                parsedSector.data as SectorGeometry,
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
        ],
        asapScheduler
      ).pipe(mergeAll());
    });
  }
}
