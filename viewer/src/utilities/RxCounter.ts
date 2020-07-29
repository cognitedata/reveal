/*!
 * Copyright 2020 Cognite AS
 */

import { Subject, MonoTypeOperatorFunction, Observable } from 'rxjs';
import { scan, tap, finalize, shareReplay } from 'rxjs/operators';

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
  public countObservable(): Observable<number> {
    return this._actionSubject.pipe(
      scan((count, action) => {
        switch (action) {
          case Action.Increment:
            return count + 1;
          case Action.Decrement:
            return count - 1;
          case Action.Reset:
            return 0;
          default:
            throw new Error(`Unsupported action ${action}`);
        }
      }, 0),
      shareReplay(1)
    );
  }
}
