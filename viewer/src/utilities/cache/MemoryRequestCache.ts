/*!
 * Copyright 2020 Cognite AS
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
  // remove?: RemoveDelegate<Key, Result>;
}

export class MemoryRequestCache<Key, Data> implements RequestCache<Key, Data> {
  private readonly _maxElementsInCache: number;
  private readonly _data: Map<Key, TimestampedContainer<Data>>;

  constructor(options?: MemoryRequestCacheOptions) {
    this._data = new Map();
    this._maxElementsInCache = (options && options.maxElementsInCache) || 50;
  }

  has(id: Key) {
    return this._data.has(id);
  }

  add(id: Key, data: Data) {
    if (this._data.size < this._maxElementsInCache) {
      this._data.set(id, new TimestampedContainer(data));
    } else {
      throw new Error('Cache full, please clean Cache and retry adding data');
    }
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

  cleanCache(count: number) {
    const allResults = Array.from(this._data.entries());
    allResults.sort((left, right) => {
      return right[1].lastAccessTime - left[1].lastAccessTime;
    });
    for (let i = 0; i < count; i++) {
      const entry = allResults.pop();
      if (entry !== undefined) {
        this._data.delete(entry[0]);
      } else {
        return;
      }
    }
  }

  clear() {
    this._data.clear();
  }
}
