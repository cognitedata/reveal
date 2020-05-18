/*!
 * Copyright 2020 Cognite AS
 */

import { RateLimiter } from '@/utilities/RateLimiter';

describe('RateLimiter', () => {
  test('Aqcuire and release', async () => {
    const rateLimiter = new RateLimiter(3);
    const result1 = await rateLimiter.acquire();
    expect(result1).toBe(true);
    const result2 = await rateLimiter.acquire();
    expect(result2).toBe(true);
    const result3 = await rateLimiter.acquire();
    expect(result3).toBe(true);
    expect(rateLimiter.usedSlots()).toBe(3);
    rateLimiter.release();
    rateLimiter.release();
    rateLimiter.release();
    expect(rateLimiter.usedSlots()).toBe(0);
  });

  test('Aqcuire and clear', async () => {
    const rateLimiter = new RateLimiter(3);
    const result1 = await rateLimiter.acquire();
    expect(result1).toBe(true);
    const result2 = await rateLimiter.acquire();
    expect(result2).toBe(true);
    const result3 = await rateLimiter.acquire();
    expect(result3).toBe(true);
    expect(rateLimiter.usedSlots()).toBe(3);
    rateLimiter.clearPendingRequests();
    // Slots are still in use by the acquirers,
    // which need to release them manually
    expect(rateLimiter.usedSlots()).toBe(3);
    rateLimiter.release();
    rateLimiter.release();
    rateLimiter.release();
    expect(rateLimiter.usedSlots()).toBe(0);
  });

  test('Aqcuire too many and resolve should work even for those over limit', async () => {
    const rateLimiter = new RateLimiter(3);
    let resolver: (() => void) | undefined;
    const promise = new Promise(resolve => {
      resolver = resolve;
    });
    const acquirer = async () => {
      const result = await rateLimiter.acquire();
      await promise;
      rateLimiter.release();
      return result;
    };
    const successfulAcquirer1 = acquirer();
    const successfulAcquirer2 = acquirer();
    const successfulAcquirer3 = acquirer();
    const failingAcquirer = acquirer();
    expect(rateLimiter.usedSlots()).toBe(3);
    resolver!();
    expect(await successfulAcquirer1).toBe(true);
    expect(await successfulAcquirer2).toBe(true);
    expect(await successfulAcquirer3).toBe(true);
    expect(await failingAcquirer).toBe(true);
  });

  const createPromise = () => {
    let resolver: (() => void) | undefined;
    const promise = new Promise(resolve => {
      resolver = resolve;
    });
    return {
      promise,
      resolver: resolver!
    };
  };

  const createAcquirer = (rateLimiter: RateLimiter) => {
    const { promise, resolver } = createPromise();
    const { promise: internalPromise, resolver: internalResolver } = createPromise();
    const acquirer = async () => {
      const result = await rateLimiter.acquire();
      await promise;
      if (result) {
        rateLimiter.release();
      }
      internalResolver();
      return result;
    };
    return {
      acquirer,
      resolver,
      internalPromise
    };
  };

  test('Aqcuire too many and clear should fail those over limit', async () => {
    const rateLimiter = new RateLimiter(1);
    const { acquirer: fastAcquirer, resolver: fastResolver, internalPromise: fastInternalPromise } = createAcquirer(
      rateLimiter
    );
    const { acquirer: slowAcquirer, resolver: slowResolver, internalPromise: slowInternalPromise } = createAcquirer(
      rateLimiter
    );
    const fast = fastAcquirer();
    const slow = slowAcquirer();
    expect(rateLimiter.usedSlots()).toBe(1);
    rateLimiter.clearPendingRequests();
    fastResolver!();
    await fastInternalPromise;
    expect(rateLimiter.usedSlots()).toBe(0);
    slowResolver!();
    await slowInternalPromise;
    expect(rateLimiter.usedSlots()).toBe(0);
    expect(await fast).toBe(true);
    expect(await slow).toBe(false);
  });

  test('Slots should be in use until work is done', async () => {
    const rateLimiter = new RateLimiter(1);
    const { acquirer: fastAcquirer, resolver: fastResolver, internalPromise: fastInternalPromise } = createAcquirer(
      rateLimiter
    );
    const { acquirer: slowAcquirer, resolver: slowResolver, internalPromise: slowInternalPromise } = createAcquirer(
      rateLimiter
    );
    const fast = fastAcquirer();
    const slow = slowAcquirer();
    expect(rateLimiter.usedSlots()).toBe(1);
    fastResolver!();
    await fastInternalPromise;
    expect(rateLimiter.usedSlots()).toBe(1);
    slowResolver!();
    await slowInternalPromise;
    expect(rateLimiter.usedSlots()).toBe(0);
    expect(await fast).toBe(true);
    expect(await slow).toBe(true);
  });

  test('release() without acquire() throws', () => {
    const limiter = new RateLimiter(0);
    expect(() => limiter.release()).toThrowError();
  });
});
