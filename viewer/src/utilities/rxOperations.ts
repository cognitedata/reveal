/*!
 * Copyright 2020 Cognite AS
 */

import { of, pipe, OperatorFunction } from 'rxjs';
import { delay, startWith, switchMap, distinctUntilChanged, tap } from 'rxjs/operators';

export const debug = <T>(tag: string = 'none'): OperatorFunction<T, T> => {
  return tap(
    // eslint-disable-next-line no-console
    (obj: T) => console.log(`next ${tag}`, obj),
    // eslint-disable-next-line no-console
    error => console.error(`error ${tag}`, error),
    // eslint-disable-next-line no-console
    () => console.log(`complete ${tag}`)
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
