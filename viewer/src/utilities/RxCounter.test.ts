/*!
 * Copyright 2020 Cognite AS
 */

import { RxCounter } from './RxCounter';
import { interval } from 'rxjs';
import { take, flatMap } from 'rxjs/operators';
import { Progress } from './types';

describe('RxCounter', () => {
  test('increment on next', done => {
    const counter = new RxCounter();
    const incrementCount = 4;
    const progress: Progress = {
      total: 0,
      remaining: 0,
      completed: 0
    };
    expect.assertions(incrementCount);
    const increment$ = interval(10).pipe(take(incrementCount), counter.incrementOnNext());
    counter.progressObservable().subscribe({
      next: count => {
        progress.total++;
        progress.remaining++;
        expect(count).toStrictEqual(progress);
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
    const counter = new RxCounter();
    const operationCount = 4;
    const progress: Progress = {
      total: 0,
      remaining: 0,
      completed: 0
    };
    const wait = flatMap(value => new Promise(resolve => setTimeout(resolve, 100, value)));
    expect.assertions(operationCount * 2);
    const operation$ = interval(10).pipe(
      take(operationCount),
      counter.incrementOnNext(),
      wait,
      counter.decrementOnNext()
    );
    let operation = 0;
    counter.progressObservable().subscribe({
      next: count => {
        if (operation < operationCount) {
          progress.total++;
          progress.remaining++;
        } else {
          progress.remaining--;
          progress.completed++;
        }
        expect(count).toStrictEqual(progress);
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
    const counter = new RxCounter();
    const operationCount = 4;
    const progress: Progress = {
      total: 0,
      remaining: 0,
      completed: 0
    };
    expect.assertions(operationCount + 1);
    const operation$ = interval(10).pipe(take(operationCount), counter.incrementOnNext(), counter.resetOnComplete());
    let operation: number = 0;
    counter.progressObservable().subscribe({
      next: count => {
        if (operation < operationCount) {
          progress.total++;
          progress.remaining++;
        } else {
          progress.total = 0;
          progress.remaining = 0;
          progress.completed = 0;
        }
        expect(count).toStrictEqual(progress);
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
