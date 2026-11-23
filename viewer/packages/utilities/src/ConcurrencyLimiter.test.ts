/*!
 * Copyright 2026 Cognite AS
 */

import { vi } from 'vitest';
import { ConcurrencyLimiter } from './ConcurrencyLimiter';

type Deferred<T> = {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason: Error) => void;
};

function createDeferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

async function flushMicrotasks(): Promise<void> {
  await vi.advanceTimersByTimeAsync(0);
}

describe(ConcurrencyLimiter.name, () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test.each([0, -1, 1.5, NaN, Infinity])('throws for invalid maxConcurrent %s', maxConcurrent => {
    expect(() => new ConcurrencyLimiter(maxConcurrent)).toThrow();
  });

  test('returns the value of the operation', async () => {
    const limiter = new ConcurrencyLimiter(1);

    const result = await limiter.run(async () => 42);

    expect(result).toBe(42);
  });

  test('never runs more operations than the limit and queues the rest', async () => {
    const limiter = new ConcurrencyLimiter(2);
    const deferreds = Array.from({ length: 5 }, () => createDeferred<number>());
    let running = 0;
    let maxRunning = 0;
    const started: number[] = [];

    const promises = deferreds.map((deferred, index) =>
      limiter.run(async () => {
        started.push(index);
        running++;
        maxRunning = Math.max(maxRunning, running);
        try {
          return await deferred.promise;
        } finally {
          running--;
        }
      })
    );

    await flushMicrotasks();
    expect(started).toEqual([0, 1]);

    for (let i = 0; i < deferreds.length; i++) {
      deferreds[i].resolve(i);
      await flushMicrotasks();
    }

    expect(await Promise.all(promises)).toEqual([0, 1, 2, 3, 4]);
    expect(maxRunning).toBe(2);
  });

  test('starts queued operations in FIFO order', async () => {
    const limiter = new ConcurrencyLimiter(1);
    const deferreds = Array.from({ length: 3 }, () => createDeferred<void>());
    const started: number[] = [];

    const promises = deferreds.map((deferred, index) =>
      limiter.run(async () => {
        started.push(index);
        await deferred.promise;
      })
    );

    for (const deferred of deferreds) {
      await flushMicrotasks();
      deferred.resolve();
    }
    await Promise.all(promises);

    expect(started).toEqual([0, 1, 2]);
  });

  test('releases the slot when an operation rejects so queued operations still run', async () => {
    const limiter = new ConcurrencyLimiter(1);
    const failing = createDeferred<void>();

    const failingPromise = limiter.run(() => failing.promise);
    const followingPromise = limiter.run(async () => 'next');

    failing.reject(new Error('boom'));

    await expect(failingPromise).rejects.toThrow('boom');
    await expect(followingPromise).resolves.toBe('next');
  });

  test('releases the slot when an operation throws synchronously', async () => {
    const limiter = new ConcurrencyLimiter(1);

    const throwingPromise = limiter.run<void>(() => {
      throw new Error('sync boom');
    });
    const followingPromise = limiter.run(async () => 'next');

    await expect(throwingPromise).rejects.toThrow('sync boom');
    await expect(followingPromise).resolves.toBe('next');
  });

  test('starts an operation immediately when below the limit', async () => {
    const limiter = new ConcurrencyLimiter(2);
    const started: number[] = [];
    const deferreds = [createDeferred<void>(), createDeferred<void>(), createDeferred<void>()];

    const promises = deferreds.map((deferred, index) =>
      limiter.run(() => {
        started.push(index);
        return deferred.promise;
      })
    );

    // No awaiting needed: the first two start synchronously, the third is queued
    expect(started).toEqual([0, 1]);

    deferreds.forEach(deferred => deferred.resolve());
    await Promise.all(promises);
    expect(started).toEqual([0, 1, 2]);
  });

  describe('abort signal', () => {
    test('drops a queued operation whose signal aborts without ever starting it', async () => {
      const limiter = new ConcurrencyLimiter(1);
      const blocker = createDeferred<void>();
      const running = limiter.run(() => blocker.promise);

      const abortController = new AbortController();
      let queuedStarted = false;
      const queued = limiter.run(async () => {
        queuedStarted = true;
      }, abortController.signal);

      abortController.abort();
      await expect(queued).rejects.toBe(abortController.signal.reason);

      blocker.resolve();
      await running;
      await flushMicrotasks();
      expect(queuedStarted).toBe(false);
    });

    test('aborting one queued operation leaves the others in order', async () => {
      const limiter = new ConcurrencyLimiter(1);
      const blocker = createDeferred<void>();
      const started: string[] = [];
      const running = limiter.run(() => blocker.promise);

      const abortController = new AbortController();
      const first = limiter.run(async () => {
        started.push('first');
      });
      const aborted = limiter.run(async () => {
        started.push('aborted');
      }, abortController.signal);
      const last = limiter.run(async () => {
        started.push('last');
      });

      abortController.abort();
      await expect(aborted).rejects.toBe(abortController.signal.reason);

      blocker.resolve();
      await Promise.all([running, first, last]);
      expect(started).toEqual(['first', 'last']);
    });

    test('rejects immediately without starting when the signal is already aborted', async () => {
      const limiter = new ConcurrencyLimiter(1);
      const abortController = new AbortController();
      abortController.abort();
      let started = false;

      await expect(
        limiter.run(async () => {
          started = true;
        }, abortController.signal)
      ).rejects.toBe(abortController.signal.reason);

      expect(started).toBe(false);
    });

    test('aborting after the operation started does not cancel it or free its slot', async () => {
      const limiter = new ConcurrencyLimiter(1);
      const abortController = new AbortController();
      const deferred = createDeferred<string>();
      const started: string[] = [];

      const run = limiter.run(() => deferred.promise, abortController.signal);
      const following = limiter.run(async () => {
        started.push('following');
      });
      abortController.abort();
      await flushMicrotasks();

      // Still running, so the following operation must still be waiting
      expect(started).toEqual([]);

      deferred.resolve('done');
      await expect(run).resolves.toBe('done');
      await following;
      expect(started).toEqual(['following']);
    });

    test('does not leave abort listeners behind once the operation has started', async () => {
      const limiter = new ConcurrencyLimiter(1);
      const abortController = new AbortController();
      const removeListener = vi.spyOn(abortController.signal, 'removeEventListener');

      await limiter.run(async () => 'ok', abortController.signal);

      expect(removeListener).toHaveBeenCalledWith('abort', expect.any(Function));
    });
  });
});
