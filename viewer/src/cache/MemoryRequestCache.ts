/*!
 * Copyright 2020 Cognite AS
 */

import { RequestCache, RequestDelegate } from './RequestCache';

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

export class MemoryRequestCache<Key, Data, Result> implements RequestCache<Key, Data, Result> {
  private readonly _maxElementsInCache: number;
  private readonly _results: Map<Key, TimestampedContainer<Result>>;
  private readonly _request: RequestDelegate<Key, Data, Result>;

  constructor(request: RequestDelegate<Key, Data, Result>, maxElementsInCache: number = 50) {
    this._results = new Map();
    this._request = request;
    this._maxElementsInCache = maxElementsInCache;
  }

  request(id: Key, data: Data): Result {
    const existing = this._results.get(id);
    if (existing) {
      return existing.value;
    }

    this.cleanupCache();
    const value = ;
    const result = new TimestampedContainer<Result>(this._request(id, data));
    this._results.set(id, result);
    return result.value;
  }

  clearCache() {
    this._results.clear();
  }

  private cleanupCache() {
    const maxCacheSize = this._maxElementsInCache;
    if (this._results.size > maxCacheSize) {
      const allResults = Array.from(this._results.entries());
      allResults.sort((left, right) => {
        return right[1].lastAccessTime - left[1].lastAccessTime;
      });

      // Remove least recent access items
      let index = 0;
      while (this._results.size > maxCacheSize) {
        const toRemove = allResults[index++];
        this._results.delete(toRemove[0]);
      }
    }
  }
}
