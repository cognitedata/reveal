/*!
 * Copyright 2020 Cognite AS
 */
/**
 * A cache that keeps values that is most frequently used (MFU) rather than a more common
 * least recently used (LRU) approach.
 */
export class MostFrequentlyUsedCache<TKey, TValue> {
  private readonly _capacity: number;
  private readonly _cache = new Map<TKey, TValue>();
  private readonly _retrieves = new Map<TKey, number>();

  constructor(capacity: number) {
    this._capacity = capacity;
  }

  get(key: TKey): TValue | undefined {
    const retrieveCount = this._retrieves.get(key) || 0;
    this._retrieves.set(key, retrieveCount + 1);
    return this._cache.get(key);
  }

  set(key: TKey, value: TValue): boolean {
    if (this._cache.has(key)) {
      this._cache.set(key, value);
      return true;
    } else if (this._capacity < this._cache.size) {
      // Still room
      this._cache.set(key, value);
      return true;
    } else {
      // TODO 2020-12-05 larsmoa: Very inefficient way to set value.
      // We often set a value and discard it a moment later because its not
      // imporant. Fix this.
      this._cache.set(key, value);
      this.ensureWithinCapacity();
      return this._cache.has(key);
    }
  }

  private ensureWithinCapacity(): void {
    if (this._capacity < this._cache.size) {
      const keys = Array.from(this._cache.keys());
      // Figure out what to remove
      const keysForRemoval = keys
        .map(x => ({ key: x, retrivalCount: this._retrieves.get(x) || 0 }))
        .sort((a, b) => a.retrivalCount - b.retrivalCount)
        .slice(0, this._cache.size - this._capacity)
        .map(x => x.key);
      for (const key of keysForRemoval) {
        this._cache.delete(key);
      }
    }
  }
}
