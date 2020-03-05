/*!
 * Copyright 2020 Cognite AS
 */

import { Observable, from, of, partition, merge, Subject, pipe, GroupedObservable, OperatorFunction, empty } from 'rxjs';
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
  scan,
  publish,
  delay,
  startWith,
  withLatestFrom
} from 'rxjs/operators';
import { SectorQuads, WantedSectors, Sector } from './models/cad/types';

enum Lod {
  Discarded,
  Hidden,
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

type FinalSector = WantedSector | ParsedSectorSimple | ParsedSectorDetailed;

export async function testme() {
  const model = await createLocalCadModel('./3d-data/ivar_aasen/ivar-aasen-2020-02-03-self-contained-fix/');
  const wantedSectors: Observable<WantedSector[]> = Observable.create(function(observer: any) {
    console.log('Creating generator');
    const randomLod = () => {
      switch (Math.floor(Math.random() * 3)) {
        case 0:
          return Lod.Simple;
        case 1:
          return Lod.Detailed;
        case 2:
          return Lod.Discarded;
        default:
          return Lod.Discarded;
      }
    };
    setTimeout(() => {
      const wanted = [
        { id: 0, lod: Lod.Simple },
        { id: 1, lod: Lod.Simple },
        { id: 2, lod: Lod.Simple },
        { id: 3, lod: Lod.Simple },
        { id: 4, lod: Lod.Simple }
      ];
      observer.next(wanted);
    }, 100);
    setTimeout(() => {
      const wanted = [
        { id: 0, lod: Lod.Detailed },
        { id: 1, lod: Lod.Detailed },
        { id: 2, lod: Lod.Detailed },
        { id: 3, lod: Lod.Detailed },
        { id: 4, lod: Lod.Detailed }
      ];
      observer.next(wanted);
    }, 3000);
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
      data: fetchedData
    };
  });

  const parseSimple = flatMap(async (sector: FetchedSectorSimple) => {
    const parsedData = await model.parseSimple(sector.id, sector.data);
    return {
      id: sector.id,
      lod: sector.lod,
      data: parsedData
    };
  });

  const fetchDetailed = flatMap(async (sector: WantedSector) => {
    const fetchedData = await model.fetchSectorDetailed(sector.id);
    return {
      id: sector.id,
      lod: sector.lod,
      data: fetchedData
    };
  });

  const parseDetailed = flatMap(async (sector: FetchedSectorDetailed) => {
    const parsedData = await model.parseDetailed(sector.id, sector.data);
    return {
      id: sector.id,
      lod: sector.lod,
      data: parsedData
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
          delay(5000),
          parseDetailed
        )
      )
    )
  );

  const handleWantedSectors: OperatorFunction<WantedSector, FinalSector> = pipe(
    distinctUntilLodChanged,
    getFinalSectorByLod
  );

  // TODO consider when this subscription should be cancelled
  wantedSectors
    .pipe(
      publish(multicast =>
        multicast.pipe(
          flatMap((sectors: WantedSector[]) => from(sectors)),
          handleWantedSectors,
          withLatestFrom(multicast),
          flatMap(([loaded, wanted]) => {
            for (const wantedSector of wanted) {
              if (loaded.id === wantedSector.id && loaded.lod === wantedSector.lod) {
                return of(loaded);
              }
            }
            return empty();
          }),
          scan((sectors: Map<number, FinalSector>, sector: WantedSector) => {
            sectors.set(sector.id, sector);
            return sectors;
          }, new Map())
        )
      ),
    )
    .subscribe((sectors: Map<number, WantedSector>) => {
      console.log('-------- Results: ---------');
      for (const [id, sector] of sectors) {
        console.log(id, sector.lod);
      }
    });
}
