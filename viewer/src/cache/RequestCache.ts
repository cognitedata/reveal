/*!
 * Copyright 2020 Cognite AS
 */

export type RequestDelegate<T_ID, T> = (id: T_ID) => Promise<T>;

export interface RequestCache<T_ID, T> {
  request: RequestDelegate<T_ID, T>;
  clearCache: () => void;
}
