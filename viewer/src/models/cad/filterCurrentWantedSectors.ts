/*!
 * Copyright 2020 Cognite AS
 */

import { Observable, of, pipe, OperatorFunction, empty } from 'rxjs';
import { flatMap, withLatestFrom } from 'rxjs/operators';
import { WantedSector } from '../../data/model/WantedSector';
import { ConsumedSector } from '../../data/model/ConsumedSector';

export function filterCurrentWantedSectors(
  wantedObservable: Observable<WantedSector[]>
): OperatorFunction<ConsumedSector, ConsumedSector> {
  return pipe(
    withLatestFrom(wantedObservable),
    flatMap(([loaded, wanted]) => {
      for (const wantedSector of wanted) {
        if (loaded.metadata.id === wantedSector.metadata.id && loaded.levelOfDetail === wantedSector.levelOfDetail) {
          return of(loaded);
        }
      }
      return empty();
    })
  );
}
