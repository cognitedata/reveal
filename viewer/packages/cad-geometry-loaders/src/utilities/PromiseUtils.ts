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
      promises.map(p => [
        p,
        p
          .then(res => {
            return [p, { result: res }] as [Promise<T>, PromiseResult<T>];
          })
          .catch(error => {
            return [p, { error: error }] as [Promise<T>, PromiseResult<T>];
          })
      ])
    );
    while (remaining.size > 0) {
      const [promise, result] = await Promise.race(remaining.values());
      remaining.delete(promise);
      yield result;
    }
  }
}
