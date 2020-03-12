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
  share,
  auditTime,
  switchAll
} from 'rxjs/operators';
import { SectorQuads, WantedSectors, Sector, SectorMetadata } from './models/cad/types';
import { CadModel } from './models/cad/CadModel';
import * as THREE from 'three';
import { vec3, mat4 } from 'gl-matrix';
import { RootSectorNode } from './views/threejs/cad/RootSectorNode';
import { createDefaultShading } from './views/threejs';
import { defaultDetermineSectors } from './models/cad/determineSectors';
import { fromThreeVector3, fromThreeMatrix } from './views/threejs/utilities';
import { CachedRepository } from './repository/cad/CachedRepository';
import { consumeSectorDetailed } from './views/threejs/cad/consumeSectorDetailed';
import { consumeSectorSimple } from './views/threejs/cad/consumeSectorSimple';
import { MemoryRequestCache } from './cache/MemoryRequestCache';

export enum Lod {
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

interface ConsumedSector {
  id: number;
  lod: Lod;
  group: THREE.Group;
  metadata: SectorMetadata;
}

type FinalSector = WantedSector | ParsedSectorSimple | ParsedSectorDetailed;

export function testme(model: CadModel, callback: () => void) {
  const repository = new CachedRepository(model);
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
    for (const [id, sector] of model.scene.sectors) {
      if (!wantedSectors.simple.has(sector.id) && !wantedSectors.detailed.has(sector.id)) {
        actualWantedSectors.push({
          id: sector.id,
          lod: Lod.Discarded,
          metadata: sector
        });
      }
    }
    return actualWantedSectors;
  });

  const distinctUntilLodChanged = pipe(
    groupBy((sector: WantedSector) => sector.id),
    mergeMap((group: GroupedObservable<number, WantedSector>) => group.pipe(distinctUntilKeyChanged('lod')))
  );

  const getSimple = flatMap(async (sector: WantedSector) => {
    const data = await repository.getSimple(sector.id);
    return {
      id: sector.id,
      lod: sector.lod,
      simpleData: data,
      metadata: sector.metadata
    };
  });

  const getDetailed = flatMap(async (sector: WantedSector) => {
    const data = await repository.getDetailed(sector.id);
    return {
      id: sector.id,
      lod: sector.lod,
      detailedData: data,
      metadata: sector.metadata
    };
  });

  const getFinalSectorByLod: OperatorFunction<WantedSector, FinalSector> = pipe(
    publish(multicast =>
      merge(
        multicast.pipe(
          filter((sector: WantedSector) => sector.lod === Lod.Discarded)
          // hideAndScheduleDiscard
        ),
        multicast.pipe(
          filter((sector: WantedSector) => sector.lod === Lod.Simple),
          getSimple
        ),
        multicast.pipe(
          filter((sector: WantedSector) => sector.lod === Lod.Detailed),
          getDetailed
        )
      )
    )
  );

  function dropOutdated(wantedObservable: Observable<WantedSector[]>): OperatorFunction<WantedSector, WantedSector> {
    return pipe(
      withLatestFrom(wantedObservable),
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

  const consumeSimple = (id: number, sector: ParsedSectorSimple) => {
    return consumeSectorSimple(id, sector.simpleData, sector.metadata, rootSector.shading.materials);
  };

  const consumeDetailed = (id: number, sector: ParsedSectorDetailed) => {
    return consumeSectorDetailed(id, sector.detailedData, sector.metadata, rootSector.shading.materials);
  };

  const consumeSimpleCache = new MemoryRequestCache<number, ParsedSectorSimple, THREE.Group>(consumeSimple);
  const consumeDetailedCache = new MemoryRequestCache<number, ParsedSectorDetailed, THREE.Group>(consumeDetailed);

  // TODO this should not have to be async, but the cache requires it
  const consume = async (id: number, sector: FinalSector): Promise<ConsumedSector> => {
    const { lod, metadata } = sector;
    const group = ((): THREE.Group => {
      switch (sector.lod) {
        case Lod.Simple: {
          const simpleSector = sector as ParsedSectorSimple;
          return consumeSimpleCache.request(id, simpleSector);
          break;
        }
        case Lod.Detailed: {
          const detailedSector = sector as ParsedSectorDetailed;
          return consumeDetailedCache.request(id, detailedSector);
          break;
        }
        default: {
          // TODO avoid new to reduce GC cleanup - might need one group per sector due to parenting
          return new THREE.Group();
        }
      }
    })();

    return {
      id,
      lod,
      metadata,
      group
    };
  };

  cameraPosition
    .pipe(
      auditTime(100),
      determineSectors,
      share(),
      publish(wantedSectors =>
        wantedSectors.pipe(
          switchAll(),
          distinctUntilLodChanged,
          getFinalSectorByLod,
           dropOutdated(wantedSectors),
          flatMap((sector: FinalSector) => consume(sector.id, sector))
        )
      )
    )
    .subscribe((sector: ConsumedSector) => {
      const sectorNode = rootSector.sectorNodeMap.get(sector.id);
      if (!sectorNode) {
        throw new Error(`Could not find 3D node for sector ${sector.id} - invalid id?`);
      }
      if (sectorNode.group) {
        sectorNode.remove(sectorNode.group);
      }
      sectorNode.add(sector.group);
      sectorNode.group = sector.group;
      callback();
    });

  return {
    rootSector,
    update
  };
}
