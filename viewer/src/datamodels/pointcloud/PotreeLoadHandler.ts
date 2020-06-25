/*!
 * Copyright 2020 Cognite AS
 */
import * as Potree from '@cognite/potree-core';
import { Observable, interval } from 'rxjs';
import { map, share, distinctUntilChanged, startWith } from 'rxjs/operators';

export class PotreeLoadHandler {
  private static isLoading(): boolean {
    return Potree.Global.numNodesLoading > 0;
  }

  private readonly _potreeLoadObservable: Observable<boolean>;
  constructor(intervalMillis: number = 1000) {
    this._potreeLoadObservable = interval(intervalMillis).pipe(map(_ => PotreeLoadHandler.isLoading()));
  }

  observer(): Observable<boolean> {
    return this._potreeLoadObservable.pipe(share(), startWith(PotreeLoadHandler.isLoading()), distinctUntilChanged());
  }
}
