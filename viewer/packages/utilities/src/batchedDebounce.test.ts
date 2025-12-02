/*!
 * Copyright 2025 Cognite AS
 */
import { batchedDebounce } from './batchedDebounce';
import { jest } from '@jest/globals';

describe(batchedDebounce.name, () => {
  jest.useFakeTimers();

  afterEach(() => {
    jest.clearAllTimers();
  });

  it('should batch multiple calls and resolve with correct results', async () => {
    const callback = jest.fn((items: number[]) => items.map(x => x * 2));
    const batched = batchedDebounce(callback, 100);

    const promise1 = batched(1);
    const promise2 = batched(2);
    const promise3 = batched(3);

    jest.advanceTimersByTime(100);
    await Promise.resolve();

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith([1, 2, 3]);

    const [result1, result2, result3] = await Promise.all([promise1, promise2, promise3]);
    expect(result1).toBe(2);
    expect(result2).toBe(4);
    expect(result3).toBe(6);
  });

  it('should create separate batches after wait period', async () => {
    const callback = jest.fn((items: number[]) => items.map(x => x + 1));
    const batched = batchedDebounce(callback, 100);

    const promise1 = batched(1);
    const promise2 = batched(2);

    jest.advanceTimersByTime(100);
    await Promise.resolve();

    const promise3 = batched(3);
    const promise4 = batched(4);

    jest.advanceTimersByTime(100);
    await Promise.resolve();

    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenNthCalledWith(1, [1, 2]);
    expect(callback).toHaveBeenNthCalledWith(2, [3, 4]);

    const results = await Promise.all([promise1, promise2, promise3, promise4]);
    expect(results).toEqual([2, 3, 4, 5]);
  });

  it('should reject all promises if callback throws', async () => {
    const callback = jest.fn(() => {
      throw new Error('Batch processing failed');
    });
    const batched = batchedDebounce(callback, 100);

    const promise1 = batched(1);
    const promise2 = batched(2);

    jest.advanceTimersByTime(100);
    await Promise.resolve();

    await expect(promise1).rejects.toThrow('Batch processing failed');
    await expect(promise2).rejects.toThrow('Batch processing failed');
  });

  it('should reject if callback returns mismatched result length', async () => {
    const callback = jest.fn((items: number[]) => items.slice(0, items.length - 1));
    const batched = batchedDebounce(callback, 100);

    const promise1 = batched(1);
    const promise2 = batched(2);

    jest.advanceTimersByTime(100);
    await Promise.resolve();

    await expect(promise1).rejects.toThrow('Batch result length mismatch');
    await expect(promise2).rejects.toThrow('Batch result length mismatch');
  });

  it('should cancel pending batches', async () => {
    const callback = jest.fn((items: number[]) => items.map(x => x * 2));
    const batched = batchedDebounce(callback, 100);

    const promise1 = batched(1);
    const promise2 = batched(2);

    batched.cancel();

    await expect(promise1).rejects.toThrow('Debounce cancelled');
    await expect(promise2).rejects.toThrow('Debounce cancelled');
    expect(callback).not.toHaveBeenCalled();
  });
});
