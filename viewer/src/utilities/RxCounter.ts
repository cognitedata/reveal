/*!
 * Copyright 2020 Cognite AS
 */

import { Subject, MonoTypeOperatorFunction, Observable } from 'rxjs';
import { scan, tap, finalize, shareReplay } from 'rxjs/operators';
import { Progress } from './types';

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
      next: () => this._actionSubject.next(Action.Increment)
    });
  }

  /**
   * Decrement counter for each element in the observable.
   * @return {MonoTypeOperatorFunction<T>} The operator function to decrement counter.
   */
  public decrementOnNext<T>(): MonoTypeOperatorFunction<T> {
    return tap<T>({
      next: () => this._actionSubject.next(Action.Decrement)
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
  public progressObservable(): Observable<Progress> {
    return this._actionSubject.pipe(
      scan(
        (progress, action) => {
          switch (action) {
            case Action.Increment:
              progress.remaining++;
              progress.total++;
              break;
            case Action.Decrement:
              progress.remaining--;
              progress.completed++;
              break;
            case Action.Reset:
              progress.total = 0;
              progress.remaining = 0;
              progress.completed = 0;
              break;
            default:
              throw new Error(`Unsupported action ${action}`);
          }
          return progress;
        },
        { total: 0, remaining: 0, completed: 0 }
      ),
      shareReplay(1)
    );
  }
}
