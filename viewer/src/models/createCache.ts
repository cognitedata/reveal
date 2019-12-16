/*!
 * Copyright 2019 Cognite AS
 */

type RequestDelegate<T_ID, T> = (id: T_ID) => Promise<T>;

interface SimpleCache<T_ID, T> {
  request: RequestDelegate<T_ID, T>;
  clearCache: () => void;
}

export function createSimpleCache<T_ID, T>(request: RequestDelegate<T_ID, T>): SimpleCache<T_ID, T> {
  const results = new Map<T_ID, Promise<T>>();

  const requestCached = async (id: T_ID) => {
    const existing = results.get(id);
    if (existing) {
      return existing;
    }
    const result: Promise<T> = request(id);
    results.set(id, result);
    return result;
  };

  const clearCache = () => {
    results.clear();
  };

  return {
    request: requestCached,
    clearCache
  };
}
