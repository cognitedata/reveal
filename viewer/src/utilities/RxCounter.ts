/*!
 * Copyright 2020 Cognite AS
 */

import { Subject, MonoTypeOperatorFunction, Observable } from 'rxjs';
import { scan, tap, finalize, shareReplay } from 'rxjs/operators';
import { LoadingState } from './types';

enum Action {
  Increment,
  Decrement,
  Reset
}

export class RxCounter {
  private readonly _actionSubject: Subject<Action> = new Subject();

  /**
   * Increment counter for each element in the observable.
   * @return {MonoTypeOperatorFunction<T>} The operator function to increment counter.
   */
  public incrementOnNext<T>(): MonoTypeOperatorFunction<T> {
    return tap<T>({
      next: () => {
        this._actionSubject.next(Action.Increment);
      }
    });
  }

  /**
   * Decrement counter for each element in the observable.
   * @return {MonoTypeOperatorFunction<T>} The operator function to decrement counter.
   */
  public decrementOnNext<T>(): MonoTypeOperatorFunction<T> {
    return tap<T>({
      next: () => {
        this._actionSubject.next(Action.Decrement);
      }
    });
  }

  /**
   * Reset counter when observable completes.
   * @return {MonoTypeOperatorFunction<T>} The operator function to reset counter.
   */
  public resetOnComplete<T>(): MonoTypeOperatorFunction<T> {
    return finalize<T>(() => {
      this._actionSubject.next(Action.Reset);
    });
  }

  /**
   * Get counter observable.
   * @return {Observable<number>} The counter observable.
   */
  public progressObservable(): Observable<LoadingState> {
    return this._actionSubject.pipe(
      scan(
        (loadingState, action) => {
          switch (action) {
            case Action.Increment:
              loadingState.itemsRequested++;
              break;
            case Action.Decrement:
              loadingState.itemsLoaded++;
              break;
            case Action.Reset:
              loadingState.itemsLoaded = 0;
              loadingState.itemsRequested = 0;
              break;
            default:
              throw new Error(`Unsupported action ${action}`);
          }
          return loadingState;
        },
        { itemsLoaded: 0, itemsRequested: 0 } as LoadingState
      ),
      // TODO: 24-08-2020 j-bjorne figure out how to add throttleTime to tests.
      // throttleTime(this._throttleTime, this._scheduler, { trailing: true }),
      shareReplay(1)
    );
  }
}
