/*!
 * Copyright 2020 Cognite AS
 */
import * as Potree from '@cognite/potree-core';
import { Observable, interval } from 'rxjs';
import { map, share, distinctUntilChanged, startWith } from 'rxjs/operators';
import { LoadingState } from '@/utilities';

export class PotreeLoadHandler {
  private static getLoadingState(): LoadingState {
    return {
      isLoading: Potree.Global.numNodesLoading > 0,
      itemsLoaded: 0,
      itemsRequested: Potree.Global.numNodesLoading
    };
  }

  private readonly _potreeLoadObservable: Observable<LoadingState>;
  constructor(intervalMillis: number = 1000) {
    this._potreeLoadObservable = interval(intervalMillis).pipe(map(_ => PotreeLoadHandler.getLoadingState()));
  }

  observer(): Observable<LoadingState> {
    return this._potreeLoadObservable.pipe(
      share(),
      startWith(PotreeLoadHandler.getLoadingState()),
      distinctUntilChanged()
    );
  }
}
