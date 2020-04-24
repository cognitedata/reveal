/*!
 * Copyright 2020 Cognite AS
 */

import { Sector, SectorQuads } from '../../../models/cad/types';
import { OperatorFunction, merge, Observable } from 'rxjs';
import { Group } from 'three';
import { Materials } from '../../../views/threejs/cad/materials';
import { publish, filter, map } from 'rxjs/operators';
import { consumeSectorSimple } from '../../../views/threejs/cad/consumeSectorSimple';
import { consumeSectorDetailed } from '../../../views/threejs/cad/consumeSectorDetailed';
import { ParsedSector } from '../../model/ParsedSector';
import { LevelOfDetail } from '../../model/LevelOfDetail';
import { ExternalSource } from '../../model/ExternalSource';
import { CdfBlobSource } from '../../model/CDFBlobSource';

export class SimpleAndDetailedToSector3D {
  private readonly materialMap: Map<string, Materials> = new Map();
  constructor() {}

  addMaterial(key: string, materials: Materials) {
    this.materialMap.set(key, materials);
  }

  removeMaterial(key: string) {
    this.materialMap.delete(key);
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
              this.materialMap.get(this.sourceLodToString(parsedSector))!
            )
          )
        ),
        simpleObservable.pipe(
          map(parsedSector =>
            consumeSectorSimple(
              parsedSector.data as SectorQuads,
              this.materialMap.get(this.sourceLodToString(parsedSector))!
            )
          )
        )
      );
    });
  }

  // TODO: j-bjorne 20-04-20: Move into a utils class since it is used multiple places.
  private sourceLodToString(item: { dataSource: ExternalSource | CdfBlobSource; levelOfDetail: LevelOfDetail }) {
    if (item.dataSource.discriminator === 'cdf-blob') {
      return '' + item.dataSource.blobId + '.' + item.levelOfDetail;
    } else if (item.dataSource.discriminator === 'external') {
      return '' + item.dataSource.url + '' + item.levelOfDetail;
    }
    throw new Error('unknown datasource');
  }
}
