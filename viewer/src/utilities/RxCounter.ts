/*!
 * Copyright 2020 Cognite AS
 */

import { Subject, MonoTypeOperatorFunction, Observable } from 'rxjs';
import { scan, tap, finalize, shareReplay } from 'rxjs/operators';

enum Action {
  Add,
  Remove,
  Clear
}

export class RxCounter {
  private readonly _actionSubject: Subject<Action> = new Subject();

  public incrementOnNext<T>(): MonoTypeOperatorFunction<T> {
    return tap<T>({
      next: () => this._actionSubject.next(Action.Add)
    });
  }

  public decrementOnNext<T>(): MonoTypeOperatorFunction<T> {
    return tap<T>({
      next: () => this._actionSubject.next(Action.Remove)
    });
  }

  public resetOnComplete<T>(): MonoTypeOperatorFunction<T> {
    return finalize<T>(() => {
      this._actionSubject.next(Action.Clear);
    });
  }

  public observeCount(): Observable<number> {
    return this._actionSubject.pipe(
      scan((count, action) => {
        switch (action) {
          case Action.Add:
            return count + 1;
          case Action.Remove:
            return count - 1;
          case Action.Clear:
            return 0;
          default:
            throw new Error(`Unsupported action ${action}`);
        }
      }, 0),
      shareReplay(1)
    );
  }
}
