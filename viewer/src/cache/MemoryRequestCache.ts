/*!
 * Copyright 2020 Cognite AS
 */

import { RequestCache, RequestDelegate } from './RequestCache';

export class MemoryRequestCache<T_ID, T> implements RequestCache<T_ID, T> {
  private readonly _results: Map<T_ID, Promise<T>>;
  private readonly _request: RequestDelegate<T_ID, T>;
  constructor(request: RequestDelegate<T_ID, T>) {
    this._results = new Map();
    this._request = request;
  }

  async request(id: T_ID) {
    const existing = this._results.get(id);
    if (existing) {
      return existing;
    }
    const result: Promise<T> = this._request(id);
    this._results.set(id, result);
    return result;
  }

  async clearCache() {
    this._results.clear();
  }
}
