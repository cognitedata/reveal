/*!
 * Copyright 2025 Cognite AS
 */
import { BatchLoader } from './BatchLoader';

/**
 * Mock implementation of BatchLoader for testing
 */
class TestBatchLoader extends BatchLoader<string, number> {
  private _fetchBatchCalls: string[][] = [];
  private _fetchBatchResults: Map<string, number> = new Map();
  private _fetchBatchDelay: number = 0;
  private _shouldThrow: boolean = false;
  private _throwMessage: string = '';

  constructor(batchSize: number = 20, batchDelayMs: number = 100) {
    super(batchSize, batchDelayMs);
  }

  /**
   * Set up mock results for batch fetching
   */
  public setMockResults(results: Map<string, number>): void {
    this._fetchBatchResults = results;
  }

  /**
   * Set a delay for fetch operations (to test timing)
   */
  public setFetchDelay(delayMs: number): void {
    this._fetchBatchDelay = delayMs;
  }

  /**
   * Configure the loader to throw errors
   */
  public setShouldThrow(shouldThrow: boolean, message: string = 'Mock error'): void {
    this._shouldThrow = shouldThrow;
    this._throwMessage = message;
  }

  /**
   * Get the history of batch calls for verification
   */
  public getFetchBatchCalls(): string[][] {
    return this._fetchBatchCalls;
  }

  /**
   * Reset tracking data
   */
  public reset(): void {
    this._fetchBatchCalls = [];
  }

  protected async fetchBatch(identifiers: string[]): Promise<Map<string, number>> {
    // Track this batch call
    this._fetchBatchCalls.push([...identifiers]);

    // Simulate network delay if configured
    if (this._fetchBatchDelay > 0) {
      await new Promise(resolve => setTimeout(resolve, this._fetchBatchDelay));
    }

    // Simulate error if configured
    if (this._shouldThrow) {
      throw new Error(this._throwMessage);
    }

    // Return mock results for the requested identifiers
    const results = new Map<string, number>();
    for (const id of identifiers) {
      const value = this._fetchBatchResults.get(id);
      if (value !== undefined) {
        results.set(id, value);
      }
    }
    return results;
  }

  protected getKeyForIdentifier(identifier: string): string {
    return identifier;
  }

  protected getDefaultResult(_identifier: string): number {
    // Default to -1 for missing items
    return -1;
  }
}

describe('BatchLoader', () => {
  describe('Basic batching functionality', () => {
    it('should batch multiple concurrent requests', async () => {
      const loader = new TestBatchLoader(3, 10);
      loader.setMockResults(
        new Map([
          ['a', 1],
          ['b', 2],
          ['c', 3]
        ])
      );

      // Make 3 concurrent requests
      const results = await Promise.all([loader.load('a'), loader.load('b'), loader.load('c')]);

      expect(results).toEqual([1, 2, 3]);
      expect(loader.getFetchBatchCalls().length).toBe(1);
      expect(loader.getFetchBatchCalls()[0]).toEqual(['a', 'b', 'c']);
    });

    it('should execute batch immediately when batch size is reached', async () => {
      const loader = new TestBatchLoader(2, 1000); // Large delay, but should trigger on size
      loader.setMockResults(
        new Map([
          ['a', 1],
          ['b', 2]
        ])
      );

      const start = Date.now();
      const results = await Promise.all([loader.load('a'), loader.load('b')]);
      const duration = Date.now() - start;

      expect(results).toEqual([1, 2]);
      expect(duration).toBeLessThan(500); // Should not wait for full delay
      expect(loader.getFetchBatchCalls().length).toBe(1);
    });

    it('should wait for batch delay when below batch size', async () => {
      const loader = new TestBatchLoader(5, 50);
      loader.setMockResults(new Map([['a', 1]]));

      const start = Date.now();
      const result = await loader.load('a');
      const duration = Date.now() - start;

      expect(result).toBe(1);
      expect(duration).toBeGreaterThanOrEqual(45); // Allow small timing variance
      expect(loader.getFetchBatchCalls().length).toBe(1);
    });
  });

  describe('Batch size limits', () => {
    it('should split requests into multiple batches when exceeding batch size', async () => {
      const loader = new TestBatchLoader(2, 10);
      loader.setMockResults(
        new Map([
          ['a', 1],
          ['b', 2],
          ['c', 3],
          ['d', 4]
        ])
      );

      // Make 4 requests with batch size of 2
      const results = await Promise.all([loader.load('a'), loader.load('b'), loader.load('c'), loader.load('d')]);

      expect(results).toEqual([1, 2, 3, 4]);
      expect(loader.getFetchBatchCalls().length).toBe(2);
      expect(loader.getFetchBatchCalls()[0]).toHaveLength(2);
      expect(loader.getFetchBatchCalls()[1]).toHaveLength(2);
    });

    it('should process batches sequentially', async () => {
      const loader = new TestBatchLoader(2, 10);
      loader.setFetchDelay(50); // Add delay to make sequential processing observable
      loader.setMockResults(
        new Map([
          ['a', 1],
          ['b', 2],
          ['c', 3],
          ['d', 4]
        ])
      );

      const start = Date.now();
      const results = await Promise.all([loader.load('a'), loader.load('b'), loader.load('c'), loader.load('d')]);
      const duration = Date.now() - start;

      expect(results).toEqual([1, 2, 3, 4]);
      // Should take at least 100ms (2 batches * 50ms each)
      expect(duration).toBeGreaterThanOrEqual(95);
      expect(loader.getFetchBatchCalls().length).toBe(2);
    });
  });

  describe('Error handling', () => {
    it('should reject all requests in a batch when fetch fails', async () => {
      const loader = new TestBatchLoader(3, 10);
      loader.setShouldThrow(true, 'Batch fetch failed');

      const promises = [loader.load('a'), loader.load('b'), loader.load('c')];

      await expect(Promise.all(promises)).rejects.toThrow('Batch fetch failed');
    });

    it('should handle subsequent batches after an error', async () => {
      const loader = new TestBatchLoader(2, 10);
      loader.setShouldThrow(true, 'First batch fails');

      // First batch should fail
      await expect(Promise.all([loader.load('a'), loader.load('b')])).rejects.toThrow('First batch fails');

      // Reset error state and try again
      loader.reset();
      loader.setShouldThrow(false);
      loader.setMockResults(
        new Map([
          ['c', 3],
          ['d', 4]
        ])
      );

      const results = await Promise.all([loader.load('c'), loader.load('d')]);
      expect(results).toEqual([3, 4]);
    });
  });

  describe('Default results', () => {
    it('should return default result when item not found in batch', async () => {
      const loader = new TestBatchLoader(3, 10);
      loader.setMockResults(
        new Map([
          ['a', 1],
          // 'b' is missing
          ['c', 3]
        ])
      );

      const results = await Promise.all([loader.load('a'), loader.load('b'), loader.load('c')]);

      expect(results).toEqual([1, -1, 3]); // -1 is the default from TestBatchLoader
    });

    it('should handle all items missing from batch', async () => {
      const loader = new TestBatchLoader(2, 10);
      loader.setMockResults(new Map()); // No results

      const results = await Promise.all([loader.load('a'), loader.load('b')]);

      expect(results).toEqual([-1, -1]);
    });
  });

  describe('Race condition handling', () => {
    it('should handle rapid concurrent requests without losing any', async () => {
      const loader = new TestBatchLoader(5, 20);
      const mockResults = new Map<string, number>();
      for (let i = 0; i < 20; i++) {
        mockResults.set(`item-${i}`, i);
      }
      loader.setMockResults(mockResults);

      // Fire off 20 concurrent requests rapidly
      const promises = Array.from({ length: 20 }, (_, i) => loader.load(`item-${i}`));
      const results = await Promise.all(promises);

      // Verify all results are correct
      expect(results).toEqual(Array.from({ length: 20 }, (_, i) => i));

      // Should have been split into 4 batches (20 items / 5 batch size)
      expect(loader.getFetchBatchCalls().length).toBe(4);
    });

    it('should handle requests arriving during batch processing', async () => {
      const loader = new TestBatchLoader(2, 10);
      loader.setFetchDelay(50); // First batch takes time
      loader.setMockResults(
        new Map([
          ['a', 1],
          ['b', 2],
          ['c', 3],
          ['d', 4]
        ])
      );

      // Start first batch
      const firstBatch = Promise.all([loader.load('a'), loader.load('b')]);

      // Wait a bit, then add more requests while first batch is processing
      await new Promise(resolve => setTimeout(resolve, 25));
      const secondBatch = Promise.all([loader.load('c'), loader.load('d')]);

      const [firstResults, secondResults] = await Promise.all([firstBatch, secondBatch]);

      expect(firstResults).toEqual([1, 2]);
      expect(secondResults).toEqual([3, 4]);
      expect(loader.getFetchBatchCalls().length).toBe(2);
    });
  });

  describe('Batch delay timing', () => {
    it('should reset timer when new requests arrive', async () => {
      const loader = new TestBatchLoader(5, 50);
      loader.setMockResults(
        new Map([
          ['a', 1],
          ['b', 2],
          ['c', 3]
        ])
      );

      // Start first request
      const promise1 = loader.load('a');

      // Wait 25ms, then add second request (should reset timer)
      await new Promise(resolve => setTimeout(resolve, 25));
      const promise2 = loader.load('b');

      // Wait another 35ms, add third request (should reset timer again)
      await new Promise(resolve => setTimeout(resolve, 35));
      const promise3 = loader.load('c');

      const results = await Promise.all([promise1, promise2, promise3]);

      expect(results).toEqual([1, 2, 3]);
      // Should be batched together despite arriving at different times
      expect(loader.getFetchBatchCalls().length).toBe(1);
      expect(loader.getFetchBatchCalls()[0]).toEqual(['a', 'b', 'c']);
    });
  });

  describe('Custom batch sizes and delays', () => {
    it('should respect custom batch size', async () => {
      const loader = new TestBatchLoader(10, 10); // Large batch size
      const mockResults = new Map<string, number>();
      for (let i = 0; i < 10; i++) {
        mockResults.set(`item-${i}`, i);
      }
      loader.setMockResults(mockResults);

      const promises = Array.from({ length: 10 }, (_, i) => loader.load(`item-${i}`));
      await Promise.all(promises);

      // All 10 should fit in one batch
      expect(loader.getFetchBatchCalls().length).toBe(1);
      expect(loader.getFetchBatchCalls()[0]).toHaveLength(10);
    });

    it('should respect custom batch delay', async () => {
      const loader = new TestBatchLoader(5, 100); // Long delay
      loader.setMockResults(new Map([['a', 1]]));

      const start = Date.now();
      await loader.load('a');
      const duration = Date.now() - start;

      expect(duration).toBeGreaterThanOrEqual(95); // Allow small variance
    });
  });

  describe('Key generation', () => {
    it('should use correct keys for result mapping', async () => {
      const loader = new TestBatchLoader(3, 10);
      loader.setMockResults(
        new Map([
          ['key-a', 100],
          ['key-b', 200],
          ['key-c', 300]
        ])
      );

      const results = await Promise.all([loader.load('key-a'), loader.load('key-b'), loader.load('key-c')]);

      expect(results).toEqual([100, 200, 300]);
    });
  });
});
