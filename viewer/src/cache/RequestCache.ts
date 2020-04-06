/*!
 * Copyright 2020 Cognite AS
 */

export type RequestDelegate<Key, Data, Result> = (id: Key, data: Data) => Result;

export interface RequestCache<Key, Data, Result> {
  request(id: Key, data: Data): Result;
  clearCache(): void;
}
