/*!
 * Copyright 2020 Cognite AS
 */

import { RxCounter } from './RxCounter';
import { interval, queueScheduler } from 'rxjs';
import { take, flatMap, observeOn } from 'rxjs/operators';
import { LoadingState } from './types';

describe('RxCounter', () => {
  test('increment on next', done => {
    const counter = new RxCounter();
    const incrementCount = 4;
    const loadingState: LoadingState = {
      itemsLoaded: 0,
      itemsRequested: 0
    };
    expect.assertions(incrementCount);
    const increment$ = interval(10).pipe(take(incrementCount), observeOn(queueScheduler), counter.incrementOnNext());
    counter.progressObservable().subscribe({
      next: count => {
        loadingState.itemsRequested++;
        expect(count).toStrictEqual(loadingState);
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
    const loadingState: LoadingState = {
      itemsLoaded: 0,
      itemsRequested: 0
    };
    const wait = flatMap(value => new Promise(resolve => setTimeout(resolve, 100, value)));
    expect.assertions(operationCount * 2);
    const operation$ = interval(10).pipe(
      take(operationCount),
      observeOn(queueScheduler),
      counter.incrementOnNext(),
      wait,
      counter.decrementOnNext()
    );
    let operation = 0;
    counter.progressObservable().subscribe({
      next: count => {
        if (operation < operationCount) {
          loadingState.itemsRequested++;
        } else {
          loadingState.itemsLoaded++;
        }
        expect(count).toStrictEqual(loadingState);
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
    const loadingState: LoadingState = {
      itemsLoaded: 0,
      itemsRequested: 0
    };
    expect.assertions(operationCount + 1);
    const operation$ = interval(10).pipe(take(operationCount), counter.incrementOnNext(), counter.resetOnComplete());
    let operation: number = 0;
    counter.progressObservable().subscribe({
      next: count => {
        if (operation < operationCount) {
          loadingState.itemsRequested++;
        } else {
          loadingState.itemsLoaded = 0;
          loadingState.itemsRequested = 0;
        }
        expect(count).toStrictEqual(loadingState);
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
