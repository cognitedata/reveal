/*!
 * Copyright 2020 Cognite AS
 */

import { RxCounter } from './RxCounter';
import { interval } from 'rxjs';
import { take, flatMap } from 'rxjs/operators';

describe('RxCounter', () => {
  test('increment on next', done => {
    const counter = new RxCounter();
    const incrementCount = 4;
    expect.assertions(incrementCount);
    const increment$ = interval(10).pipe(take(incrementCount), counter.incrementOnNext());
    let expectedCount: number = 0;
    counter.countObservable().subscribe({
      next: count => {
        expectedCount++;
        expect(count).toBe(expectedCount);
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
    const wait = flatMap(value => new Promise(resolve => setTimeout(resolve, 100, value)));
    expect.assertions(operationCount * 2);
    const operation$ = interval(10).pipe(
      take(operationCount),
      counter.incrementOnNext(),
      wait,
      counter.decrementOnNext()
    );
    let expectedCount: number = 0;
    let increment = 1;
    counter.countObservable().subscribe({
      next: count => {
        expectedCount += increment;
        expect(count).toBe(expectedCount);
        if (expectedCount == operationCount) {
          increment = -1;
        }
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
    expect.assertions(operationCount + 1);
    const operation$ = interval(10).pipe(take(operationCount), counter.incrementOnNext(), counter.resetOnComplete());
    let expectedCount: number = 0;
    counter.countObservable().subscribe({
      next: count => {
        expectedCount++;
        expect(count).toBe(expectedCount);
        if (expectedCount == operationCount) {
          expectedCount = 0;
        }
      }
    });
    operation$.subscribe({
      complete: () => {
        done();
      }
    });
  });
});
