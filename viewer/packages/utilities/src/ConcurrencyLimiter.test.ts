/*!
 * Copyright 2026 Cognite AS
 */

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
  await new Promise<void>(resolve => setImmediate(resolve));
}

describe(ConcurrencyLimiter.name, () => {
  test.each([0, -1, NaN, Infinity])('throws for invalid maxConcurrent %s', maxConcurrent => {
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
});
