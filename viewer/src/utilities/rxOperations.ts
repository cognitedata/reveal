/*!
 * Copyright 2020 Cognite AS
 */

import { of, pipe } from 'rxjs';
import { delay, startWith, switchMap, distinctUntilChanged } from 'rxjs/operators';

export const emissionLastMillis = (millis: number) => {
  return pipe(
    switchMap(_ => delayedSwitch(millis)),
    distinctUntilChanged()
  );
};

export const delayedSwitch = (millis: number) => {
  return of(false).pipe(delay(millis), startWith(true));
};
