/*!
 * Copyright 2021 Cognite AS
 */

/**
 * PromiseResult - Contains the result from a
 * promise together with and indicator of whether the
 * the promise resolved or rejected
 */
type PromiseResult<T> = {
  result?: T;
  error?: any;
};

/**
 * Extension utilities for Promise.
 */
export class PromiseUtils {
  /**
   * Awaits all promises in the list of promises available, returning them in an async iterator
   * as they finish. The function completes when all promises has completed and the results have
   * been yielded. Each result is given as a PromiseResult object. This function is similar to
   * Promise.all(), except that it returns results as they are ready and doesn't wait for all
   * operations to finish.
   *
   * @param promises A list of promises to complete.
   */
  static async *raceUntilAllCompleted<T>(promises: Promise<T>[]): AsyncIterable<PromiseResult<T>> {
    // Inspired by https://stackoverflow.com/a/42898229
    const remaining = new Map(
      promises.map((p, i) => [
        i,
        p
          .then(res => {
            return [i, { result: res }] as [number, PromiseResult<T>];
          })
          .catch(error => {
            return [i, { error: error }] as [number, PromiseResult<T>];
          })
      ])
    );
    while (remaining.size > 0) {
      const [i, result] = await Promise.race(remaining.values());
      remaining.delete(i);
      yield result;
    }
  }
}
