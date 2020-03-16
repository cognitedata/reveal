/*!
 * Copyright 2020 Cognite AS
 */

import { pipe, GroupedObservable } from 'rxjs';
import { groupBy, distinctUntilKeyChanged, mergeMap } from 'rxjs/operators';
import { WantedSector } from '../../data/model/WantedSector';

export function distinctUntilLevelOfDetailChanged() {
  return pipe(
    groupBy((sector: WantedSector) => sector.id),
    mergeMap((group: GroupedObservable<number, WantedSector>) => group.pipe(distinctUntilKeyChanged('levelOfDetail')))
  );
}
