/*!
 * Copyright 2020 Cognite AS
 */

import { RxTaskTracker, TaskTracker } from './RxTaskTracker';
import { interval, queueScheduler } from 'rxjs';
import { take, flatMap, observeOn } from 'rxjs/operators';

describe('RxTaskTracker', () => {
  test('increment on next', done => {
    const counter = new RxTaskTracker();
    const incrementCount = 4;
    const taskTracker: TaskTracker = {
      taskCount: 0,
      taskCompleted: 0
    };
    expect.assertions(incrementCount);
    const increment$ = interval(10).pipe(take(incrementCount), counter.incrementTaskCountOnNext());
    counter.getTaskTrackerObservable().subscribe({
      next: count => {
        taskTracker.taskCount++;
        expect(count).toStrictEqual(taskTracker);
      }
    });
    increment$.subscribe({
      complete: () => {
        done();
      }
    });
  });

  test('decrement on next', done => {
    // const incrementCount = 3;
    // const decrementCount = 2;
    const counter = new RxTaskTracker();
    const operationCount = 4;
    const taskTracker: TaskTracker = {
      taskCount: 0,
      taskCompleted: 0
    };
    const wait = flatMap(value => new Promise(resolve => setTimeout(resolve, 100, value)));
    expect.assertions(operationCount * 2);
    const operation$ = interval(10).pipe(
      take(operationCount),
      observeOn(queueScheduler),
      counter.incrementTaskCountOnNext(),
      wait,
      counter.incrementTaskCompletedOnNext()
    );
    let operation = 0;
    counter.getTaskTrackerObservable().subscribe({
      next: count => {
        if (operation < operationCount) {
          taskTracker.taskCount++;
        } else {
          taskTracker.taskCompleted++;
        }
        expect(count).toStrictEqual(taskTracker);
        operation++;
      }
    });
    operation$.subscribe({
      complete: () => {
        done();
      }
    });
  });
  test('reset counter', done => {
    const counter = new RxTaskTracker();
    const operationCount = 4;
    const taskTracker: TaskTracker = {
      taskCount: 0,
      taskCompleted: 0
    };
    expect.assertions(operationCount + 1);
    const operation$ = interval(10).pipe(
      take(operationCount),
      counter.incrementTaskCountOnNext(),
      counter.resetOnComplete()
    );
    let operation: number = 0;
    counter.getTaskTrackerObservable().subscribe({
      next: count => {
        if (operation < operationCount) {
          taskTracker.taskCount++;
        } else {
          taskTracker.taskCount = 0;
          taskTracker.taskCompleted = 0;
        }
        expect(count).toStrictEqual(taskTracker);
        operation++;
      }
    });
    operation$.subscribe({
      complete: () => {
        done();
      }
    });
  });
});
