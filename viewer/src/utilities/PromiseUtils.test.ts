/*!
 * Copyright 2021 Cognite AS
 */

import { asyncIteratorToArray } from '../__testutilities__/asyncIteratorToArray';
import { PromiseUtils } from './PromiseUtils';

describe('PromiseUtils', () => {
  describe('raceUntilAllCompleted', () => {
    test('Empty list, returns no elements', async () => {
      const results = await asyncIteratorToArray(PromiseUtils.raceUntilAllCompleted<number>([]));
      expect(results).toBeEmpty();
    });

    test('Single item list', async () => {
      const results = await asyncIteratorToArray(PromiseUtils.raceUntilAllCompleted([Promise.resolve(1)]));
      expect(results).toEqual([1]);
    });

    test('Two items, returns items in order they are finished', async () => {
      const p1 = new FakePromise<number>();
      const p2 = new FakePromise<number>();

      const operations = PromiseUtils.raceUntilAllCompleted([p1.promise, p2.promise]);
      const results = asyncIteratorToArray(operations);
      p2.resolve(2);
      p1.resolve(1);

      expect(await results).toEqual([2, 1]);
    });

    test('Two items, one rejects - rejects', async () => {
      const p1 = new FakePromise<number>();
      const p2 = new FakePromise<number>();

      const operations = PromiseUtils.raceUntilAllCompleted([p1.promise, p2.promise]);
      const results = asyncIteratorToArray(operations);
      p1.reject('error');

      expect(results).toReject();
    });
  });
});

class FakePromise<T> {
  readonly promise: Promise<T>;
  private _resolve: (v: T) => void;
  private _reject: (error: any) => void;

  constructor() {
    this._resolve = this._reject = () => {};
    this.promise = new Promise<T>((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    });
  }

  resolve(result: T) {
    this._resolve(result);
  }

  reject(error: any) {
    this._reject(error);
  }
}
