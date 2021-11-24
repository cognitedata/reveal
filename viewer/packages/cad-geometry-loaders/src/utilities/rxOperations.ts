/*!
 * Copyright 2021 Cognite AS
 */

import { Observable, of, OperatorFunction, pipe } from 'rxjs';
import { delay, startWith, switchMap, distinctUntilChanged } from 'rxjs/operators';

export function emissionLastMillis(millis: number): OperatorFunction<unknown, boolean> {
  return pipe(
    switchMap(_ => delayedSwitch(millis)),
    distinctUntilChanged()
  );
}

export function delayedSwitch(millis: number): Observable<boolean> {
  return of(false).pipe(delay(millis), startWith(true));
}
