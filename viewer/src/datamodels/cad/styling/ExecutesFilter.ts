/*!
 * Copyright 2021 Cognite AS
 */

export interface ExecutesFilter<T> {
  executeFilter: (filter: T) => Promise<void>;
  getFilter: () => T | undefined;
}
