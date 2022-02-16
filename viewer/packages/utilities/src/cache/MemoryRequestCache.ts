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
  private readonly _removeCallback: ((value: Data) => void) | undefined;

  private static readonly CLEANUP_COUNT_TO_CAPACITY_RATIO = 1.0 / 5.0;

  constructor(
    maxElementsInCache: number = 50,
    removeCallback?: (value: Data) => void,
    defaultCleanupCount: number = 10
  ) {
    this._data = new Map();
    this._maxElementsInCache = maxElementsInCache;
    this._defaultCleanupCount = defaultCleanupCount;
    this._removeCallback = removeCallback;
  }

  has(id: Key): boolean {
    return this._data.has(id);
  }

  forceInsert(id: Key, data: Data): void {
    if (this.isFull()) {
      this.cleanCache(this._defaultCleanupCount);
    }
    this.insert(id, data);
  }

  insert(id: Key, data: Data): void {
    if (this._data.size < this._maxElementsInCache) {
      this._data.set(id, new TimestampedContainer(data));
    } else {
      throw new Error('Cache full, please clean Cache and retry adding data');
    }
  }

  remove(id: Key): void {
    if (this._removeCallback !== undefined) {
      const value = this._data.get(id);
      if (value !== undefined) {
        this._removeCallback(value.value);
      }
    }
    this._data.delete(id);
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

  cleanCache(count: number): void {
    const allResults = Array.from(this._data.entries());
    allResults.sort((left, right) => {
      return right[1].lastAccessTime - left[1].lastAccessTime;
    });
    for (let i = 0; i < count; i++) {
      const entry = allResults.pop();
      if (entry !== undefined) {
        this.remove(entry[0]);
      } else {
        return;
      }
    }
  }

  resize(cacheSize: number): void {
    this._maxElementsInCache = cacheSize;
    this._defaultCleanupCount = Math.max(cacheSize * MemoryRequestCache.CLEANUP_COUNT_TO_CAPACITY_RATIO, 1);

    if (this.isFull()) {
      this.cleanCache(this._data.size - this._maxElementsInCache);
    }
  }

  clear(): void {
    if (this._removeCallback !== undefined) {
      for (const value of this._data.values()) {
        this._removeCallback(value.value);
      }
    }
    this._data.clear();
  }
}
