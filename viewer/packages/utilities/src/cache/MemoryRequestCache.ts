/*!
 * Copyright 2021 Cognite AS
 */

import { RequestCache } from './RequestCache';

class TimestampedContainer<T> {
  private _lastAccessTime: number;
  private readonly _value: T;

  constructor(value: T) {
    this._value = value;
    this._lastAccessTime = Date.now();
  }

  get value() {
    this.touch();
    return this._value;
  }

  get lastAccessTime() {
    return this._lastAccessTime;
  }

  private touch() {
    this._lastAccessTime = Date.now();
  }
}

export interface MemoryRequestCacheOptions {
  maxElementsInCache?: number;
}

export class MemoryRequestCache<Key, Data> implements RequestCache<Key, Data> {
  private _maxElementsInCache: number;
  private readonly _data: Map<Key, TimestampedContainer<Data>>;
  private _defaultCleanupCount: number;
  private readonly _disposeCallback?: (data: Data) => void;
  private readonly _referenceCounts: Map<Key, number> = new Map();

  private static readonly CLEANUP_COUNT_TO_CAPACITY_RATIO = 1.0 / 5.0;

  constructor(maxElementsInCache: number, defaultCleanupCount: number, disposeCallback?: (data: Data) => void) {
    this._data = new Map();
    this._maxElementsInCache = maxElementsInCache;
    this._defaultCleanupCount = Math.max(defaultCleanupCount, 1);
    this._disposeCallback = disposeCallback;
  }

  has(id: Key): boolean {
    return this._data.has(id);
  }

  forceInsert(id: Key, data: Data): void {
    if (this.isFull()) {
      this.cleanCache(this._defaultCleanupCount);

      // If cache is still full after normal cleaning (all items referenced), force-clean
      if (this.isFull()) {
        this.cleanCache(this._defaultCleanupCount, true);
      }
    }

    this.insert(id, data);
  }

  insert(id: Key, data: Data): void {
    if (this._data.size < this._maxElementsInCache) {
      this._data.set(id, new TimestampedContainer(data));
    } else if (this._maxElementsInCache > 0) {
      throw new Error('Cache full, please clean Cache and retry adding data');
    }
  }

  remove(id: Key): void {
    const value = this._data.get(id);
    if (value !== undefined) {
      if (this._disposeCallback) {
        this._disposeCallback(value.value);
      }
    }
    this._data.delete(id);
    this._referenceCounts.delete(id);
  }

  get(id: Key): Data {
    const data = this._data.get(id);
    if (data !== undefined) {
      // Don't really like the touch for lastTime being hidden within a get function. Should we maybe make a
      // TimeConstrainedCache interface where the geter is called something like getAndUpdateTimestamp for clarity?
      return data.value;
    }
    throw new Error(`Cache element ${id} does not exist`);
  }

  isFull(): boolean {
    return this._data.size >= this._maxElementsInCache;
  }

  cleanCache(count: number, forceRemoval: boolean = false): void {
    const allResults = Array.from(this._data.entries());

    const cleanableItems = forceRemoval ? allResults : allResults.filter(([key]) => this.getReferenceCount(key) === 0);

    cleanableItems.sort((left, right) => {
      return right[1].lastAccessTime - left[1].lastAccessTime;
    });

    for (let i = 0; i < count; i++) {
      const entry = cleanableItems.pop();
      if (entry !== undefined) {
        this.remove(entry[0]);
      } else {
        return;
      }
    }
  }

  /**
   * Adds a reference to the cached item. Items with active references will not be disposed
   * until all references are removed.
   * @param id The cache key to add a reference to
   */
  addReference(id: Key): void {
    const currentCount = this._referenceCounts.get(id) ?? 0;
    this._referenceCounts.set(id, currentCount + 1);
  }

  /**
   * Removes a reference to the cached item. Items remain in cache even when
   * reference count reaches 0, allowing for potential reuse. Disposal only
   * happens during cache cleanup when memory pressure exists.
   * @param id The cache key to remove a reference from
   */
  removeReference(id: Key): void {
    const currentCount = this._referenceCounts.get(id) ?? 0;
    if (currentCount <= 1) {
      // Set count to 0 but keep item in cache for potential reuse
      this._referenceCounts.set(id, 0);
    } else {
      // Decrement reference count
      this._referenceCounts.set(id, currentCount - 1);
    }
  }

  /**
   * Gets the current reference count for a cached item.
   * @param id The cache key to get reference count for
   * @returns The number of active references, or 0 if not found
   */
  getReferenceCount(id: Key): number {
    return this._referenceCounts.get(id) ?? 0;
  }

  resize(cacheSize: number): void {
    this._maxElementsInCache = cacheSize;
    this._defaultCleanupCount = Math.max(cacheSize * MemoryRequestCache.CLEANUP_COUNT_TO_CAPACITY_RATIO, 1);

    if (this.isFull()) {
      this.cleanCache(this._data.size - this._maxElementsInCache);
    }
  }

  clear(): void {
    if (this._disposeCallback) {
      for (const container of this._data.values()) {
        this._disposeCallback(container.value);
      }
    }
    this._data.clear();
    this._referenceCounts.clear();
  }
}
