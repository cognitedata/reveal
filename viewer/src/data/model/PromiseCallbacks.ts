/*!
 * Copyright 2020 Cognite AS
 */

export interface PromiseCallbacks<T> {
  success: (value: T) => void;
  fail: (message: string) => void;
}
