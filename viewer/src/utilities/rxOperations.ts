/*!
 * Copyright 2020 Cognite AS
 */

import { of, pipe, OperatorFunction } from 'rxjs';
import { delay, startWith, switchMap, distinctUntilChanged, tap } from 'rxjs/operators';

export const debug = <T extends {}>(tag: string = 'none'): OperatorFunction<T, T> => {
  return tap(
    // tslint:disable: no-console
    (obj: T) => console.log(`next ${tag}`, obj),
    error => console.error(`error ${tag}`, error),
    () => console.log(`complete ${tag}`)
    // tslint:enable: no-console
  );
};

export const emissionLastMillis = (millis: number) => {
  return pipe(
    switchMap(_ => delayedSwitch(millis)),
    distinctUntilChanged()
  );
};

export const delayedSwitch = (millis: number) => {
  return of(false).pipe(delay(millis), startWith(true));
};
