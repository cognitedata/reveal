/*!
 * Copyright 2020 Cognite AS
 */

import { Observable, of, pipe, OperatorFunction, empty } from 'rxjs';
import { flatMap, withLatestFrom } from 'rxjs/operators';
import { ParsedSector } from '../../data/model/ParsedSector';
import { WantedSector } from '../../data/model/WantedSector';

export function filterCurrentWantedSectors(
  wantedObservable: Observable<WantedSector[]>
): OperatorFunction<ParsedSector, ParsedSector> {
  return pipe(
    withLatestFrom(wantedObservable),
    flatMap(([loaded, wanted]) => {
      for (const wantedSector of wanted) {
        if (loaded.id === wantedSector.sectorId && loaded.levelOfDetail === wantedSector.levelOfDetail) {
          return of(loaded);
        }
      }
      return empty();
    })
  );
}
