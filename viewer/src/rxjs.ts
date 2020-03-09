/*!
 * Copyright 2020 Cognite AS
 */

import {
  Observable,
  from,
  of,
  partition,
  merge,
  Subject,
  pipe,
  GroupedObservable,
  OperatorFunction,
  empty,
  UnaryFunction
} from 'rxjs';
import {
  switchMap,
  flatMap,
  map,
  catchError,
  distinctUntilChanged,
  tap,
  groupBy,
  distinctUntilKeyChanged,
  mergeMap,
  reduce,
  filter,
  scan,
  publish,
  delay,
  startWith,
  withLatestFrom,
  throttleTime,
  share
} from 'rxjs/operators';
import { SectorQuads, WantedSectors, Sector, SectorMetadata } from './models/cad/types';
import { CadModel } from './models/cad/CadModel';
import { consumeSectorSimple } from './views/threejs/cad/consumeSectorSimple';
import { createMaterials } from './views/threejs/cad/materials';
import { Box3 } from './utils/Box3';
import * as THREE from 'three';
import { consumeSectorDetailed } from './views/threejs/cad/consumeSectorDetailed';
import { vec3, mat4 } from 'gl-matrix';
import { RootSectorNode } from './views/threejs/cad/RootSectorNode';
import { Shading, createDefaultShading } from './views/threejs';
import { defaultDetermineSectors } from './models/cad/determineSectors';
import { fromThreeVector3, fromThreeMatrix } from './views/threejs/utilities';

enum Lod {
  Discarded,
  Hidden,
  Simple,
  Detailed
}

interface WantedSector {
  id: number;
  lod: Lod;
  metadata: SectorMetadata;
}

interface FetchedSectorSimple {
  id: number;
  data: Uint8Array;
  lod: Lod;
  metadata: SectorMetadata;
}

interface FetchedSectorDetailed {
  id: number;
  data: Uint8Array;
  lod: Lod;
  metadata: SectorMetadata;
}

interface ParsedSectorSimple {
  id: number;
  simpleData: SectorQuads;
  lod: Lod;
  metadata: SectorMetadata;
}

interface ParsedSectorDetailed {
  id: number;
  detailedData: Sector;
  lod: Lod;
  metadata: SectorMetadata;
}

type FinalSector = WantedSector | ParsedSectorSimple | ParsedSectorDetailed;

export function testme(model: CadModel, callback: () => void) {
  const cameraPosition: Subject<THREE.PerspectiveCamera> = new Subject();

  const update = (camera: THREE.PerspectiveCamera) => {
    cameraPosition.next(camera);
  };

  const updateVars = {
    cameraPosition: vec3.create(),
    cameraModelMatrix: mat4.create(),
    projectionMatrix: mat4.create()
  };

  const determineSectors = map((camera: THREE.PerspectiveCamera) => {
    console.log('Got position');
    camera.matrixWorldInverse.getInverse(camera.matrixWorld);

    const { cameraPosition, cameraModelMatrix, projectionMatrix } = updateVars;
    fromThreeVector3(cameraPosition, camera.position, model.modelTransformation);
    fromThreeMatrix(cameraModelMatrix, camera.matrixWorld, model.modelTransformation);
    fromThreeMatrix(projectionMatrix, camera.projectionMatrix);
    const wantedSectors = defaultDetermineSectors({
      scene: model.scene,
      cameraFov: camera.fov,
      cameraPosition,
      cameraModelMatrix,
      projectionMatrix,
      loadingHints: {}
    });
    const actualWantedSectors: WantedSector[] = [];
    for (const sector of wantedSectors.simple) {
      actualWantedSectors.push({
        id: sector,
        lod: Lod.Simple,
        metadata: model.scene.sectors.get(sector)!
      });
    }
    for (const sector of wantedSectors.detailed) {
      actualWantedSectors.push({
        id: sector,
        lod: Lod.Detailed,
        metadata: model.scene.sectors.get(sector)!
      });
    }
    return actualWantedSectors;
  });

  const distinctUntilLodChanged = pipe(
    groupBy((sector: WantedSector) => sector.id),
    mergeMap((group: GroupedObservable<number, WantedSector>) => group.pipe(distinctUntilKeyChanged('lod')))
  );

  const hideAndScheduleDiscard: OperatorFunction<WantedSector, WantedSector> = pipe(
    flatMap((sector: WantedSector) => of(sector).pipe(delay(1000), startWith({ ...sector, lod: Lod.Hidden })))
  );

  const fetchSimple = flatMap(async (sector: WantedSector) => {
    const fetchedData = await model.fetchSectorSimple(sector.id);
    return {
      id: sector.id,
      lod: sector.lod,
      data: fetchedData,
      metadata: sector.metadata
    };
  });

  const parseSimple = flatMap(async (sector: FetchedSectorSimple) => {
    const parsedData = await model.parseSimple(sector.id, sector.data);
    return {
      id: sector.id,
      lod: sector.lod,
      simpleData: parsedData,
      metadata: sector.metadata
    };
  });

  const fetchDetailed = flatMap(async (sector: WantedSector) => {
    const fetchedData = await model.fetchSectorDetailed(sector.id);
    return {
      id: sector.id,
      lod: sector.lod,
      data: fetchedData,
      metadata: sector.metadata
    };
  });

  const parseDetailed = flatMap(async (sector: FetchedSectorDetailed) => {
    const parsedData = await model.parseDetailed(sector.id, sector.data);
    return {
      id: sector.id,
      lod: sector.lod,
      detailedData: parsedData,
      metadata: sector.metadata
    };
  });

  const getFinalSectorByLod: OperatorFunction<WantedSector, FinalSector> = pipe(
    publish(multicast =>
      merge(
        multicast.pipe(
          filter((sector: WantedSector) => sector.lod === Lod.Discarded),
          hideAndScheduleDiscard
        ),
        multicast.pipe(
          filter((sector: WantedSector) => sector.lod === Lod.Simple),
          fetchSimple,
          parseSimple
        ),
        multicast.pipe(
          filter((sector: WantedSector) => sector.lod === Lod.Detailed),
          fetchDetailed,
          parseDetailed
        )
      )
    )
  );

  const handleWantedSectors: OperatorFunction<WantedSector, FinalSector> = pipe(
    distinctUntilLodChanged,
    getFinalSectorByLod
  );

  function dropOutdated(wanted: Observable<WantedSector[]>): OperatorFunction<WantedSector, WantedSector> {
    return pipe(
      withLatestFrom(wanted),
      flatMap(([loaded, wanted]) => {
        for (const wantedSector of wanted) {
          if (loaded.id === wantedSector.id && loaded.lod === wantedSector.lod) {
            return of(loaded);
          }
        }
        return empty();
      })
    );
  }

  const rootSector: RootSectorNode = new RootSectorNode(model, createDefaultShading({}));

  cameraPosition
    .pipe(
      throttleTime(1000),
      determineSectors,
      share(),
      publish(wantedSectors =>
        wantedSectors.pipe(
          flatMap((sectors: WantedSector[]) => from(sectors)),
          handleWantedSectors,
          dropOutdated(wantedSectors)
        )
      )
    )
    .subscribe((sector: FinalSector) => {
      if ('simpleData' in sector) {
        const simpleSector = sector as ParsedSectorSimple;
        rootSector.discard(sector.id);
        rootSector.consumeSimple(sector.id, simpleSector.simpleData);
      } else if ('detailedData' in sector) {
        const detailedSector = sector as ParsedSectorDetailed;
        rootSector.discard(sector.id);
        rootSector.consumeDetailed(sector.id, detailedSector.detailedData);
      } else {
        rootSector.discard(sector.id);
      }
      callback();
    });

  return {
    rootSector,
    update
  };
}
