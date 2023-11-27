/*!
 * Copyright 2023 Cognite AS
 */

export type SequencerFunction<T> = (region: () => Promise<T> | T) => Promise<T>;

/**
 * AsyncSequencer - helper class for making sure a sequence of operations
 * are performed in the same order, while permitting dependant computations
 * to be performed in arbitrary order.
 * See the following example of a function that loads data and puts it in an
 * array:.
 *
 * ```
 * function loadData(id: any): Promise<void> {
 *   const result = await expensiveFetchOperation(id);
 *   this._array.push(result); // Shared array used for all retrieved data
 * }
 * ```
 *
 * Calling `loadData` multiple times sequentially without awaiting may
 * cause the retrieved data to be pushed to the array in an arbitrary order.
 * This may be fine in some cases, but not in others.
 * `AsyncSequencer` guarantees the order in the following way:
 *
 * ```
 * const asyncSequencer = new AsyncSequencer();
 * ...
 * // Same function signature as before
 * function loadData(id: any): Promise<void> {
 *
 *   // `getNextSequencer` returns a _sequencer_ function that takes another
 *   // function (the "critical region") as input and ensures it is run
 *   // after the critical region of the previous _sequencer_ function
 *   // retrieved from the `asyncSequencer` object with `getNextSequencer`,
 *   // and before the next such sequencer's critical region
 *   const sequencer = asyncSequencer.getNextSequencer<void>();
 *
 *   // The following line still runs and finishes at arbitrary times
 *   // across different calls to `loadData` ...
 *   const result = await expensiveFetchOperation(id);
 *
 *   // ... However, the function given to `sequencer` will always
 *   // run in the same order as the `sequencer`s were created with
 *   // `getNextSequencer`
 *   await sequencer(() => {
 *     this._array.push(result)
 *   });
 * }
 * ```
 * Note that this approach allows `expensiveFetchOperation` to be run in parallel
 * while still guaranteeing the order of the results.
 * Also, be aware that if `loadData` had been declared `async`, it is not certain
 * that the calls to `getNextSequencer` would have been in the same order as
 * the calls to the corresponding `loadData`.
 */
export class AsyncSequencer {
  private _lastPromise: Promise<void> = Promise.resolve();

  /**
   * Returns a `sequencer` function that guarantees that the
   * function it is called with is run after the previous `sequencer`'s
   * function, and before the next one's.
   */
  getNextSequencer<T>(): SequencerFunction<T> {
    return async (region: () => Promise<T> | T) => {
      const lastPromise = this._lastPromise;
      const nextPromise = new Promise<T>(async resolve => {
        await lastPromise;

        const result = await region();

        resolve(result);
      });
      this._lastPromise = nextPromise.then();
      return nextPromise;
    };
  }
}
