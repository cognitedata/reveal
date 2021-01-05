/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { OperatorFunction, Observable, asapScheduler, scheduled } from 'rxjs';
import { filter, map, mergeAll, publish } from 'rxjs/operators';

import { MaterialManager } from '../MaterialManager';
import { SectorGeometry, SectorQuads } from '../rendering/types';

import { LevelOfDetail } from './LevelOfDetail';
import { consumeSectorDetailed, consumeSectorSimple } from './sectorUtilities';
import { ParsedSector } from './types';

export class SimpleAndDetailedToSector3D {
  private readonly materialManager: MaterialManager;

  constructor(materialManager: MaterialManager) {
    this.materialManager = materialManager;
  }

  transform(): OperatorFunction<ParsedSector, THREE.Group> {
    return publish((source: Observable<ParsedSector>) => {
      const detailedObservable: Observable<ParsedSector> = source.pipe(
        filter((parsedSector: ParsedSector) => parsedSector.levelOfDetail === LevelOfDetail.Detailed)
      );
      const simpleObservable: Observable<ParsedSector> = source.pipe(
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
