/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { OperatorFunction, Observable, asapScheduler, scheduled } from 'rxjs';
import { filter, map, mergeAll, publish } from 'rxjs/operators';

import { CadMaterialManager } from '../CadMaterialManager';
import { InstancedMeshFile, SectorQuads } from '../rendering/types';

import { SectorGeometry, ParsedSector } from './types';
import { LevelOfDetail } from './LevelOfDetail';
import { consumeSectorDetailed, consumeSectorSimple } from './sectorUtilities';
import { toThreeJsBox3 } from '../../../utilities';
import { AutoDisposeGroup } from '../../../utilities/three';

export class SimpleAndDetailedToSector3D {
  private readonly materialManager: CadMaterialManager;

  constructor(materialManager: CadMaterialManager) {
    this.materialManager = materialManager;
  }

  transform(): OperatorFunction<
    ParsedSector,
    { sectorMeshes: AutoDisposeGroup; instancedMeshes: InstancedMeshFile[] }
  > {
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
                toThreeJsBox3(new THREE.Box3(), parsedSector.metadata.bounds),
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
