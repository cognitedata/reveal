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

  public incrementOnNext<T>(): MonoTypeOperatorFunction<T> {
    return tap<T>({
      next: () => this._actionSubject.next(Action.Increment)
    });
  }

  public decrementOnNext<T>(): MonoTypeOperatorFunction<T> {
    return tap<T>({
      next: () => this._actionSubject.next(Action.Decrement)
    });
  }

  public resetOnComplete<T>(): MonoTypeOperatorFunction<T> {
    return finalize<T>(() => {
      this._actionSubject.next(Action.Reset);
    });
  }

  public observeCount(): Observable<number> {
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
