/*!
 * Copyright 2020 Cognite AS
 */

import { Observable, from, of, partition, merge, Subject } from 'rxjs';
import { createLocalCadModel } from './datasources/local/cad/createLocalCadModel';
import { switchMap, flatMap, map, catchError, distinctUntilChanged, tap } from 'rxjs/operators';
import { SectorQuads, WantedSectors, Sector } from './models/cad/types';

enum Lod {
  Simple,
  Detailed,
  Unwanted
}

interface WantedSector {
  id: number;
  lod: Lod;
}

interface FetchedSectorSimple {
  id: number;
  data: Uint8Array;
}

interface FetchedSectorDetailed {
  id: number;
  data: Uint8Array;
}

interface ParsedSectorSimple {
  id: number;
  data: SectorQuads;
}

interface ParsedSectorDetailed {
  id: number;
  data: Sector;
}

type FinalSector = ParsedSectorSimple | ParsedSectorDetailed;

export async function testme() {
  const model = await createLocalCadModel('./3d-data/ivar_aasen/ivar-aasen-2020-02-03-self-contained-fix/');
  const generator = Observable.create(function(observer: any) {
    console.log('Creating generator');
    const randomLod = () => {
      switch (Math.floor(Math.random() * 3)) {
        case 0:
          return Lod.Simple;
        case 1:
          return Lod.Detailed;
        case 2:
          return Lod.Unwanted;
        default:
          return Lod.Unwanted;
      }
    };
    setInterval(() => {
      console.log('Creating wanted');
      const wanted = [
        { id: 0, lod: randomLod() },
        { id: 1, lod: randomLod() },
        { id: 2, lod: randomLod() },
        { id: 3, lod: randomLod() },
        { id: 4, lod: randomLod() }
      ];
      console.log('Wanted', wanted[0], wanted[1]);
      observer.next(wanted);
    }, 3000);
  });
  const wantedSectors = generator.pipe(flatMap((sectors: WantedSector[]) => from(sectors)));
  const simple = new Subject<WantedSector>();
  const detailed = new Subject<WantedSector>();
  const unwanted = new Subject<WantedSector>();

  const lodSubjectMap = new Map<Lod, Subject<WantedSector>>([
    [Lod.Simple, simple],
    [Lod.Detailed, simple],
    [Lod.Unwanted, unwanted]
  ]);

  // TODO consider when this subscription should be cancelled
  wantedSectors.pipe(tap((sector: WantedSector) => {
    lodSubjectMap.get(sector.lod)!.next(sector)
  })).subscribe();
  // const [simple, detailed] = partition(wantedSectors, (sector: WantedSector) => sector.lod === Lod.Simple);
  const simpleParsed = simple.pipe(
    flatMap(async (sector: WantedSector) => ({ id: sector.id, data: await model.fetchSectorSimple(sector.id) })),
    flatMap(async (sector: FetchedSectorSimple) => ({
      id: sector.id,
      data: await model.parseSimple(sector.id, sector.data)
    }))
  );
  const detailedParsed = detailed.pipe(
    flatMap(async (sector: WantedSector) => ({ id: sector.id, data: await model.fetchSectorDetailed(sector.id) })),
    flatMap(async (sector: FetchedSectorDetailed) => ({
      id: sector.id,
      data: await model.parseDetailed(sector.id, sector.data)
    }))
  );
  const pipeline = merge(simpleParsed, detailedParsed);
  // .pipe(
  // distinctUntilChanged((previous: FinalSector, current: FinalSector) => previous.id === current.id)
  // );
  const sectors = new Map<number, FinalSector>();
  pipeline.subscribe((x: FinalSector) => {
    sectors.set(x.id, x);
    console.log('Updated!');
    for (const [id, sector] of sectors) {
      console.log(id, sector.data);
    }
  });
}
