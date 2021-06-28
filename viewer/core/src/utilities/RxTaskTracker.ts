/*!
 * Copyright 2021 Cognite AS
 */

import { Subject, MonoTypeOperatorFunction, Observable } from 'rxjs';
import { scan, tap, finalize, shareReplay } from 'rxjs/operators';

enum Action {
  IncreaseTaskCount,
  IncreaseTaskCompleted,
  Reset
}

export interface TaskTracker {
  taskCount: number;
  taskCompleted: number;
}

export class RxTaskTracker {
  private readonly _actionSubject: Subject<Action> = new Subject();

  /**
   * Increment counter for each element in the observable.
   * @returns The operator function to increment counter.
   */
  public incrementTaskCountOnNext<T>(): MonoTypeOperatorFunction<T> {
    return tap<T>({
      next: () => {
        this._actionSubject.next(Action.IncreaseTaskCount);
      }
    });
  }

  /**
   * Decrement counter for each element in the observable.
   * @returns The operator function to decrement counter.
   */
  public incrementTaskCompletedOnNext<T>(): MonoTypeOperatorFunction<T> {
    return tap<T>({
      next: () => {
        this._actionSubject.next(Action.IncreaseTaskCompleted);
      }
    });
  }

  /**
   * Reset counter when observable completes.
   * @returns The operator function to reset counter.
   */
  public resetOnComplete<T>(): MonoTypeOperatorFunction<T> {
    return finalize<T>(() => {
      this._actionSubject.next(Action.Reset);
    });
  }

  /**
   * Get counter observable.
   * @returns The counter observable.
   */
  public getTaskTrackerObservable(): Observable<TaskTracker> {
    return this._actionSubject.pipe(
      scan(
        (taskTracker, action) => {
          switch (action) {
            case Action.IncreaseTaskCount:
              taskTracker.taskCount++;
              break;
            case Action.IncreaseTaskCompleted:
              taskTracker.taskCompleted++;
              break;
            case Action.Reset:
              taskTracker.taskCount = 0;
              taskTracker.taskCompleted = 0;
              break;
            default:
              throw new Error(`Unsupported action ${action}`);
          }
          return taskTracker;
        },
        { taskCount: 0, taskCompleted: 0 } as TaskTracker
      ),
      shareReplay(1)
    );
  }
}
