/*!
 * Copyright 2025 Cognite AS
 */
import debounce from 'lodash/debounce';

export interface BatchedDebounce<T, R> {
  (item: T): Promise<R>;
  cancel: () => void;
}

type BatchCallback<T, R> = (items: T[]) => R extends void ? Promise<void> | void : Promise<R[]> | R[];

/**
 * Creates a debounced function that batches multiple individual calls into a single batch operation.
 * Each call returns a promise that resolves with the corresponding result from the batch callback.
 *
 * @template T - The type of input items
 * @template R - The type of result items (use void for callbacks that don't return results)
 *
 * @param callback - Function that processes a batch of items. Should return an array with the same
 * length as the input array, or void if no results are needed.
 * @param wait - The number of milliseconds to delay before processing the batch
 * @param options - Optional debounce options (leading, trailing, maxWait) passed to lodash debounce
 *
 * @returns A debounced function that accepts individual items and returns promises for their results.
 * The function includes a `cancel()` method to cancel pending batches.
 *
 * @example
 * ```typescript
 * // With results
 * const batchedFetch = batchedDebounce(
 *   async (ids: number[]) => {
 *     const response = await fetch('/api/items', {
 *       method: 'POST',
 *       body: JSON.stringify({ ids })
 *     });
 *     return response.json();
 *   },
 *   100
 * );
 *
 * const item1 = batchedFetch(1);
 * const item2 = batchedFetch(2);
 * const results = await Promise.all([item1, item2]);
 *
 * // Without results (void)
 * const batchedLog = batchedDebounce(
 *   async (ids: number[]) => {
 *     await fetch('/api/log', {
 *       method: 'POST',
 *       body: JSON.stringify({ ids })
 *     });
 *   },
 *   100
 * );
 *
 * await batchedLog(1);
 * ```
 */
export function batchedDebounce<T, R = void>(
  callback: BatchCallback<T, R>,
  wait: number,
  options?: Parameters<typeof debounce>[2]
): BatchedDebounce<T, R> {
  type Task = {
    input: T;
    resolve: (value: R) => void;
    reject: (reason: unknown) => void;
  };

  let buffer: Task[] = [];

  const processBatch = async () => {
    if (buffer.length === 0) return;

    const currentBatch = buffer;
    buffer = [];

    const inputs = currentBatch.map(task => task.input);

    try {
      const results = await callback(inputs);

      if (results === undefined) {
        currentBatch.forEach(task => {
          task.resolve(undefined as R); // R is void in this case, though TS can't infer that
        });
      } else {
        if (results.length !== inputs.length) {
          throw new Error('Batch result length mismatch');
        }

        currentBatch.forEach((task, index) => {
          task.resolve(results[index]);
        });
      }
    } catch (err) {
      currentBatch.forEach(task => {
        task.reject(err);
      });
    }
  };

  const debouncedTrigger = debounce(processBatch, wait, options);

  const wrapper = (item: T): Promise<R> => {
    return new Promise<R>((resolve, reject) => {
      buffer.push({ input: item, resolve, reject });
      debouncedTrigger();
    });
  };

  wrapper.cancel = () => {
    debouncedTrigger.cancel();
    if (buffer.length > 0) {
      buffer.forEach(task => task.reject(new Error('Debounce cancelled')));
      buffer = [];
    }
  };

  return wrapper;
}
