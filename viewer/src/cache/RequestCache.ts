/*!
 * Copyright 2020 Cognite AS
 */

export type RequestDelegate<Key, Data, Result> = (id: Key, data: Data) => Result;

export interface RequestCache<Key, Data, Result> {
  request: RequestDelegate<Key, Data, Result>;
  clearCache: () => void;
}
