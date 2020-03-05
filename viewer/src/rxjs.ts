/*!
 * Copyright 2020 Cognite AS
 */

import { Observable, from, of, partition, merge, Subject, pipe, GroupedObservable } from 'rxjs';
import { createLocalCadModel } from './datasources/local/cad/createLocalCadModel';
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
  scan
} from 'rxjs/operators';
import { SectorQuads, WantedSectors, Sector } from './models/cad/types';

enum Lod {
  Unwanted,
  Simple,
  Detailed
}

interface WantedSector {
  id: number;
  lod: Lod;
}

interface FetchedSectorSimple {
  id: number;
  data: Uint8Array;
  lod: Lod;
}

interface FetchedSectorDetailed {
  id: number;
  data: Uint8Array;
  lod: Lod;
}

interface ParsedSectorSimple {
  id: number;
  data: SectorQuads;
  lod: Lod;
}

interface ParsedSectorDetailed {
  id: number;
  data: Sector;
  lod: Lod;
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
      const wanted = [
        { id: 0, lod: randomLod() },
        { id: 1, lod: randomLod() },
        { id: 2, lod: randomLod() },
        { id: 3, lod: randomLod() },
        { id: 4, lod: randomLod() }
      ];
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

  const distinctUntilLodChanged = pipe(
    groupBy((sector: WantedSector) => sector.id),
    mergeMap((group: GroupedObservable<number, WantedSector>) =>
      group.pipe(
        distinctUntilKeyChanged('lod')
      )
    )
  );

  const handleWantedSectors = pipe(
    distinctUntilLodChanged,
    scan((sectors: Map<number, WantedSector>, sector: WantedSector) => {
      sectors.set(sector.id, sector);
      return sectors;
    }, new Map()),
  );

  // TODO consider when this subscription should be cancelled
  wantedSectors.pipe(handleWantedSectors).subscribe((sectors: Map<number, WantedSector>) => {
    console.log("-------- Results: ---------");
    for (const [id, sector] of sectors) {
      console.log(id, sector.lod);
    }
  });
  // const [simple, detailed] = partition(wantedSectors, (sector: WantedSector) => sector.lod === Lod.Simple);
  // const simpleParsed = simple.pipe(
  // flatMap(async (sector: WantedSector) => ({
  // id: sector.id,
  // data: await model.fetchSectorSimple(sector.id),
  // lod: sector.lod
  // })),
  // flatMap(async (sector: FetchedSectorSimple) => ({
  // id: sector.id,
  // data: await model.parseSimple(sector.id, sector.data),
  // lod: sector.lod
  // }))
  // );
  // const detailedParsed = detailed.pipe(
  // flatMap(async (sector: WantedSector) => ({
  // id: sector.id,
  // data: await model.fetchSectorDetailed(sector.id),
  // lod: sector.lod
  // })),
  // flatMap(async (sector: FetchedSectorDetailed) => ({
  // id: sector.id,
  // data: await model.parseDetailed(sector.id, sector.data),
  // lod: sector.lod
  // }))
  // );
  // const pipeline = merge(simpleParsed, detailedParsed);
  //// .pipe(
  //// distinctUntilChanged((previous: FinalSector, current: FinalSector) => previous.id === current.id)
  //// );
  // const sectors = new Map<number, FinalSector>();
  // pipeline.subscribe((x: FinalSector) => {
  // sectors.set(x.id, x);
  // console.log('Got', x.id, x.lod);
  // for (const [id, sector] of sectors) {
  // console.log(id, sector.lod);
  // }
  // });
}
