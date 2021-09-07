/*!
 * Copyright 2021 Cognite AS
 */

/**
 * Extension utilities for Promise.
 */
export class PromiseUtils {
  /**
   * Awaits all promises in the list of promises available, returning them in an async iterator
   * as they finish. The function completes when all promises has completed and the results have
   * been yielded, or one of the promises provided rejects. This function is similar to
   * Promise.all(), except that it returns results as they are ready and doesn't wait for all
   * operations to finish.
   *
   * @param promises A list of promises to complete.
   */
  static async *raceUntilAllCompleted<T>(promises: Promise<T>[]): AsyncIterable<T> {
    // Inspired by https://stackoverflow.com/a/42898229
    const remaining = new Map(promises.map(p => [p, p.then(() => [p])]));
    while (remaining.size > 0) {
      const [completed] = await Promise.race(remaining.values());
      remaining.delete(completed);
      yield completed;
    }
  }
}
