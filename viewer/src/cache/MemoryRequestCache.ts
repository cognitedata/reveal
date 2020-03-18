/*!
 * Copyright 2020 Cognite AS
 */

import { RequestCache, RequestDelegate } from './RequestCache';

export class MemoryRequestCache<Key, Data, Result> implements RequestCache<Key, Data, Result> {
  private readonly _results: Map<Key, Result>;
  private readonly _request: RequestDelegate<Key, Data, Result>;
  constructor(request: RequestDelegate<Key, Data, Result>) {
    this._results = new Map();
    this._request = request;
  }

  request(id: Key, data: Data) {
    const existing = this._results.get(id);
    if (existing) {
      return existing;
    }
    const result: Result = this._request(id, data);
    this._results.set(id, result);
    return result;
  }

  clearCache() {
    this._results.clear();
  }
}
