/*!
 * Copyright 2020 Cognite AS
 */

import { SectorGeometry, ParsedSector } from './types';
import { OperatorFunction, merge, Observable } from 'rxjs';
import { Group } from 'three';
import { publish, filter, map } from 'rxjs/operators';
import { LevelOfDetail } from './LevelOfDetail';
import { MaterialManager } from '../MaterialManager';
import { SectorQuads } from '../rendering/types';
import { consumeSectorDetailed, consumeSectorSimple } from './sectorUtilities';

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
      );
    });
  }
}
